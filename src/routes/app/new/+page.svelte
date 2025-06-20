<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Alert from '$lib/components/ui/alert';
  import { enhance } from '$app/forms';
  import { Building, Check, Loader2, ArrowLeft, ArrowRight, Zap, Star, Crown } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { onMount } from 'svelte';

  export let data;
  export let form;

  let loading = false;
  let checkingSlug = false;
  let orgName = form?.name || '';
  let orgLink = form?.link || '';
  let orgDescription = form?.description || '';
  let selectedPlan = form?.plan || '';

  $: step = form?.step || 'details';
  $: error = form?.error || '';
  $: slug = form?.slug || '';

  // Auto-generate slug as user types
  let slugCheckTimeout: NodeJS.Timeout;
  $: if (orgName && step === 'details') {
    clearTimeout(slugCheckTimeout);
    slugCheckTimeout = setTimeout(() => {
      checkSlugAvailability();
    }, 500);
  }

  async function checkSlugAvailability() {
    if (!orgName.trim()) return;
    
    checkingSlug = true;
    const formData = new FormData();
    formData.append('name', orgName);
    
    try {
      const response = await fetch('?/checkSlug', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      // Handle the slug check result if needed
    } catch (err) {
      console.error('Error checking slug:', err);
    } finally {
      checkingSlug = false;
    }
  }

  function generateSlugPreview(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  }

  $: slugPreview = generateSlugPreview(orgName);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '£0',
      period: '/month',
      description: 'Perfect for small teams getting started',
      icon: Building,
      features: [
        'Up to 5 team members',
        '1,000 emails per month',
        'Basic organisation',
        'Community support',
        '1GB storage'
      ],
      gradient: 'from-gray-500 to-gray-600',
      popular: false
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '£15',
      period: '/month',
      description: 'For growing teams that need more features',
      icon: Zap,
      features: [
        'Up to 25 team members',
        'Unlimited emails',
        'Advanced AI organisation',
        'Priority support',
        '50GB storage',
        'Custom integrations'
      ],
      gradient: 'from-blue-500 to-cyan-500',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '£45',
      period: '/month',
      description: 'For large teams with advanced needs',
      icon: Crown,
      features: [
        'Unlimited team members',
        'Unlimited everything',
        'Custom AI training',
        'Dedicated support',
        'Unlimited storage',
        'Advanced security',
        'Custom branding'
      ],
      gradient: 'from-purple-500 to-pink-500',
      popular: false
    }
  ];

  onMount(() => {
    return () => {
      if (slugCheckTimeout) {
        clearTimeout(slugCheckTimeout);
      }
    };
  });
</script>

<svelte:head>
  <title>Create New Organisation - lovelyweb.site</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
  <!-- Header -->
  <div class="mb-8 text-center">
    <div class="gradient-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
      <Building class="h-8 w-8 text-white" />
    </div>
    <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
      {step === 'details' ? 'Create Your Organisation' : 'Choose Your Plan'}
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-300">
      {step === 'details' 
        ? 'Set up your organisation to start collaborating with your team'
        : 'Select the plan that best fits your team\'s needs'
      }
    </p>
  </div>

  <!-- Progress Indicator -->
  <div class="mb-8">
    <div class="flex items-center justify-center space-x-4">
      <div class="flex items-center">
        <div class={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
          step === 'details' 
            ? "bg-purple-600 text-white" 
            : "bg-green-500 text-white"
        )}>
          {step === 'details' ? '1' : <Check class="h-4 w-4" />}
        </div>
        <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">
          Organisation Details
        </span>
      </div>
      <div class="h-px w-12 bg-gray-300 dark:bg-gray-600"></div>
      <div class="flex items-center">
        <div class={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
          step === 'pricing' 
            ? "bg-purple-600 text-white" 
            : "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
        )}>
          2
        </div>
        <span class={cn(
          "ml-2 text-sm font-medium transition-colors",
          step === 'pricing' 
            ? "text-gray-900 dark:text-white" 
            : "text-gray-500 dark:text-gray-400"
        )}>
          Choose Plan
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

  <form
    use:enhance={async () => {
      loading = true;
      return async ({ update }) => {
        loading = false;
        update({ reset: false });
      };
    }}
    method="POST"
    action="?/createOrganisation"
    class="space-y-6"
  >
    <input type="hidden" name="step" value={step} />
    
    {#if step === 'details'}
      <!-- Organisation Details Form -->
      <div class="glass dark:glass-dark rounded-2xl p-6 md:p-8">
        <div class="space-y-6">
          <!-- Organisation Name -->
          <div>
            <Label for="name" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Organisation Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              bind:value={orgName}
              class="glass dark:glass-dark w-full border-white/30 dark:border-gray-700/50"
              placeholder="Enter your organisation name"
            />
          </div>

          <!-- Organisation ID Preview -->
          {#if orgName}
            <div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <Label class="mb-2 block text-sm font-medium text-purple-700 dark:text-purple-300">
                Organisation ID
              </Label>
              <div class="flex items-center space-x-2">
                <code class="rounded bg-purple-100 px-2 py-1 text-sm text-purple-800 dark:bg-purple-800/50 dark:text-purple-200">
                  {slug || slugPreview}
                </code>
                {#if checkingSlug}
                  <Loader2 class="h-4 w-4 animate-spin text-purple-600" />
                {:else if slug}
                  <Check class="h-4 w-4 text-green-500" />
                {/if}
              </div>
              <p class="mt-1 text-xs text-purple-600 dark:text-purple-400">
                This will be your unique organisation identifier
              </p>
            </div>
          {/if}

          <!-- Website Link -->
          <div>
            <Label for="link" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Website Link
            </Label>
            <Input
              id="link"
              name="link"
              type="url"
              bind:value={orgLink}
              class="glass dark:glass-dark w-full border-white/30 dark:border-gray-700/50"
              placeholder="https://your-website.com"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Your organisation's website
            </p>
          </div>

          <!-- Description -->
          <div>
            <Label for="description" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              bind:value={orgDescription}
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
      <div class="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !orgName.trim()}
          class="gradient-primary gap-2 px-8 py-3 text-white transition-transform duration-200 hover:scale-105"
        >
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {/if}
          Next: Choose Plan
          <ArrowRight class="h-4 w-4" />
        </Button>
      </div>

    {:else if step === 'pricing'}
      <!-- Hidden fields to preserve data -->
      <input type="hidden" name="name" value={form?.name || ''} />
      <input type="hidden" name="link" value={form?.link || ''} />
      <input type="hidden" name="description" value={form?.description || ''} />
      <input type="hidden" name="slug" value={form?.slug || ''} />

      <!-- Pricing Plans -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {#each plans as plan}
          <div class="relative">
            {#if plan.popular}
              <div class="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform">
                <div class="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white">
                  Most Popular
                </div>
              </div>
            {/if}

            <label class="block cursor-pointer">
              <input
                type="radio"
                name="plan"
                value={plan.id}
                bind:group={selectedPlan}
                class="sr-only"
              />
              <div class={cn(
                "glass dark:glass-dark h-full rounded-2xl p-6 transition-all duration-300 hover:scale-105",
                selectedPlan === plan.id && "ring-2 ring-purple-500",
                plan.popular && "ring-2 ring-purple-500"
              )}>
                <!-- Icon -->
                <div class="h-16 w-16 rounded-2xl bg-gradient-to-r {plan.gradient} mb-6 flex items-center justify-center">
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
                      {plan.price}
                    </span>
                    <span class="ml-1 text-gray-600 dark:text-gray-300">
                      {plan.period}
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

                <!-- Selection Indicator -->
                {#if selectedPlan === plan.id}
                  <div class="mt-6 flex items-center justify-center">
                    <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600">
                      <Check class="h-4 w-4 text-white" />
                    </div>
                  </div>
                {/if}
              </div>
            </label>
          </div>
        {/each}
      </div>

      <!-- Navigation Buttons -->
      <div class="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          class="gap-2"
          on:click={() => {
            // Go back to details step
            const form = new FormData();
            form.append('step', 'details');
            form.append('name', data.name || '');
            form.append('link', data.link || '');
            form.append('description', data.description || '');
            // This would need to be handled differently in a real app
            window.history.back();
          }}
        >
          <ArrowLeft class="h-4 w-4" />
          Back
        </Button>

        <Button
          type="submit"
          disabled={loading || !selectedPlan}
          class="gradient-primary gap-2 px-8 py-3 text-white transition-transform duration-200 hover:scale-105"
        >
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {/if}
          Create Organisation
        </Button>
      </div>
    {/if}
  </form>

  <!-- Help Text -->
  <div class="mt-8 text-center">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Need help? <a href="/contact" class="text-purple-600 hover:underline dark:text-purple-400">
        Contact our support team
      </a>
    </p>
  </div>
</div>