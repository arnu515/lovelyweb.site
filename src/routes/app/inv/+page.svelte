<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { ArrowLeft, Building, Plus } from 'lucide-svelte';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import Invites from './Invites.svelte';
  import { goto } from '$app/navigation';

  export let data;
</script>

<svelte:head>
  <title>Your Invites - lovelyweb.site</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"
>
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      {#if data.noOrgs}
        <!-- Header -->
        <div class="mb-8 text-center">
          <div
            class="gradient-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          >
            <Building class="h-8 w-8 text-white" />
          </div>
          <h1
            class="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl"
          >
            Welcome to lovelyweb.site
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Get started by joining an organisation or creating your own
          </p>
        </div>
      {:else}
        <header class="mx-4 my-8">
          <Button
            type="button"
            variant="ghost"
            class="gap-2"
            on:click={() => {
              if (document.referrer) goto(document.referrer);
              else window.history.back();
            }}
          >
            <ArrowLeft class="h-4 w-4" />
            Back
          </Button>
        </header>
      {/if}

      <div class="space-y-8">
        {#await data.invites}
          <div class="space-y-6">
            <Skeleton class="h-20 w-full bg-gray-300 dark:bg-gray-800" />
            <Skeleton class="h-20 w-full bg-gray-300 dark:bg-gray-800" />
            <Skeleton class="h-20 w-full bg-gray-300 dark:bg-gray-800" />
          </div>
        {:then invites}
          <Invites {invites} />
        {/await}

        {#if data.noOrgs}
          <!-- Create Organisation Card -->
          <div class="text-center">
            <div
              class="glass dark:glass-dark mx-auto max-w-2xl animate-slide-up rounded-2xl p-8"
            >
              <div
                class="gradient-secondary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              >
                <Plus class="h-8 w-8 text-white" />
              </div>
              <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Create Your Organisation
              </h2>
              <p class="mb-6 text-gray-600 dark:text-gray-300">
                Start your own organisation and invite your team to collaborate with
                AI-powered communication tools.
              </p>
              <div class="space-y-4">
                <Button
                  href="/app/new"
                  class="gradient-primary gap-2 px-8 py-3 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105"
                >
                  <Building class="h-5 w-5" />
                  Create Organisation
                </Button>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Free plan available • No credit card required
                </p>
              </div>
            </div>
          </div>

          <!-- Help Text -->
          <div class="mt-12 flex flex-col gap-4 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Need help getting started? <a
                href="mailto:support@lovelyweb.site"
                class="text-purple-600 hover:underline dark:text-purple-400"
              >
                Contact our support team
              </a>
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <a
                href="/auth/logout"
                data-sveltekit-preload-data={false}
                class="text-purple-600 hover:underline dark:text-purple-400"
              >
                Log Out
              </a>
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
