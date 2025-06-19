<script lang="ts">
  import {
    ChevronDown,
    Home,
    Settings,
    UserPlus,
    Smartphone,
    Plus,
    Inbox,
    Send,
    Archive,
    AlertTriangle,
    Trash2,
    FileText,
    CheckSquare,
    Kanban,
    Calendar,
    MessageCircle,
    Mail,
  } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { page } from '$app/stores';
  import { cn } from '$lib/utils';

  export let user: NonNullable<App.Locals['auth']['user']>;
  export let isOpen = true;
  export let isMobile = false;

  let orgDropdownOpen = false;
  // page path without /app
  $: currentPage = $page.url.pathname.replace(/\/app\/?/, '');

  // Mock data for recent contacts
  const recentContacts = [
    {
      name: 'Sarah Wilson',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      status: 'online'
    },
    {
      name: 'Mike Chen',
      avatar:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      status: 'away'
    },
    {
      name: 'Emma Davis',
      avatar:
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      status: 'online'
    },
    {
      name: 'Alex Johnson',
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      status: 'offline'
    },
    {
      name: 'Lisa Park',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      status: 'online'
    }
  ];

  function toggleOrgDropdown() {
    orgDropdownOpen = !orgDropdownOpen;
  }

  function handleNavigation() {
    isMobile && (isOpen = false);
  }
</script>

<!-- Mobile overlay -->
{#if isMobile && isOpen}
  <div
    class="fixed inset-0 z-40 bg-black/50 md:hidden"
    on:click={() => isOpen = false}
    on:keydown={e => e.key === 'Escape' && (isOpen = false)}
    role="button"
    tabindex="0"
  ></div>
{/if}

<svelte:window
  on:keydown={e => isMobile && isOpen && e.key === 'Escape' && (isOpen = false)}
/>

<aside
  class="glass dark:glass-dark fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/20 transition-transform duration-300 dark:border-gray-700/50 md:relative md:translate-x-0 {isOpen
    ? 'translate-x-0'
    : '-translate-x-full'}"
>
  <!-- Organization Switcher -->
  <div class="border-b border-gray-200/50 p-2 dark:border-gray-700/50">
    <div class="relative">
      <Button
        variant="ghost"
        class="glass dark:glass-dark h-auto w-full justify-between border border-gray-200 p-2 shadow-sm transition-all duration-200 hover:bg-white/20 dark:border-gray-800/50 dark:hover:bg-gray-800/50"
        on:click={toggleOrgDropdown}
      >
        <div class="flex items-center space-x-3">
          <div
            class="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <Mail class="h-4 w-4 text-white" />
          </div>
          <div class="text-left">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              lovelyweb.site
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Free Plan</div>
          </div>
        </div>
        <ChevronDown
          class="h-4 w-4 text-gray-500 transition-transform duration-200 dark:text-gray-400 {orgDropdownOpen
            ? 'rotate-180'
            : ''}"
        />
      </Button>

      {#if orgDropdownOpen}
        <div
          class="glass dark:glass-dark absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 shadow-xl dark:border-gray-800/50"
        >
          <!-- Current Organization -->
          <div class="border-b border-white/10 p-3 dark:border-gray-700/50">
            <div class="flex items-center space-x-3 rounded-lg p-2">
              <div
                class="gradient-primary flex h-6 w-6 items-center justify-center rounded-md"
              >
                <Mail class="h-3 w-3 text-white" />
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  lovelyweb.site
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Free Plan • 1 member
                </div>
              </div>
              <div class="h-4 w-4 text-purple-500">✓</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-1 p-2">
            <Button
              variant="ghost"
              class="h-8 w-full justify-start text-sm hover:bg-white/20 dark:hover:bg-gray-800/50"
            >
              <Settings class="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              class="h-8 w-full justify-start text-sm hover:bg-white/20 dark:hover:bg-gray-800/50"
            >
              <UserPlus class="mr-2 h-4 w-4" />
              Invite members
            </Button>
          </div>

          <div
            class="space-y-1 border-t border-white/10 p-2 dark:border-gray-700/50"
          >
            <Button
              variant="ghost"
              class="h-8 w-full justify-start text-sm hover:bg-white/20 dark:hover:bg-gray-800/50"
            >
              <Smartphone class="mr-2 h-4 w-4" />
              Get mobile app
            </Button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Navigation -->
  <div class="flex-1 space-y-6 overflow-y-auto p-2">
    <!-- Home -->
    <div>
      <Button
        variant="ghost"
        class={cn('sb-btn', currentPage === '' && 'active')}
        href="/app"
        on:click={handleNavigation}
      >
        <Home class="h-5 w-5" />
        <span class="font-medium">Home</span>
      </Button>
    </div>

    <!-- Email Section -->
    <div class="space-y-2">
      <div class="px-3 py-1">
        <h3
          class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Email
        </h3>
      </div>
      <div class="space-y-1">
        <Button variant="ghost" class="sb-btn compose-btn mb-1">
          <Plus class="icon stroke-white" />
          <span>Compose</span>
        </Button>
        <Button variant="ghost" class={cn("sb-btn", currentPage === 'email' && 'active')} href="/app/email" on:click={handleNavigation}>
          <Inbox class="icon" />
          <span>Inbox</span>
          <span class="badge">12</span>
        </Button>
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <Send class="icon" />
          <span>Sent Items</span>
        </Button>
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <Archive class="icon" />
          <span>Archived</span>
        </Button>
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <AlertTriangle class="icon" />
          <span>Spam</span>
        </Button>
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <Trash2 class="icon" />
          <span>Trash</span>
        </Button>
      </div>
    </div>

    <!-- Planning Section -->
    <div class="space-y-2">
      <div class="px-3 py-1">
        <h3
          class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Planning
        </h3>
      </div>
      <div class="space-y-1">
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <FileText class="icon" />
          <span>Notes</span>
        </Button>
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <CheckSquare class="icon" />
          <span>Tasks</span>
          <span class="badge">3</span>
        </Button>
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <Kanban class="icon" />
          <span>Kanban</span>
        </Button>
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <Calendar class="icon" />
          <span>Calendar</span>
        </Button>
      </div>
    </div>

    <!-- Chat Section -->
    <div class="space-y-2">
      <div class="px-3 py-1">
        <h3
          class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Chat
        </h3>
      </div>
      <div class="space-y-1">
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <MessageCircle class="icon" />
          <span>Direct Messages</span>
          <span class="badge">2</span>
        </Button>

        <!-- Recent Contacts -->
        <div class="space-y-1 pt-2">
          {#each recentContacts as contact}
            <Button
              variant="ghost"
            class={cn('sb-btn', currentPage === 'email' && 'active')}
            href="/app/email"
              on:click={handleNavigation}
            >
              <div class="relative mr-3">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  class="h-6 w-6 rounded-full"
                />
                <div
                  class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 {contact.status ===
                  'online'
                    ? 'bg-green-400'
                    : contact.status === 'away'
                      ? 'bg-yellow-400'
                      : 'bg-gray-400'}"
                ></div>
              </div>
              <span class="truncate text-sm text-gray-900 dark:text-white"
                >{contact.name}</span
              >
            </Button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</aside>

<style lang="postcss">
  :global(.sb-btn) {
    @apply h-auto w-full items-center justify-start gap-3 px-3 py-2 transition-all duration-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60;
  }

  :global(.sb-btn.active) {
    @apply bg-purple-100/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300;
  }

  :global(.sb-btn.active .icon) {
    @apply text-purple-600 dark:text-purple-400;
  }

  :global(.sb-btn .icon) {
    @apply h-4 w-4 text-gray-600 dark:text-gray-400;
  }

  :global(.sb-btn.compose-btn) {
    @apply w-max bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700;
  }

  :global(.sb-btn .badge) {
    @apply ml-auto flex h-5 w-auto min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 text-xs font-medium text-white shadow-sm;
  }

  :global(.sb-btn span) {
    @apply text-sm font-medium;
  }
</style>
