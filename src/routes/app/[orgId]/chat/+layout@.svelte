<script lang="ts">
  import { onMount } from 'svelte';
  import ChatSidebar from './ChatSidebar.svelte';
  import MobileChatHeader from './MobileChatHeader.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  let sidebarOpen = false;
  let isMobile = false;

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
      if (!isMobile) sidebarOpen = true;
      else sidebarOpen = false;
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });
</script>

<div class="flex h-screen bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-200/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
  <!-- Mobile overlay -->
  {#if isMobile && sidebarOpen}
    <div
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      on:click={() => (sidebarOpen = false)}
      on:keydown={e => e.key === 'Escape' && (sidebarOpen = false)}
      role="button"
      tabindex="0"
    ></div>
  {/if}

  <ChatSidebar
    user={data.auth.user}
    bind:isOpen={sidebarOpen}
    {isMobile}
  />

  <main class="flex flex-1 flex-col overflow-hidden">
    <MobileChatHeader
      bind:sidebarOpen
      {isMobile}
    />

    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </main>
</div>