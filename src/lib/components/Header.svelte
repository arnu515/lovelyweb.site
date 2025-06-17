<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Menu, X, Mail, MessageCircle, Video, Users } from "lucide-svelte";
	import { onMount } from "svelte";
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let session = null;

	let isScrolled = false;
	let mobileMenuOpen = false;

	onMount(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 20;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	const navigation = [
		{ name: 'Features', href: '#features' },
		{ name: 'Pricing', href: '#pricing' },
		{ name: 'About', href: '#about' },
		{ name: 'Contact', href: '#contact' }
	];
</script>

<header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {isScrolled ? 'glass dark:glass-dark shadow-lg' : ''}">
	<nav class="mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="flex items-center space-x-2">
				<div class="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
					<Mail class="w-5 h-5 text-white" />
				</div>
				<span class="text-xl font-bold text-gradient">organised.today</span>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden md:block">
				<div class="ml-10 flex items-baseline space-x-8">
					{#each navigation as item}
						<a
							href={item.href}
							class="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
						>
							{item.name}
						</a>
					{/each}
				</div>
			</div>

			<!-- CTA Buttons -->
			<div class="hidden md:flex items-center space-x-4">
				{#if session}
					<Button 
						variant="ghost" 
						class="text-gray-700 dark:text-gray-300"
						on:click={() => goto('/app')}
					>
						Dashboard
					</Button>
				{:else}
					<Button 
						variant="ghost" 
						class="text-gray-700 dark:text-gray-300"
						on:click={() => goto('/auth')}
					>
						Sign In
					</Button>
					<Button 
						class="gradient-primary text-white hover:scale-105 transition-transform duration-200"
						on:click={() => goto('/auth')}
					>
						Get Started
					</Button>
				{/if}
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden">
				<Button
					variant="ghost"
					size="icon"
					on:click={() => mobileMenuOpen = !mobileMenuOpen}
				>
					{#if mobileMenuOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</Button>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden">
				<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass dark:glass-dark rounded-lg mt-2">
					{#each navigation as item}
						<a
							href={item.href}
							class="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 text-base font-medium transition-colors duration-200"
							on:click={() => mobileMenuOpen = false}
						>
							{item.name}
						</a>
					{/each}
					<div class="pt-4 space-y-2">
						<Button variant="ghost" class="w-full justify-start">
							Sign In
						</Button>
						<Button class="w-full gradient-primary text-white">
							Get Started
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</nav>
</header>
