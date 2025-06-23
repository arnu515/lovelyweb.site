<script lang="ts">
  import ChatSidebar from './ChatSidebar.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<div
  class="flex h-screen bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-200/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"
>
  <ChatSidebar user={data.auth.user} />

  <main class="flex flex-1 flex-col overflow-hidden">
    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </main>
</div>
