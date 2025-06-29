<script lang="ts">
  import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
  import MobileTopNav from '$lib/components/dashboard/MobileTopNav.svelte';
  import type { LayoutData } from './$types';
  import { onMount } from 'svelte';
  import * as realtime from '$lib/realtime';
  import { chat } from '$lib/stores/chat';

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

    const boardMembershipsUnsub = realtime.kanbanBoardMemberships(
      data.org.id,
      data.auth.user.id
    );

    chat.init(data.org.id, data.auth.user.id);

    console.log('Org layout mounted');

    return () => {
      window.removeEventListener('resize', checkMobile);
      console.log('Org layout unmounted');
      boardMembershipsUnsub?.();
      chat.cleanupRealtime();
    };
  });
</script>

<div
  class="flex h-screen bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-200/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"
>
  <Sidebar
    currentOrg={data.org}
    orgs={data.orgList}
    user={data.auth.user}
    bind:isOpen={sidebarOpen}
    {isMobile}
  />

  <main class="flex flex-1 flex-col overflow-hidden">
    <MobileTopNav
      bind:sidebarOpen
      on:toggle-sidebar={({ detail }) => (sidebarOpen = detail)}
    />

    <div class="flex-1 overflow-y-auto">
      <slot />
    </div>
  </main>
</div>
