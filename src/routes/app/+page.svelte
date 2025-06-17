<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Dashboard - organised.today</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto text-center">
		<h1 class="text-4xl font-bold mb-4">
			<span class="text-gradient">Hello World!</span>
		</h1>
		
		{#if data.auth.user}
			<p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
				Welcome back, {data.auth.user.email}!
			</p>
			
			<div class="glass dark:glass-dark rounded-2xl p-8 mb-8">
				<h2 class="text-2xl font-semibold mb-4">User Information</h2>
				<div class="space-y-2 text-left">
					<p><strong>Email:</strong> {data.auth.user.email}</p>
					<p><strong>User ID:</strong> {data.auth.user.id}</p>
					<p><strong>Provider:</strong> {data.auth.user.app_metadata.provider || 'email'}</p>
					{#if data.auth.user.user_metadata.full_name}
						<p><strong>Name:</strong> {data.auth.user.user_metadata.full_name}</p>
					{/if}
					{#if data.auth.user.user_metadata.avatar_url}
						<p><strong>Avatar:</strong> 
							<img src={data.auth.user.user_metadata.avatar_url} alt="Avatar" class="inline-block w-8 h-8 rounded-full ml-2" />
						</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
