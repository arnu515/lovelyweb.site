<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { Search, Users, MessageCircle, Home, LogOut } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { page } from '$app/stores';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { chatOverview } from '$lib/stores/chat';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import { formatRelative } from 'date-fns';
  import { createBrowserClient } from '@supabase/ssr';
  import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL
  } from '$env/static/public';

  const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );
  export let user: NonNullable<App.Locals['auth']['user']>;
  $: orgId = $page.params.orgId;

  let searchQuery = '';
  let isUserCollapsibleOpen = false;

  $: chats = $chatOverview;
  $: filteredChats = chats
    ? chats.filter(chat => {
        const q = searchQuery.toLowerCase();
        return (
          chat.name.toLowerCase().includes(q) || chat.slug.toLowerCase().includes(q)
        );
      })
    : null;

  $: currentChatId = $page.params.chatId;

  function handleChatClick() {
    isUserCollapsibleOpen = false;
  }

  function getGroupAvatarUrl(gid: string, avatar_type: string) {
    if (avatar_type !== 'svg' && avatar_type !== 'webp') return null;
    return supabase.storage
      .from('avatars')
      .getPublicUrl(`/org/${orgId}/group/${gid}.${avatar_type}`).data.publicUrl;
  }
</script>

<aside
  class={cn(
    'glass dark:glass-dark fixed left-0 top-0 z-50 h-screen w-full flex-col border-r border-white/20 transition-transform duration-300 dark:border-gray-700/50 md:relative md:w-80 md:translate-x-0',
    !/chat\/?$/.test($page.url.pathname) ? 'hidden md:flex' : 'flex'
  )}
>
  <!-- Header -->
  <div class="border-b border-white/20 p-4 dark:border-gray-700/50">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
      <Button
        href="/app/{orgId}/chat/new"
        variant="ghost"
        size="icon"
        class="h-8 w-8"
      >
        <MessageCircle class="h-4 w-4" />
      </Button>
    </div>

    <!-- Search -->
    <div class="relative">
      <Input
        bind:value={searchQuery}
        placeholder="Search conversations..."
        class="glass dark:glass-dark border-white/30 pl-10 shadow-sm dark:border-gray-700/50"
      />
      <Search
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600 dark:text-gray-400"
      />
    </div>
  </div>

  <!-- Chat List -->
  <div class="flex-1 overflow-y-auto">
    <div class="space-y-1 p-2">
      {#if filteredChats === null}
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
      {:else if filteredChats.length === 0}
        <div
          class="rounded-sm border border-gray-200 px-2 py-4 dark:border-gray-900"
        >
          <p>You have no chats yet.</p>
          <Button size="sm" href="/app/{orgId}/chat/new">New Chat</Button>
        </div>
      {:else}
        {#each filteredChats as chat (chat.id)}
          {@const avatar = chat.is_group
            ? getGroupAvatarUrl(chat.id, chat.avatar_url)
            : chat.avatar_url}
          <Button
            variant="ghost"
            href="/app/{orgId}/chat/{chat.slug}"
            on:click={handleChatClick}
            class={cn(
              'h-auto w-full justify-start p-3 transition-all duration-200',
              currentChatId === chat.id
                ? 'bg-purple-100/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : 'hover:bg-white/60 dark:hover:bg-gray-700/60'
            )}
          >
            <div class="flex w-full items-center space-x-3">
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                {#if avatar}
                  <img
                    src={avatar}
                    alt={chat.name}
                    class="h-12 w-12 rounded-full border border-gray-400 dark:border-gray-700"
                  />
                {:else}
                  <div
                    class="glass dark:glass-dark flex h-12 w-12 items-center justify-center rounded-full border border-gray-400 text-xl uppercase shadow-none dark:border-gray-700"
                  >
                    {chat.name.charAt(0)}
                  </div>
                {/if}
                {#if chat.is_group}
                  <div
                    class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
                  >
                    <Users class="h-3 w-3" />
                  </div>
                  <!-- TODO: Online -->
                {:else if true}
                  <div
                    class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400 dark:border-gray-800"
                  ></div>
                {/if}
              </div>

              <!-- Chat Info -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <h3
                    class={cn(
                      'truncate text-sm font-medium',
                      // TODO: unread count
                      0 > 0 ? 'font-bold' : 'font-normal'
                    )}
                  >
                    {chat.name}
                  </h3>
                  <div class="flex items-center space-x-1">
                    <!-- TODO: unread count -->
                    {#if 0 > 0}
                      <Badge
                        variant="default"
                        class="h-5 min-w-[20px] px-1.5 text-xs"
                      >
                        <!-- TODO: unread count -->
                        0
                      </Badge>
                    {/if}
                    {#if chat.msg_edited_at || chat.msg_created_at}
                      <span class="text-xs text-gray-500"
                        >{formatRelative(
                          chat.msg_edited_at || chat.msg_created_at,
                          new Date()
                        )}</span
                      >
                    {/if}
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <p
                    class={cn(
                      'truncate text-sm text-gray-600 dark:text-gray-400',
                      // TODO: unread count
                      0 > 0 ? 'font-medium' : 'font-normal'
                    )}
                  >
                    <!-- TODO: Typing -->
                    {#if false}
                      <span class="text-green-500">Typing...</span>
                    {:else if !chat.typ}
                      <em class="text-muted-foreground">No message yet</em>
                    {:else if chat.typ === 'text'}
                      {chat.data}
                    {:else if chat.typ === 'attachment'}
                      TODO: attachment
                    {:else if chat.typ === 'voice'}
                      TODO: voice message
                    {/if}
                  </p>
                </div>
              </div>
            </div>
          </Button>
        {/each}
      {/if}
    </div>
  </div>

  <!-- User Info -->
  <Collapsible.Root
    bind:open={isUserCollapsibleOpen}
    class="rounded-t-lg border border-transparent bg-white dark:bg-gray-900"
  >
    <Collapsible.Trigger
      class="flex w-full items-center gap-4 rounded-t-lg border border-transparent p-4 transition-colors duration-300 dark:bg-gray-900 dark:hover:bg-gray-800"
    >
      <img src={user.avatar_url} alt={user.name} class="h-10 w-10 rounded-full" />
      <div class="min-w-0 flex-1 text-left">
        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
          {user.name}
        </p>
        <p class="truncate text-xs text-gray-500 dark:text-gray-400">
          {isUserCollapsibleOpen ? 'Click to close' : 'Click to see options'}
        </p>
      </div>
    </Collapsible.Trigger>
    <Collapsible.Content class="user-collapsible">
      <Button href="/app/{orgId}" variant="ghost">
        <Home />
        Back to Org Home
      </Button>
      <Button href="/auth/logout" data-sveltekit-preload-data="off" variant="ghost">
        <LogOut />
        Log Out
      </Button>
    </Collapsible.Content>
  </Collapsible.Root>
</aside>

<style>
  :global(.user-collapsible) {
    @apply flex w-full flex-col content-start justify-center gap-2 p-2;
  }
  :global(.user-collapsible a),
  :global(.user-collapsible button) {
    @apply flex h-8 w-full justify-start gap-2 rounded-sm py-5 text-left hover:bg-gray-200 dark:hover:bg-gray-700;
  }
  :global(.user-collapsible svg) {
    @apply h-5 w-5;
  }
</style>
