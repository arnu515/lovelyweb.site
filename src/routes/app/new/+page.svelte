<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Alert from '$lib/components/ui/alert';
  import { Building, Check, Loader2, ArrowLeft, ArrowRight } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { fade } from 'svelte/transition';
  import { PLANS } from '$lib/plans';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  export let data;
  export let form;

  let loading = false;
  let selectedPlan = 'basic';

  let step = 'plan';
  $: error = form?.error || '';

  const plans = data.canCreateFreeOrg ? PLANS : PLANS.slice(1);
</script>

<svelte:head>
  <title>Create New Organisation - lovelyweb.site</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
  <!-- Header -->
  <div class="mb-8 text-center">
    <div
      class="gradient-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
    >
      <Building class="h-8 w-8 text-white" />
    </div>
    <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
      {step === 'details' ? 'Create Your Organisation' : 'Choose Your Plan'}
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-300">
      {step === 'details'
        ? 'Set up your organisation to start collaborating with your team'
        : "Select the plan that best fits your team's needs"}
    </p>
  </div>

  <!-- Progress Indicator -->
  <div class="mb-8">
    <div class="hidden items-center justify-center space-x-4 md:flex">
      <div class="flex items-center">
        <div
          class={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
            step === 'profile'
              ? 'bg-purple-600 text-white'
              : 'bg-green-500 text-white'
          )}
        >
          {#if step === 'plan'}1{:else}<Check class="h-4 w-4" />{/if}
        </div>
        <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">
          Choose Plan
        </span>
      </div>
      <div class="h-px w-12 bg-gray-300 dark:bg-gray-600"></div>
      <div class="flex items-center">
        <div
          class={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
            step === 'details'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
          )}
        >
          2
        </div>
        <span
          class={cn(
            'ml-2 text-sm font-medium transition-colors',
            step === 'plan'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Organisation Details
        </span>
      </div>
    </div>
  </div>

  {#if error}
    <Alert.Root variant="destructive" class="mb-6">
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{error}</Alert.Description>
    </Alert.Root>
  {/if}

  {#if step === 'details'}
    <form
      method="POST"
      use:enhance={() => {
        error = '';
        loading = true;
        return async ({ update }) => {
          loading = false;
          update({ reset: false });
        };
      }}
      class="space-y-8"
    >
      <input type="hidden" name="plan" value={selectedPlan || 'free'} />
      <!-- Organisation Details Form -->
      <div class="glass dark:glass-dark rounded-2xl p-6 md:p-8">
        <div class="space-y-6">
          <!-- Organisation Name -->
          <div>
            <Label
              for="name"
              class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Organisation Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              minlength={4}
              maxlength={255}
              class="glass dark:glass-dark w-full border-white/30 dark:border-gray-700/50"
              placeholder="Enter your organisation name"
            />
            {#if selectedPlan === 'free'}
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your email subdomain will be randomly generated.<br />
                Upgrade to a paid plan to choose a subdomain.
              </p>
            {/if}
          </div>

          {#if selectedPlan !== 'free'}
            <!-- Organisation ID -->
            <div>
              <Label
                for="id"
                class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Organisation ID *
              </Label>
              <Input
                id="id"
                name="id"
                type="text"
                required
                pattern="[a-z0-9\-]+"
                minlength={4}
                maxlength={36}
                class="glass dark:glass-dark w-full border-white/30 dark:border-gray-700/50"
                placeholder="This ID will be your email subdomain"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Only lowercase latin letters, numbers, and hyphens are allowed.
              </p>
            </div>
          {/if}

          <!-- Website Link -->
          <div>
            <Label
              for="link"
              class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Website Link
            </Label>
            <Input
              id="link"
              name="link"
              type="url"
              class="glass dark:glass-dark w-full border-white/30 dark:border-gray-700/50"
              placeholder="https://your-website.com"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Your organisation's website
            </p>
          </div>

          <!-- Description -->
          <div>
            <Label
              for="description"
              class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              class="glass dark:glass-dark w-full border-white/30 dark:border-gray-700/50"
              placeholder="Describe your organisation..."
              rows={4}
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Brief description of your organisation (max 500 characters)
            </p>
          </div>
        </div>
      </div>

      <!-- Next Button -->
      <div class="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          class="gap-2"
          on:click={() => (step = 'plan')}
        >
          <ArrowLeft class="h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          class="gradient-primary gap-2 px-8 py-3 text-white transition-transform duration-200 hover:scale-105"
        >
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {/if}
          Create Organisation
        </Button>
      </div>
    </form>
  {:else if step === 'plan'}
    <section class="space-y-8">
      {#if !data.canCreateFreeOrg}
        <Alert.Root variant="warning" class="mb-6">
          <Alert.Title
            >You may not create an organisation on the Free Plan</Alert.Title
          >
          <Alert.Description
            >You either already have an organisation on the free plan, or one of
            your other paid plan organisations' subscriptions are set to not
            auto-renew.</Alert.Description
          >
        </Alert.Root>
      {/if}
      <div
        class={cn(
          'grid grid-cols-1 gap-6',
          data.canCreateFreeOrg ? 'md:grid-cols-3' : 'md:grid-cols-2'
        )}
      >
        {#each plans as plan}
          <div class="group relative animate-slide-up">
            {#if selectedPlan === plan.id}
              <div
                class="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform transition-all duration-300 group-hover:-top-8 group-hover:scale-105"
              >
                <div
                  class="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white"
                  transition:fade={{ duration: 150 }}
                >
                  Selected
                </div>
              </div>
            {/if}

            <label class="block h-full cursor-pointer">
              <input
                type="radio"
                name="plan"
                value={plan.id}
                bind:group={selectedPlan}
                class="sr-only"
              />
              <div
                class={cn(
                  'glass dark:glass-dark h-full rounded-2xl p-6 transition-all duration-300 hover:scale-105',
                  selectedPlan === plan.id && 'ring-2 ring-purple-500'
                )}
              >
                <!-- Icon -->
                <div
                  class="h-16 w-16 rounded-2xl bg-gradient-to-r {plan.gradient} mb-6 flex items-center justify-center"
                >
                  <svelte:component this={plan.icon} class="h-8 w-8 text-white" />
                </div>

                <!-- Plan Info -->
                <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p class="mb-4 text-gray-600 dark:text-gray-300">
                  {plan.description}
                </p>

                <!-- Price -->
                <div class="mb-6">
                  <div class="flex items-baseline">
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">
                      <!-- TODO: Get other currencies -->
                      ${plan.price.usd}
                    </span>
                    <span class="ml-1 text-gray-600 dark:text-gray-300">
                      /month
                    </span>
                  </div>
                </div>

                <!-- Features -->
                <ul class="space-y-3">
                  {#each plan.features as feature}
                    <li class="flex items-start space-x-3">
                      <Check class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span class="text-sm text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  {/each}
                </ul>
              </div>
            </label>
          </div>
        {/each}
      </div>

      <!-- Navigation Buttons -->
      <div class="flex items-center justify-between gap-4">
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
        <Button
          on:click={() => (step = 'details')}
          class="gradient-primary gap-2 px-8 py-3 text-white transition-transform duration-200 hover:scale-105"
        >
          Create Organisation
          <ArrowRight class="h-4 w-4" />
        </Button>
      </div>
    </section>
  {/if}

  <!-- Help Text -->
  <div class="mt-8 text-center">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      By creating an organisation, you agree to our <a
        href="/terms"
        class="text-purple-600 hover:underline dark:text-purple-400"
        >Terms of Service</a
      >. Need help?
      <a
        href="mailto:support@lovelyweb.site"
        class="text-purple-600 hover:underline dark:text-purple-400"
      >
        Contact us
      </a>
    </p>
  </div>
  <div class="mx-auto mt-8 max-w-screen-sm text-center">
    <p class="text-gray-600 dark:text-gray-300">
      Plan limits are arbitrary. They are put in place since I am using free tiers
      of the services used to power this application. As people purchase paid plans,
      the limits will be increased. Thank you for supporting this project.
      <br />
      To reiterate: LIMITS ARE ARBITRARY AND MAY CHANGE AT ANY TIME.
    </p>
  </div>
</div>
