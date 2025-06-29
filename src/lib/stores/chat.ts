import {
  get,
  readable,
  writable,
  type Readable,
  type Writable
} from 'svelte/store';
import { page } from '$app/stores';
import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';
import { toast } from 'svelte-sonner';
import { nanoid } from 'nanoid';

const supabase = createBrowserClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

type DbChatOverview =
  Database['public']['Functions']['get_chat_overview']['Returns'][number];
type ChatOverview = Omit<DbChatOverview, 'msg_edited_at'> & {
  msg_edited_at: DbChatOverview['msg_edited_at'] | null;
};

type Message = Database['public']['Tables']['messages']['Row'];
type GroupMessage = Database['public']['Tables']['group_messages']['Row'];

type ChatMessage = Message & { isOptimistic?: true };

function createChatStore() {
  // Chat overview data
  let overviewDataMap: Record<string, ChatOverview> = {};
  let overviewData: ChatOverview[] = [];
  let currentOrgId: string | null = null;

  const {
    set: setOverview,
    subscribe: subscribeOverview,
    update: updateOverview
  } = writable<{
    data: typeof overviewData;
    dataMap: typeof overviewDataMap;
  } | null>(null);

  // Messages data per chat
  const messagesData = new Map<
    string,
    Writable<ChatMessage[] | undefined | string>
  >();
  const optimisticMessages = new Map<string, ChatMessage[]>();

  // Realtime subscriptions
  const realtimeSubscriptions = new Map<string, () => void>();
  let currentUserId: string | null = null;

  function initializeRealtime(orgId: string, userId: string) {
    if (currentUserId === userId && currentOrgId === orgId) return;

    // Clean up existing subscriptions
    cleanupRealtime();

    currentUserId = userId;
    currentOrgId = orgId;

    // Subscribe to individual chat messages
    const individualChatChannel = supabase
      .channel(`chat:${orgId}:${userId}`, { config: { private: true } })
      .on('broadcast', { event: '*' }, payload => {
        handleIndividualChatMessage(payload.event, payload.payload);
      })
      .subscribe();

    realtimeSubscriptions.set(`chat:${orgId}:${userId}`, () => {
      supabase.removeChannel(individualChatChannel);
    });

    // Subscribe to group chat channels for all groups the user is a member of
    subscribeToGroupChats(orgId, userId);
  }

  async function subscribeToGroupChats(orgId: string, userId: string) {
    try {
      const { data: groupMemberships, error } = await supabase
        .from('chat_group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (error) {
        captureException(error, { tags: { supabase: 'chat_group_members' } });
        return;
      }

      for (const membership of groupMemberships) {
        const groupChannel = supabase
          .channel(`chat-group:${orgId}:${membership.group_id}`, {
            config: { private: true }
          })
          .on('broadcast', { event: '*' }, payload => {
            handleGroupChatMessage(
              payload.event,
              payload.payload,
              membership.group_id
            );
          })
          .subscribe();

        realtimeSubscriptions.set(
          `chat-group:${orgId}:${membership.group_id}`,
          () => {
            supabase.removeChannel(groupChannel);
          }
        );
      }
    } catch (error) {
      captureException(error, { tags: { action: 'subscribe_group_chats' } });
    }
  }

  function handleIndividualChatMessage(event: string, payload: any) {
    if (!payload || typeof payload !== 'object') return;

    switch (event) {
      case 'INSERT':
        if (
          payload.operation === 'INSERT' &&
          payload.table === 'messages' &&
          payload.record
        ) {
          const message = payload.record as Message;
          addMessageToChat(getIndividualChatSlug(message), message);
          updateChatOverview(message);
        }
        break;
      case 'UPDATE':
        if (
          payload.operation === 'UPDATE' &&
          payload.table === 'messages' &&
          payload.record
        ) {
          const message = payload.record as Message;
          updateMessageInChat(getIndividualChatSlug(message), message);
        }
        break;
      case 'DELETE':
        if (
          payload.operation === 'DELETE' &&
          payload.table === 'messages' &&
          payload.old_record
        ) {
          const message = payload.old_record as Message;
          removeMessageFromChat(getIndividualChatSlug(message), message.id);
        }
        break;
    }
  }

  function handleGroupChatMessage(event: string, payload: any, groupId: string) {
    if (!payload || typeof payload !== 'object') return;

    switch (event) {
      case 'INSERT':
        if (
          payload.operation === 'INSERT' &&
          payload.table === 'group_messages' &&
          payload.record
        ) {
          const message = payload.record as GroupMessage;
          const chatMessage = convertGroupMessageToChatMessage(message);
          addMessageToChat(`-${groupId}`, chatMessage);
          updateChatOverviewForGroup(message, groupId);
        }
        break;
      case 'UPDATE':
        if (
          payload.operation === 'UPDATE' &&
          payload.table === 'group_messages' &&
          payload.record
        ) {
          const message = payload.record as GroupMessage;
          const chatMessage = convertGroupMessageToChatMessage(message);
          updateMessageInChat(`-${groupId}`, chatMessage);
        }
        break;
      case 'DELETE':
        if (
          payload.operation === 'DELETE' &&
          payload.table === 'group_messages' &&
          payload.old_record
        ) {
          const message = payload.old_record as GroupMessage;
          removeMessageFromChat(`-${groupId}`, message.id);
        }
        break;
    }
  }

  function getIndividualChatSlug(message: Message): string {
    if (!currentUserId) return '';
    return message.from_id === currentUserId
      ? `@${message.to_id}`
      : `@${message.from_id}`;
  }

  function convertGroupMessageToChatMessage(
    groupMessage: GroupMessage
  ): ChatMessage {
    return {
      id: groupMessage.id,
      from_id: groupMessage.by_id,
      to_id: groupMessage.group_id,
      org_id: groupMessage.org_id,
      typ: groupMessage.typ,
      data: groupMessage.data,
      created_at: groupMessage.created_at,
      edited_at: groupMessage.edited_at
    };
  }

  function addMessageToChat(chatSlug: string, message: ChatMessage) {
    const store = messagesData.get(chatSlug);
    if (store) {
      store.update(messages => {
        if (Array.isArray(messages)) {
          // Remove optimistic message if it exists
          const optimistic = optimisticMessages.get(chatSlug) || [];
          const optimisticIndex = optimistic.findIndex(
            opt => opt.data === message.data && opt.from_id === message.from_id
          );

          if (optimisticIndex !== -1) {
            optimistic.splice(optimisticIndex, 1);
            optimisticMessages.set(chatSlug, optimistic);
          }

          // Add the real message
          return [
            ...messages.filter(m => !('isOptimistic' in m) || m.id !== message.id),
            message
          ].sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
        return messages;
      });
    }
  }

  function updateMessageInChat(chatSlug: string, message: ChatMessage) {
    const store = messagesData.get(chatSlug);
    if (store) {
      store.update(messages => {
        if (Array.isArray(messages)) {
          return messages.map(m => (m.id === message.id ? message : m));
        }
        return messages;
      });
    }
  }

  function removeMessageFromChat(chatSlug: string, messageId: string) {
    const store = messagesData.get(chatSlug);
    if (store) {
      store.update(messages => {
        if (Array.isArray(messages)) {
          return messages.filter(m => m.id !== messageId);
        }
        return messages;
      });
    }
  }

  function updateChatOverview(message: Message) {
    updateOverview(overview => {
      if (!overview) return overview;

      const chatSlug = getIndividualChatSlug(message);
      const existingChat = overview.dataMap[chatSlug];

      if (existingChat) {
        const updatedChat = {
          ...existingChat,
          typ: message.typ,
          data: message.data,
          msg_created_at: message.created_at,
          msg_edited_at: message.edited_at
        };

        return {
          data: overview.data.map(chat =>
            chat.slug === chatSlug ? updatedChat : chat
          ),
          dataMap: { ...overview.dataMap, [chatSlug]: updatedChat }
        };
      }

      return overview;
    });
  }

  function updateChatOverviewForGroup(message: GroupMessage, groupId: string) {
    updateOverview(overview => {
      if (!overview) return overview;

      const chatSlug = `-${groupId}`;
      const existingChat = overview.dataMap[chatSlug];

      if (existingChat) {
        const updatedChat = {
          ...existingChat,
          typ: message.typ,
          data: message.data,
          msg_created_at: message.created_at,
          msg_edited_at: message.edited_at
        };

        return {
          data: overview.data.map(chat =>
            chat.slug === chatSlug ? updatedChat : chat
          ),
          dataMap: { ...overview.dataMap, [chatSlug]: updatedChat }
        };
      }

      return overview;
    });
  }

  function cleanupRealtime() {
    for (const [key, cleanup] of realtimeSubscriptions) {
      cleanup();
    }
    realtimeSubscriptions.clear();
  }

  // Chat overview functionality
  const chatOverview = {
    subscribe: subscribeOverview,
    async fetchOverview(orgId: string, userId: string) {
      if (!isBrowser()) return;

      if (currentOrgId !== orgId) {
        currentOrgId = orgId;
        overviewDataMap = {};
        overviewData = [];
        setOverview(null);
      }

      try {
        const { data: overview, error } = await supabase.rpc('get_chat_overview', {
          org_id: orgId
        });

        if (error) {
          captureException(error, { tags: { supabase: 'get_chat_overview' } });
          toast.error('Could not get chat overview', {
            description: error.message
          });
        } else {
          overviewData = overview;
          overviewDataMap = Object.fromEntries(overview.map(i => [i.slug, i]));
          setOverview({ data: overviewData, dataMap: overviewDataMap });

          // Initialize realtime after fetching overview
          initializeRealtime(orgId, userId);
        }
      } catch (error) {
        captureException(error, { tags: { action: 'fetch_chat_overview' } });
      }
    }
  };

  // Messages functionality
  const messages = {
    fetch(chatSlug: string): Readable<ChatMessage[] | undefined | string> {
      if (!isBrowser()) return readable(undefined);

      let store = messagesData.get(chatSlug);
      if (!store) {
        store = writable<ChatMessage[] | undefined | string>(undefined);
        messagesData.set(chatSlug, store);
      }

      const currentValue = get(store);
      if (Array.isArray(currentValue)) {
        return { subscribe: store.subscribe };
      }

      store.set(undefined);

      supabase.rpc('get_messages', { slug: chatSlug }).then(({ data, error }) => {
        if (error) {
          captureException(error, { tags: { supabase: 'messages' } });
          store!.set(error.message);
        } else {
          store!.set(data);
        }
      });

      return { subscribe: store.subscribe };
    },

    async sendMessage(
      chatSlug: string,
      content: string,
      orgId: string,
      userId: string
    ): Promise<boolean> {
      try {
        const messageId = nanoid();
        const isGroup = chatSlug.startsWith('-');

        // Create optimistic message
        const optimisticMessage: ChatMessage = {
          id: messageId,
          from_id: userId,
          to_id: isGroup ? '' : chatSlug.substring(1),
          org_id: orgId,
          typ: 'text',
          data: content,
          created_at: new Date().toISOString(),
          edited_at: null,
          isOptimistic: true
        };

        // Add optimistic message to store
        const store = messagesData.get(chatSlug);
        if (store) {
          store.update(messages => {
            if (Array.isArray(messages)) {
              return [...messages, optimisticMessage];
            }
            return [optimisticMessage];
          });
        }

        // Track optimistic message
        const optimistic = optimisticMessages.get(chatSlug) || [];
        optimistic.push(optimisticMessage);
        optimisticMessages.set(chatSlug, optimistic);

        // Send actual message
        let error;
        if (isGroup) {
          const groupId = chatSlug.substring(1);
          ({ error } = await supabase.rpc('send_group_chat_message', {
            msg_id: messageId,
            data: content,
            typ: 'text',
            group_id: groupId,
            org_id: orgId
          }));
        } else {
          const toId = chatSlug.substring(1);
          ({ error } = await supabase.rpc('send_chat_message', {
            msg_id: messageId,
            data: content,
            typ: 'text',
            to_id: toId,
            org_id: orgId
          }));
        }

        if (error) {
          // Remove optimistic message on error
          const optimisticList = optimisticMessages.get(chatSlug) || [];
          const index = optimisticList.findIndex(m => m.id === messageId);
          if (index !== -1) {
            optimisticList.splice(index, 1);
            optimisticMessages.set(chatSlug, optimisticList);
          }

          if (store) {
            store.update(messages => {
              if (Array.isArray(messages)) {
                return messages.filter(m => m.id !== messageId);
              }
              return messages;
            });
          }

          throw error;
        }

        return true;
      } catch (error) {
        captureException(error, { tags: { action: 'send_message' } });
        toast.error('Could not send message', {
          description: (error as any)?.message || 'An unknown error occurred'
        });
        return false;
      }
    },

    removeChat(chatSlug: string) {
      const store = messagesData.get(chatSlug);
      if (store) {
        store.set(undefined);
        messagesData.delete(chatSlug);
      }
      optimisticMessages.delete(chatSlug);
    },

    clearAll() {
      for (const [_, store] of messagesData) {
        store.set(undefined);
      }
      messagesData.clear();
      optimisticMessages.clear();
    }
  };

  // Cleanup function
  function cleanup() {
    cleanupRealtime();
    messages.clearAll();
    currentOrgId = null;
    currentUserId = null;
  }

  return {
    chatOverview,
    messages,
    cleanup
  };
}

export const chat = createChatStore();

// Legacy exports for backward compatibility
export const chatOverview = chat.chatOverview;
export const messages = chat.messages;
