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

type Message = Database['public']['Tables']['messages']['Row'] & {
  isOptimistic?: true;
};
type GroupMessage = Database['public']['Tables']['group_messages']['Row'] & {
  isOptimistic?: true;
};

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
  // Separate maps for individual and group chats
  const individualMessagesData = new Map<
    string,
    Writable<Message[] | undefined | string>
  >();
  const groupMessagesData = new Map<
    string,
    Writable<GroupMessage[] | undefined | string>
  >();

  // Optimistic maps: Message[] with isOptimistic: true for individual, GroupMessage[] with isOptimistic: true for group
  const individualOptimisticMessages = new Set<string>();
  const groupOptimisticMessages = new Set<string>();

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
            handleGroupChatMessage(payload.event, payload.payload);
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

    const isGroup = false;
    switch (event) {
      case 'INSERT':
        if (
          payload.operation === 'INSERT' &&
          payload.table === 'messages' &&
          payload.record
        ) {
          const message = payload.record as Message;
          const otherId =
            message.from_id === currentUserId ? message.to_id : message.from_id;
          updateChatOverview(isGroup, otherId);
          addMessageToChat(otherId, { message, isGroup });
        }
        break;
      case 'UPDATE':
        if (
          payload.operation === 'UPDATE' &&
          payload.table === 'messages' &&
          payload.record
        ) {
          const message = payload.record as Message;
          const otherId =
            message.from_id === currentUserId ? message.to_id : message.from_id;
          updateMessageInChat(otherId, { message, isGroup });
          updateChatOverview(isGroup, otherId);
        }
        break;
      case 'DELETE':
        if (
          payload.operation === 'DELETE' &&
          payload.table === 'messages' &&
          payload.old_record
        ) {
          const message = payload.old_record as Message;
          const otherId =
            message.from_id === currentUserId ? message.to_id : message.from_id;
          removeMessageFromChat(otherId, message.id, isGroup);
          updateChatOverview(isGroup, otherId);
        }
        break;
    }
  }

  function handleGroupChatMessage(event: string, payload: any) {
    if (!payload || typeof payload !== 'object') return;

    const isGroup = true;
    switch (event) {
      case 'INSERT':
        if (
          payload.operation === 'INSERT' &&
          payload.table === 'group_messages' &&
          payload.record
        ) {
          const message = payload.record as GroupMessage;
          addMessageToChat(message.group_id, { message, isGroup });
          updateChatOverview(isGroup, message.group_id);
        }
        break;
      case 'UPDATE':
        if (
          payload.operation === 'UPDATE' &&
          payload.table === 'group_messages' &&
          payload.record
        ) {
          const message = payload.record as GroupMessage;
          updateMessageInChat(message.group_id, { message, isGroup });
          updateChatOverview(isGroup, message.group_id);
        }
        break;
      case 'DELETE':
        if (
          payload.operation === 'DELETE' &&
          payload.table === 'group_messages' &&
          payload.old_record
        ) {
          const message = payload.old_record as GroupMessage;
          removeMessageFromChat(message.group_id, message.id, isGroup);
          updateChatOverview(isGroup, message.group_id);
        }
        break;
    }
  }

  function addMessageToChat(
    chatId: string,
    {
      message,
      isGroup
    }:
      | {
          message: Message;
          isGroup: false;
        }
      | {
          message: GroupMessage;
          isGroup: true;
        }
  ) {
    if (isGroup) {
      groupMessagesData.get(chatId)?.update(d => {
        if (typeof d !== 'object') return d;
        if (groupOptimisticMessages.delete(message.id)) {
          const msg = d.find(m => m.id === message.id);
          if (msg) {
            Object.assign(msg, message);
            delete msg.isOptimistic;
          } else d.push(message);
        } else d.push(message);
        return d;
      });
    } else {
      individualMessagesData.get(chatId)?.update(d => {
        if (typeof d !== 'object') return d;
        if (individualOptimisticMessages.delete(message.id)) {
          const msg = d.find(m => m.id === message.id);
          if (msg) {
            Object.assign(msg, message);
            delete msg.isOptimistic;
          } else d.push(message);
        } else d.push(message);
        return d;
      });
    }
  }

  function updateMessageInChat(
    chatId: string,
    {
      message,
      isGroup
    }:
      | {
          message: Message;
          isGroup: false;
        }
      | {
          message: GroupMessage;
          isGroup: true;
        }
  ) {
    (isGroup ? groupMessagesData : individualMessagesData)
      .get(chatId)
      ?.update(d => {
        if (Array.isArray(d))
          return d.map(m => (m.id === message.id ? message : m));
        return d as any;
      });
  }

  function removeMessageFromChat(
    chatId: string,
    messageId: string,
    isGroup: boolean
  ) {
    (isGroup ? groupMessagesData : individualMessagesData)
      .get(chatId)
      ?.update(d => {
        if (Array.isArray(d)) return d.filter(m => m.id !== messageId);
        return d as any;
      });
  }

  function updateChatOverview(isGroup: boolean, id: string) {
    updateOverview(overview => {
      if (!overview) return overview;
      const ov = overview.dataMap[(isGroup ? '-' : '@') + id];
      const msgStore = isGroup
        ? groupMessagesData.get(id)
        : individualMessagesData.get(id);
      if (!msgStore) ov.typ = null as any;
      else {
        msgStore.subscribe(msgs => {
          if (Array.isArray(msgs)) {
            const msg = msgs.at(-1);
            if (msg) {
              ov.typ = msg.typ;
              ov.data = msg.data;
              ov.msg_created_at = msg.created_at;
              ov.msg_edited_at = msg.edited_at;
            } else ov.typ = null as any;
          } else ov.typ = null as any;
        });
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
          overviewDataMap = Object.fromEntries(
            overview.map(i => [(i.is_group ? '-' : '@') + i.id, i])
          );
          setOverview({ data: overviewData, dataMap: overviewDataMap });
        }
      } catch (error) {
        captureException(error, { tags: { action: 'fetch_chat_overview' } });
      }
    }
  };

  // Messages functionality
  type FetchReturnType =
    | ({ isGroup: true } & Readable<Message[] | undefined | string>)
    | ({ isGroup: false } & Readable<GroupMessage[] | undefined | string>);
  const messages = {
    fetch(chatSlug: string, userId: string): FetchReturnType {
      const isGroup = !chatSlug.startsWith('@');
      const chatId = chatSlug.substring(1);
      if (!isBrowser() || !userId) return { isGroup, ...readable(undefined) };

      let store: Writable<any> | undefined = isGroup
        ? individualMessagesData.get(chatId)
        : groupMessagesData.get(chatId);
      if (!store) {
        store = writable<any>(undefined);
        (isGroup ? groupMessagesData : individualMessagesData).set(chatId, store);
      }

      const currentValue = get(store);
      if (Array.isArray(currentValue)) {
        return { isGroup, subscribe: store.subscribe };
      }

      store.set(undefined);

      let promise = isGroup
        ? supabase.from('group_messages').select().eq('group_id', chatId)
        : supabase
            .from('messages')
            .select()
            .or(
              `and(to_id.eq.${userId},from_id.eq.${chatId}),and(to_id.eq.${chatId},from_id.eq.${userId})`
            );
      promise.then(({ data, error }) => {
        if (error) {
          captureException(error, { tags: { supabase: 'messages' } });
          store.set(error.message);
        } else {
          store.set(data);
        }
      });

      return { isGroup, subscribe: store.subscribe };
    },

    async sendMessage(
      isGroup: boolean,
      toId: string,
      content: string,
      orgId: string,
      userId: string
    ): Promise<boolean> {
      try {
        const messageId = nanoid();
        let store;
        if (isGroup) {
          store = groupMessagesData.get(toId);
          const msg = {
            id: messageId,
            by_id: userId,
            group_id: toId,
            org_id: orgId,
            typ: 'text' as const,
            data: content,
            created_at: new Date().toISOString(),
            edited_at: null,
            isOptimistic: true as const
          };
          if (store) {
            store.update(messages => {
              if (Array.isArray(messages)) {
                messages.push(msg);
                return messages;
              }
              return [msg];
            });
          }
          groupOptimisticMessages.add(messageId);
        } else {
          const msg = {
            id: messageId,
            from_id: userId,
            to_id: toId,
            org_id: orgId,
            typ: 'text' as const,
            data: content,
            created_at: new Date().toISOString(),
            edited_at: null,
            isOptimistic: true as const
          };
          store = individualMessagesData.get(toId);
          if (store) {
            store.update(messages => {
              if (Array.isArray(messages)) {
                messages.push(msg);
                return messages;
              }
              return [msg];
            });
          }
          individualOptimisticMessages.add(messageId);
        }

        // Send actual message
        let error;
        if (isGroup) {
          ({ error } = await supabase.rpc('send_group_chat_message', {
            msg_id: messageId,
            data: content,
            typ: 'text',
            group_id: toId,
            org_id: orgId
          }));
        } else {
          ({ error } = await supabase.rpc('send_chat_message', {
            msg_id: messageId,
            data: content,
            typ: 'text',
            to_id: toId,
            org_id: orgId
          }));
        }

        if (error) {
          if (
            (isGroup
              ? groupOptimisticMessages
              : individualOptimisticMessages
            ).delete(messageId) &&
            store
          )
            store.update(messages => {
              if (Array.isArray(messages)) {
                return messages.filter(m => m.id !== messageId) as any;
              }
              return messages;
            });

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
      const isGroup = chatSlug.charAt(0) !== '@';
      const chatId = chatSlug.substring(1);
      if (isGroup) {
        const store = groupMessagesData.get(chatId);
        if (store) {
          store.set(undefined);
          groupMessagesData.delete(chatSlug);
        }
      } else {
        const store = individualMessagesData.get(chatId);
        if (store) {
          store.set(undefined);
          individualMessagesData.delete(chatSlug);
        }
      }
    },

    clearAll() {
      for (const [_, store] of individualMessagesData) {
        store.set(undefined);
      }
      for (const [_, store] of groupMessagesData) {
        store.set(undefined);
      }
      individualMessagesData.clear();
      groupMessagesData.clear();
      individualOptimisticMessages.clear();
      groupOptimisticMessages.clear();
    }
  };

  // Cleanup function
  function cleanup() {
    cleanupRealtime();
    messages.clearAll();
    currentOrgId = null;
    currentUserId = null;
  }

  async function init(orgId: string, userId: string) {
    if (currentOrgId !== orgId || currentUserId !== userId) {
      cleanup();
      await chatOverview.fetchOverview(orgId, userId);
      initializeRealtime(orgId, userId);
      currentOrgId = orgId;
      currentUserId = userId;
      return true;
    }
    initializeRealtime(orgId, userId);
    return false;
  }

  return {
    chatOverview,
    messages,
    init,
    cleanup,
    cleanupRealtime
  };
}

export const chat = createChatStore();

// Legacy exports for backward compatibility
export const chatOverview = chat.chatOverview;
export const messages = chat.messages;
