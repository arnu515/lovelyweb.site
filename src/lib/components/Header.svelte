<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Menu, X, Mail } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let isLoggedIn = false;

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

<header
  class="fixed left-0 right-0 top-0 z-50 transition-all duration-300 {isScrolled
    ? 'glass dark:glass-dark shadow-lg'
    : ''}"
>
  <nav class="mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <!-- Logo -->
      <a href="/" class="flex items-center space-x-2">
        <div
          class="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg"
        >
          <Mail class="h-5 w-5 text-white" />
        </div>
        <span class="text-gradient text-xl font-bold">lovelyweb.site</span>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-8">
          {#each navigation as item}
            <a
              href={item.href}
              class="px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              {item.name}
            </a>
          {/each}
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="hidden items-center space-x-4 md:flex">
        {#if isLoggedIn}
          <Button
            variant="ghost"
            href="/app"
            class="gradient-primary text-white transition-transform duration-200 hover:scale-105"
          >
            Dashboard
          </Button>
        {:else}
          <Button
            variant="ghost"
            href="/auth"
            class="text-gray-700 dark:text-gray-300"
          >
            Sign In
          </Button>
          <Button
            class="gradient-primary text-white transition-transform duration-200 hover:scale-105"
            href="/auth"
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
          on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
        >
          {#if mobileMenuOpen}
            <X class="h-6 w-6" />
          {:else}
            <Menu class="h-6 w-6" />
          {/if}
        </Button>
      </div>
    </div>

    <!-- Mobile menu -->
    {#if mobileMenuOpen}
      <div class="md:hidden">
        <div
          class="glass dark:glass-dark mt-2 space-y-1 rounded-lg px-2 pb-3 pt-2 sm:px-3"
        >
          {#each navigation as item}
            <a
              href={item.href}
              class="block px-3 py-2 text-base font-medium text-gray-700 transition-colors duration-200 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
              on:click={() => (mobileMenuOpen = false)}
            >
              {item.name}
            </a>
          {/each}
          <div class="space-y-2 pt-4">
            <Button variant="ghost" class="w-full justify-start">Sign In</Button>
            <Button class="gradient-primary w-full text-white">Get Started</Button>
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header>
