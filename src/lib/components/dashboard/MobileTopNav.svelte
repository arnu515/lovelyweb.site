<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Menu, X } from 'lucide-svelte';

  export let sidebarOpen = false;
</script>

<nav
  class="flex h-16 items-center justify-between border-b border-gray-300/80 px-4 backdrop-blur-md dark:border-gray-700/50 md:hidden"
>
  <div class="flex items-center space-x-3">
    <Button
      variant="ghost"
      size="icon"
      class="h-10 w-10 hover:bg-white/20 dark:hover:bg-gray-700/60"
      on:click={() => (sidebarOpen = !sidebarOpen)}
    >
      {#if sidebarOpen}
        <X class="h-5 w-5" />
      {:else}
        <Menu class="h-5 w-5" />
      {/if}
    </Button>

    <div class="flex items-center space-x-2">
      <div
        class="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg"
      >
        <span class="text-sm font-bold text-white">L</span>
      </div>
      <span class="text-gradient text-lg font-bold">lovelyweb.site</span>
    </div>
  </div>
</nav>
