<script lang="ts">
  import ChatSidebar from './ChatSidebar.svelte';
  import type { LayoutData } from './$types';
  import { onMount } from 'svelte';
  import { chat, chatOverview } from '$lib/stores/chat';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import * as realtime from '$lib/realtime';

  export let data: LayoutData;

  onMount(() => {
    const orgId = $page.params.orgId;
    if (!data.auth.user) {
      goto('/auth');
      return;
    }
    const orgUnsub = realtime.org(orgId)
    const boardMembershipsUnsub = realtime.kanbanBoardMemberships(
      data.auth.user.id
    );
    chat.init(orgId, data.auth.user.id).then(fetched => {
      if (!fetched && !$chatOverview)
        chatOverview.fetchOverview(orgId, data.auth.user!.id);
    });
    return () => {
      boardMembershipsUnsub?.();
      orgUnsub?.();
      chat.cleanupRealtime();
    };
  });
</script>

<div
  class="flex h-screen bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-200/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"
>
  {#if data.auth.user}
    <ChatSidebar user={data.auth.user} />
  {/if}

  <main class="flex flex-1 flex-col overflow-hidden">
    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </main>
</div>
