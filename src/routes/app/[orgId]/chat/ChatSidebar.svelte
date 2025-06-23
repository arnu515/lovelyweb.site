<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { Search, Users, MessageCircle, Home, LogOut } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { page } from '$app/stores';
  import * as Collapsible from '$lib/components/ui/collapsible';

  export let user: NonNullable<App.Locals['auth']['user']>;
  $: orgId = $page.params.orgId;

  let searchQuery = '';
  let isUserCollapsibleOpen = false;

  // Mock chat data
  const chats = [
    {
      id: '1',
      name: 'Sarah Wilson',
      type: 'direct',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      lastMessage: 'Thanks for the update! The project looks great.',
      timestamp: '2 min ago',
      unreadCount: 2,
      isOnline: true,
      isTyping: false
    },
    {
      id: '2',
      name: 'Design Team',
      type: 'group',
      avatar:
        'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      lastMessage: 'Mike: The new mockups are ready for review',
      timestamp: '15 min ago',
      unreadCount: 5,
      isOnline: false,
      isTyping: true,
      memberCount: 8
    },
    {
      id: '3',
      name: 'Emma Davis',
      type: 'direct',
      avatar:
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      lastMessage: "Let's schedule a meeting for tomorrow",
      timestamp: '1 hour ago',
      unreadCount: 0,
      isOnline: true,
      isTyping: false
    },
    {
      id: '4',
      name: 'Project Alpha',
      type: 'group',
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      lastMessage: 'Alex: Deployment completed successfully',
      timestamp: 'Yesterday',
      unreadCount: 1,
      isOnline: false,
      isTyping: false,
      memberCount: 12
    },
    {
      id: '5',
      name: 'Lisa Park',
      type: 'direct',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      lastMessage: 'Welcome to the team! 🎉',
      timestamp: '2 days ago',
      unreadCount: 0,
      isOnline: false,
      isTyping: false
    }
  ];

  $: filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: currentChatId = $page.params.chatId;

  function handleChatClick() {
    isUserCollapsibleOpen = false;
  }
</script>

<aside
  class={cn(
    'glass dark:glass-dark fixed left-0 top-0 z-50 h-screen w-full flex-col border-r border-white/20 transition-transform duration-300 dark:border-gray-700/50 md:relative md:w-80 md:translate-x-0',
    currentChatId !== undefined ? 'hidden md:flex' : 'flex'
  )}
>
  <!-- Header -->
  <div class="border-b border-white/20 p-4 dark:border-gray-700/50">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
      <Button variant="ghost" size="icon" class="h-8 w-8">
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
      {#each filteredChats as chat (chat.id)}
        <Button
          variant="ghost"
          href="/app/{$page.params.orgId}/chat/{chat.id}"
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
              <img
                src={chat.avatar}
                alt={chat.name}
                class="h-12 w-12 rounded-full"
              />
              {#if chat.type === 'group'}
                <div
                  class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
                >
                  <Users class="h-3 w-3" />
                </div>
              {:else if chat.isOnline}
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
                    chat.unreadCount > 0 ? 'font-bold' : 'font-normal'
                  )}
                >
                  {chat.name}
                  {#if chat.type === 'group' && chat.memberCount}
                    <span class="text-xs text-gray-500">({chat.memberCount})</span>
                  {/if}
                </h3>
                <div class="flex items-center space-x-1">
                  {#if chat.unreadCount > 0}
                    <Badge
                      variant="default"
                      class="h-5 min-w-[20px] px-1.5 text-xs"
                    >
                      {chat.unreadCount}
                    </Badge>
                  {/if}
                  <span class="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <p
                  class={cn(
                    'truncate text-sm text-gray-600 dark:text-gray-400',
                    chat.unreadCount > 0 ? 'font-medium' : 'font-normal'
                  )}
                >
                  {#if chat.isTyping}
                    <span class="text-green-500">Typing...</span>
                  {:else}
                    {chat.lastMessage}
                  {/if}
                </p>
              </div>
            </div>
          </div>
        </Button>
      {/each}
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
