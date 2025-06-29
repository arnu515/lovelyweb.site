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
    LogOut,
    Users
  } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { page } from '$app/stores';
  import { cn } from '$lib/utils';
  import { type PLAN, PLANS_BY_ID } from '$lib/plans';
  import { Skeleton } from '../ui/skeleton';
  import { chatOverview } from '$lib/stores/chat';
  import { createBrowserClient } from '@supabase/ssr';
  import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL
  } from '$env/static/public';

  type Org = { id: string; name: string; plan: PLAN };
  export let user: NonNullable<App.Locals['auth']['user']>;
  export let isOpen = true;
  export let isMobile = false;
  export let orgs: PromiseLike<Org[]>;
  export let currentOrg: Org & { owner_id: string };

  let orgDropdownOpen = false;
  // page path without /app (there should hopefully not be a regexp injection bug here since `id`'s value is [a-z0-9\-]+)
  $: currentPage = $page.url.pathname.replace(
    new RegExp(`^\/app\/${currentOrg.id}\/?`),
    ''
  );

  const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );
  $: orgId = $page.params.orgId;

  function getGroupAvatarUrl(gid: string, avatar_type: string) {
    if (avatar_type !== 'svg' && avatar_type !== 'webp') return null;
    return supabase.storage
      .from('avatars')
      .getPublicUrl(`/org/${orgId}/group/${gid}.${avatar_type}`).data.publicUrl;
  }

  $: recentChats =
    $chatOverview?.data?.map(chat => ({
      id: chat.id,
      name: chat.name,
      avatar: chat.is_group
        ? getGroupAvatarUrl(chat.id, chat.avatar_url)
        : chat.avatar_url,
      is_group: chat.is_group,
      // TODO: online
      online: true
    })) ?? [];

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
    on:click={() => (isOpen = false)}
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
            {currentOrg.name.charAt(0)}
          </div>
          <div class="text-left">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              {currentOrg.name}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {PLANS_BY_ID[currentOrg.plan].name} Plan
            </div>
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
          {#await orgs}
            <Skeleton class="h-4 w-full" />
          {:then orgs}
            <div class="flex flex-col gap-1 p-1">
              {#each orgs as org}
                <Button
                  href={org.id === currentOrg.id ? undefined : '/app/' + org.id}
                  on:click={org.id === currentOrg.id
                    ? () => (orgDropdownOpen = false)
                    : undefined}
                  data-sveltekit-reload
                  variant="ghost"
                  class="flex h-16 w-full justify-start border-b border-white/10 p-3 text-left text-sm hover:bg-gray-200 dark:border-gray-700/50 dark:hover:bg-gray-700"
                >
                  <div class="flex items-center space-x-3 rounded-lg p-2">
                    <div
                      class="gradient-primary flex h-6 w-6 items-center justify-center rounded-md"
                    >
                      {org.name.charAt(0)}
                    </div>
                    <div class="flex-1 justify-start">
                      <div
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {org.name}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {PLANS_BY_ID[org.plan].name} Plan
                      </div>
                    </div>
                  </div>
                  {#if org.id === currentOrg.id}
                    <div class="ml-auto h-4 w-4 text-purple-500">✓</div>
                  {/if}
                </Button>
              {/each}
              <Button variant="ghost" href="/app/new" class="org-dropdown-btn">
                <Plus class="mr-2 h-4 w-4" />
                New Organisation
              </Button>
            </div>
          {/await}

          <!-- Actions -->
          <div class="space-y-1 p-2">
            <Button variant="ghost" class="org-dropdown-btn">
              <Settings class="mr-2 h-4 w-4" />
              Settings
            </Button>
            {#if user.id === currentOrg.owner_id}
              <Button
                href="/app/{currentOrg.id}/invites"
                variant="ghost"
                class="org-dropdown-btn"
              >
                <UserPlus class="mr-2 h-4 w-4" />
                Invite members
              </Button>
            {/if}
          </div>

          <div
            class="space-y-1 border-t border-white/10 p-2 dark:border-gray-700/50"
          >
            <Button variant="ghost" class="org-dropdown-btn">
              <Smartphone class="mr-2 h-4 w-4" />
              Get mobile app
            </Button>
            <Button
              href="/auth/logout"
              data-sveltekit-preload-data="off"
              variant="ghost"
              class="org-dropdown-btn"
            >
              <LogOut class="mr-2 h-4 w-4" />
              Log Out
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
        href="/app/{currentOrg.id}"
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
        <Button
          variant="ghost"
          class={cn('sb-btn', currentPage === 'email/inbox' && 'active')}
          href="/app/{currentOrg.id}/email/inbox"
          on:click={handleNavigation}
        >
          <Inbox class="icon" />
          <span>Inbox</span>
          <span class="badge">12</span>
        </Button>
        <Button
          variant="ghost"
          class={cn('sb-btn', currentPage === 'email/sent' && 'active')}
          href="/app/{currentOrg.id}/email/sent"
          on:click={handleNavigation}
        >
          <Send class="icon" />
          <span>Sent Items</span>
        </Button>
        <Button
          variant="ghost"
          class={cn('sb-btn', currentPage === 'email/archive' && 'active')}
          href="/app/{currentOrg.id}/email/archive"
          on:click={handleNavigation}
        >
          <Archive class="icon" />
          <span>Archived</span>
        </Button>
        <Button
          variant="ghost"
          class={cn('sb-btn', currentPage === 'email/spam' && 'active')}
          href="/app/{currentOrg.id}/email/spam"
          on:click={handleNavigation}
        >
          <AlertTriangle class="icon" />
          <span>Spam</span>
        </Button>
        <Button
          variant="ghost"
          class={cn('sb-btn', currentPage === 'email/trash' && 'active')}
          href="/app/{currentOrg.id}/email/trash"
          on:click={handleNavigation}
        >
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
        <Button
          href="/app/{currentOrg.id}/notes"
          variant="ghost"
          class={cn('sb-btn', currentPage === 'notes' && 'active')}
          on:click={handleNavigation}
        >
          <FileText class="icon" />
          <span>Notes</span>
        </Button>
        <Button variant="ghost" class="sb-btn" on:click={handleNavigation}>
          <CheckSquare class="icon" />
          <span>Tasks</span>
          <span class="badge">3</span>
        </Button>
        <Button
          href="/app/{currentOrg.id}/kanban"
          variant="ghost"
          class={cn('sb-btn', currentPage === 'kanban' && 'active')}
          on:click={handleNavigation}
        >
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
        <Button
          href="/app/{currentOrg.id}/chat"
          variant="ghost"
          class="sb-btn"
          on:click={handleNavigation}
        >
          <MessageCircle class="icon" />
          <span>Direct Messages</span>
          <span class="badge">2</span>
        </Button>

        <!-- Recent Contacts -->
        <div class="space-y-1 pt-2">
          {#each recentChats as chat}
            <Button
              variant="ghost"
              class="w-full justify-start text-left"
              href="/app/{currentOrg.id}/chat/{chat.is_group ? '-' : '@'}{chat.id}"
              on:click={handleNavigation}
            >
              <div class="relative mr-3">
                {#if chat.avatar}
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    class="h-8 w-8 rounded-full border border-gray-400 dark:border-gray-700"
                  />
                {:else}
                  <div
                    class="glass dark:glass-dark flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 text-lg uppercase shadow-none dark:border-gray-700"
                  >
                    {chat.name.charAt(0)}
                  </div>
                {/if}
                {#if chat.is_group}
                  <div
                    class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
                  >
                    <Users class="h-2 w-2" />
                  </div>
                {:else if chat.online}
                  <div
                    class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border border-white bg-green-400 dark:border-gray-800"
                  ></div>
                {/if}
              </div>
              <span class="truncate text-sm text-gray-900 dark:text-white"
                >{chat.name}</span
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

  :global(.org-dropdown-btn) {
    @apply h-8 w-full justify-start text-sm hover:bg-gray-200 dark:hover:bg-gray-700;
  }
</style>
