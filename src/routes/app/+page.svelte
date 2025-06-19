<script lang="ts">
	import HomePage from '$lib/components/dashboard/HomePage.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Dashboard - lovelyweb.site</title>
</svelte:head>

<HomePage user={data.auth.user} />