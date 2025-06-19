<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Menu, X, Search, Bell, User } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let user: any;
  export let sidebarOpen = false;

  const dispatch = createEventDispatcher();

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    dispatch('toggle-sidebar', sidebarOpen);
  }
</script>

<nav class="glass dark:glass-dark flex h-16 items-center justify-between border-b border-white/20 px-4 dark:border-gray-700/50 md:hidden">
  <!-- Left side - Menu button and logo -->
  <div class="flex items-center space-x-3">
    <Button
      variant="ghost"
      size="icon"
      class="h-10 w-10 hover:bg-white/20 dark:hover:bg-gray-700/60"
      on:click={toggleSidebar}
    >
      {#if sidebarOpen}
        <X class="h-5 w-5" />
      {:else}
        <Menu class="h-5 w-5" />
      {/if}
    </Button>
    
    <div class="flex items-center space-x-2">
      <div class="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
        <span class="text-sm font-bold text-white">L</span>
      </div>
      <span class="text-gradient text-lg font-bold">lovelyweb.site</span>
    </div>
  </div>

  <!-- Right side - Actions -->
  <div class="flex items-center space-x-2">
    <!-- Quick search button -->
    <Button
      variant="ghost"
      size="icon"
      class="h-10 w-10 hover:bg-white/20 dark:hover:bg-gray-700/60"
    >
      <Search class="h-5 w-5" />
    </Button>

    <!-- Notifications -->
    <Button
      variant="ghost"
      size="icon"
      class="relative h-10 w-10 hover:bg-white/20 dark:hover:bg-gray-700/60"
    >
      <Bell class="h-5 w-5" />
      <div class="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></div>
    </Button>

    <!-- User avatar -->
    <Button
      variant="ghost"
      size="icon"
      class="h-10 w-10 hover:bg-white/20 dark:hover:bg-gray-700/60"
    >
      <div class="gradient-primary flex h-8 w-8 items-center justify-center rounded-full">
        <span class="text-sm font-bold text-white">
          {user?.name?.charAt(0) || 'U'}
        </span>
      </div>
    </Button>
  </div>
</nav>