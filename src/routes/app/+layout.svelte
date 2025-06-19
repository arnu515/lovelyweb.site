<script lang="ts">
	import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50/50 via-blue-50/50 to-indigo-100/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex">
	<Sidebar user={data.auth.user} />
	<slot />
</div>