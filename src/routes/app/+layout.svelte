<script lang="ts">
  import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<div
  class="flex h-screen bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-200/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"
>
  <Sidebar user={data.auth.user} />
  <main
    class="flex-1 overflow-y-auto"
  >
    <slot />
  </main>
</div>
