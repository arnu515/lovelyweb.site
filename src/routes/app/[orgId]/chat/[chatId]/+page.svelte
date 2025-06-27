<script lang="ts">
  import { afterUpdate } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import ChatInfoSidebar from './ChatInfoSidebar.svelte';
  import {
    Send,
    Paperclip,
    Mic,
    Phone,
    Video,
    MoreVertical,
    Smile,
    Image as ImageIcon,
    Sparkles,
    Volume2,
    FileEdit as Edit3,
    ArrowLeft,
    CheckCheck,
    Loader2,
    MessageCircle,
    Info
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { page } from '$app/stores';
  import { chatOverview, messages as msgStore } from '$lib/stores/chat.js';
  import { derived } from 'svelte/store';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL
  } from '$env/static/public';
  import { createBrowserClient } from '@supabase/ssr';
  import type { Database } from '$lib/database.types.js';
  import { toast } from 'svelte-sonner';

  export let data;
  const user = data.auth.user!;

  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  let messageInput = '';
  let messagesContainer: HTMLElement;
  let fileInput: HTMLInputElement;
  let showChatInfo = false;

  const currentChat = derived(
    [page, chatOverview],
    ([
      {
        params: { chatId }
      },
      co
    ]) => (co ? co.dataMap[chatId] : null)
  );
  $: orgId = $page.params.orgId;

  $: messages = msgStore.fetch($page.params.chatId);
  $: if (messages) console.log($messages);

  let msgQueue: [number, string][] = [];

  function formatMessageTime(date: Date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  function formatDateHeader(date: Date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  function shouldShowDateHeader(currentMsg: any, prevMsg: any) {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  }

  async function sendMessage() {
    if (!messageInput.trim()) return;
    let id = Math.random();

    const content = messageInput;
    messageInput = '';
    msgQueue = [...msgQueue, [id, content]];

    try {
      const res = await fetch('?', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', content }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error((await res.json()).error);
    } catch (e) {
      toast.error('Could not send messge', {
        description: (e as any)?.message || 'An unknown error occured'
      });
    }
    msgQueue = msgQueue.filter(([_id]) => _id !== id);
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleFileUpload() {
    fileInput.click();
  }

  function handleFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      // Handle file upload
      console.log('Files selected:', files);
    }
  }

  afterUpdate(() => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });

  function getGroupAvatarUrl(gid: string, avatar_type: string) {
    if (avatar_type !== 'svg' && avatar_type !== 'webp') return null;
    return supabase.storage
      .from('avatars')
      .getPublicUrl(`/org/${orgId}/group/${gid}.${avatar_type}`).data.publicUrl;
  }
</script>

<svelte:head>
  <title>{$currentChat?.name || 'Loading...'} - Chat - lovelyweb.site</title>
</svelte:head>

{#if $currentChat === undefined || typeof messages === 'undefined' || typeof $messages === 'string'}
  <div class="mx-auto my-10 flex max-w-screen-md p-4">
    <div class="glass dark:glass-dark rounded-2xl p-8">
      <h1 class="mb-4 text-xl">
        {$currentChat === undefined || typeof messages === 'string'
          ? '404 Page Not Found'
          : 'Could not fetch messages'}
      </h1>
      <p class="font-mono text-lg text-red-500">
        {$currentChat === undefined || typeof messages === 'string'
          ? 'A chat/group with the given ID could not be found'
          : $messages}
      </p>
      <p class="my-4 flex items-center justify-center">
        <Button href=".">Chat Home</Button>
      </p>
    </div>
  </div>
{:else}
  <div class="flex h-full flex-col">
    <!-- Chat Header -->
    <div
      class="glass dark:glass-dark border-b border-white/20 p-4 dark:border-gray-700/50"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Button
            href="/app/{$page.params.orgId}/chat"
            variant="ghost"
            size="icon"
            class="h-9 w-9 md:hidden"
          >
            <ArrowLeft class="h-6 w-6" />
          </Button>
          {#if $currentChat === null}
            <Skeleton class="h-10 w-10 rounded-full" />
            <div>
              <Skeleton class="h-6 w-32" />
              <Skeleton class="h-4 w-32" />
            </div>
          {:else}
            {@const chat = $currentChat}
            {@const avatar = chat.is_group
              ? getGroupAvatarUrl(chat.id, chat.avatar_url)
              : chat.avatar_url}
            <div class="relative">
              {#if avatar}
                <img
                  src={avatar}
                  alt="{chat.name}'s Avatar"
                  class="h-10 w-10 rounded-full"
                />
              {:else}
                <div
                  class="glass dark:glass-dark flex h-10 w-10 items-center justify-center rounded-full border border-gray-400 text-xl uppercase shadow-none dark:border-gray-700"
                >
                  {chat.name.charAt(0)}
                </div>
              {/if}
              <!-- TODO: ONLINE -->
              {#if true}
                <div
                  class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-400 dark:border-gray-800"
                ></div>
              {/if}
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {chat.name}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {#if !chat.is_group}
                  <!-- TODO: Last Seen -->
                  A few days ago
                {:else}
                  <!-- TODO: Group members -->
                  Group Chat
                {/if}
              </p>
            </div>
          {/if}
        </div>

        <div class="flex items-center space-x-2">
          {#if $currentChat !== null}
            <Button
              variant="ghost"
              size="icon"
              class="hidden h-9 w-9 sm:inline-flex"
            >
              <Phone class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="hidden h-9 w-9 sm:inline-flex"
            >
              <Video class="h-4 w-4" />
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild let:builder>
                <Button
                  builders={[builder]}
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9"
                >
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                class="glass dark:glass-dark border-white/20 dark:border-gray-700/50"
              >
                <DropdownMenu.Item
                  class="cursor-pointer gap-2"
                  on:click={() => (showChatInfo = true)}
                >
                  <Info class="h-4 w-4" />
                  View Info
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          {/if}
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div bind:this={messagesContainer} class="flex-1 space-y-4 overflow-y-auto p-4">
      {#if typeof messages !== 'string'}
        {@const msgs = $messages}
        {#if typeof msgs === 'undefined'}
          <div class="relative h-full">
            <div class="absolute bottom-10 flex w-full items-center justify-center">
              <Loader2 class="h-16 w-16 animate-spin text-purple-500" />
            </div>
          </div>
        {:else if typeof msgs === 'string'}
          An error occured
        {:else if msgs.length === 0 && msgQueue.length === 0}
          <div class="h-full items-center justify-center p-8 md:flex">
            <div
              class="glass dark:glass-dark mx-auto max-w-md rounded-2xl p-8 text-center"
            >
              <div
                class="mx-auto mb-6 hidden h-16 w-16 items-center justify-center rounded-2xl bg-gray-300 dark:bg-gray-600 sm:flex"
              >
                <MessageCircle class="h-8 w-8 text-black dark:text-white" />
              </div>
              <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                No Messages Yet
              </h2>
              <p class="text-gray-600 dark:text-gray-300">
                Start the conversation by sending a message.
              </p>
            </div>
          </div>
        {:else}
          {#each msgs as message, index}
            <!-- Date Header -->
            {#if shouldShowDateHeader(message, msgs[index - 1])}
              <div class="flex justify-center">
                <div
                  class="glass dark:glass-dark rounded-full px-3 py-1 text-xs text-gray-600 dark:text-gray-400"
                >
                  {formatDateHeader(new Date(message.created_at))}
                </div>
              </div>
            {/if}

            <!-- Message -->
            <div
              class={cn(
                'flex',
                message.from_id === user.id ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                class={cn(
                  'max-w-xs lg:max-w-md xl:max-w-lg',
                  message.from_id === user.id ? 'order-2' : 'order-1'
                )}
              >
                <div
                  class={cn(
                    'rounded-2xl px-4 py-2 shadow-sm',
                    message.from_id === user.id
                      ? 'gradient-primary text-white'
                      : 'glass dark:glass-dark text-gray-900 dark:text-white'
                  )}
                >
                  {#if message.typ === 'text'}
                    <p class="text-sm leading-relaxed">{message.data}</p>
                  {:else if message.typ === 'attachment'}
                    <!-- TODO: attachment -->
                  {:else if message.typ === 'voice'}
                    <!-- TODO: voice message -->
                  {/if}
                </div>
                <div
                  class={cn(
                    'mt-1 flex items-center space-x-1 text-xs text-gray-500',
                    message.from_id === user.id ? 'justify-end' : 'justify-start'
                  )}
                >
                  <!-- TODO: edit time -->
                  <span>{formatMessageTime(new Date(message.created_at))}</span>
                  <!-- TODO: edit indicator -->
                  {#if true}
                    <em class="text-xs text-gray-500">edited</em>
                  {/if}
                  <!-- TODO: read indicator -->
                  {#if message.from_id === user.id && true}
                    <span class="text-xs text-blue-500"><CheckCheck /></span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
          {#each msgQueue as msg, idx (msg[0])}
            <div class="flex justify-end">
              <div class="order-2 max-w-xs lg:max-w-md xl:max-w-lg">
                <div
                  class="rounded-2xl bg-gray-300 px-4 py-2 text-black shadow-sm dark:bg-gray-600 dark:text-white"
                >
                  <p class="text-sm leading-relaxed">{msg[1]}</p>
                </div>
                {#if idx === msgQueue.length - 1}
                  <div
                    class="mt-1 flex items-center justify-end space-x-1 text-xs text-gray-500"
                  >
                    <em class="text-xs text-gray-500">sending your message...</em>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      {/if}
    </div>

    <!-- Message Input -->
    <div
      class="glass dark:glass-dark border-t border-white/20 p-4 dark:border-gray-700/50"
    >
      <div class="flex items-end space-x-2">
        <!-- Attachment Button -->
        <Button
          variant="ghost"
          size="icon"
          class="h-10 w-10 flex-shrink-0"
          on:click={handleFileUpload}
        >
          <Paperclip class="h-4 w-4" />
        </Button>

        <!-- Message Input -->
        <div class="flex-1">
          <div
            class="glass dark:glass-dark relative rounded-2xl border border-white/30 dark:border-gray-700/50"
          >
            <Input
              bind:value={messageInput}
              placeholder="Type a message..."
              class="border-0 bg-transparent pr-12 focus:ring-0"
              on:keypress={handleKeyPress}
            />
            <Button
              variant="ghost"
              size="icon"
              class="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            >
              <Smile class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- AI Dropdown -->
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            <Button
              builders={[builder]}
              variant="ghost"
              size="icon"
              class="gradient-secondary h-10 w-10 flex-shrink-0 text-white"
            >
              <Sparkles class="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            class="glass dark:glass-dark border-white/20 dark:border-gray-700/50"
          >
            <DropdownMenu.Item class="gap-2">
              <ImageIcon class="h-4 w-4" />
              Generate an Image
            </DropdownMenu.Item>
            <DropdownMenu.Item class="gap-2">
              <Edit3 class="h-4 w-4" />
              Refine Message
            </DropdownMenu.Item>
            <DropdownMenu.Item class="gap-2">
              <Volume2 class="h-4 w-4" />
              Send as Audio Message
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <!-- Send/Mic Button -->
        <Button
          class="gradient-primary h-10 w-10 flex-shrink-0 text-white"
          size="icon"
          on:click={messageInput.trim() ? sendMessage : undefined}
        >
          {#if messageInput.trim()}
            <Send class="h-4 w-4" />
          {:else}
            <Mic class="h-4 w-4" />
          {/if}
        </Button>
      </div>
    </div>
  </div>

  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    multiple
    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
    class="hidden"
    on:change={handleFileSelected}
  />

  <!-- Chat Info Sidebar -->
  <ChatInfoSidebar
    bind:isOpen={showChatInfo}
    chat={$currentChat}
    currentUserId={user.id}
    on:close={() => (showChatInfo = false)}
  />
{/if}
