<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Check, Star, Zap, Building } from 'lucide-svelte';

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: '',
      description: 'Perfect for individuals and small teams getting started',
      icon: Star,
      features: [
        'Up to 5 team members',
        '1,000 emails per month',
        'Basic AI email organisation',
        'Standard chat features',
        '5 video meetings per month',
        '1GB storage',
        'Community support'
      ],
      cta: 'Get Started Free',
      popular: false,
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Professional',
      price: '£29',
      period: '/month',
      description: 'For growing teams that need advanced AI features',
      icon: Zap,
      features: [
        'Up to 25 team members',
        'Unlimited emails',
        'Advanced AI email management',
        'Smart chat with AI translation',
        'Unlimited video meetings',
        '50GB storage',
        'AI-powered meeting transcription',
        'Priority support',
        'Custom integrations'
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-purple-500 to-blue-500'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organisations with custom requirements',
      icon: Building,
      features: [
        'Unlimited team members',
        'Unlimited everything',
        'Custom AI model training',
        'Advanced security & compliance',
        'Dedicated account manager',
        'Custom integrations',
        'On-premise deployment option',
        '24/7 premium support',
        'Custom SLA'
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];
</script>

<section
  id="pricing"
  class="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10"
>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Header -->
    <div class="mx-auto mb-16 max-w-3xl text-center">
      <h2
        class="mb-6 flex flex-col content-center justify-center gap-4 text-4xl font-bold md:text-5xl"
      >
        <span class="text-gradient" style="font-size: 0.7em; line-height: 1em;"
          >Simple, Transparent</span
        >
        <span>Pricing</span>
      </h2>
      <p class="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
        Choose the perfect plan for your team. Start free and scale as you grow.
      </p>
    </div>

    <!-- Pricing Cards -->
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
      {#each plans as plan, index}
        <div
          class="group relative animate-slide-up"
          style="animation-delay: {index * 0.1}s;"
        >
          <!-- Popular Badge -->
          {#if plan.popular}
            <div
              class="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform transition-all duration-300 group-hover:-top-8 group-hover:scale-105"
            >
              <div
                class="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white"
              >
                Most Popular
              </div>
            </div>
          {/if}

          <!-- Card -->
          <div
            class="glass dark:glass-dark h-full rounded-2xl p-8 {plan.popular
              ? 'ring-2 ring-purple-500'
              : ''} flex flex-col transition-all duration-300 hover:scale-105"
          >
            <!-- Icon -->
            <div
              class="h-16 w-16 rounded-2xl bg-gradient-to-r {plan.gradient} mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            >
              <svelte:component this={plan.icon} class="h-8 w-8 text-white" />
            </div>

            <!-- Plan Info -->
            <h3 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {plan.name}
            </h3>
            <p class="mb-6 text-gray-600 dark:text-gray-300">
              {plan.description}
            </p>

            <!-- Price -->
            <div class="mb-8">
              <div class="flex items-baseline">
                <span class="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                {#if plan.period}
                  <span class="ml-1 text-gray-600 dark:text-gray-300">
                    {plan.period}
                  </span>
                {/if}
              </div>
            </div>

            <!-- Features -->
            <ul class="mb-8 space-y-4">
              {#each plan.features as feature}
                <li class="flex items-start space-x-3">
                  <Check class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span class="text-gray-600 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              {/each}
            </ul>

            <!-- CTA Button -->
            <Button
              class="gradient-primary mt-auto flex w-full text-white transition-all duration-200 hover:scale-105"
              size="lg"
            >
              {plan.cta}
            </Button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Bottom Note -->
    <div class="mt-12 text-center">
      <p class="text-gray-600 dark:text-gray-300">
        All plans include a 14-day free trial. No credit card required.
      </p>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Need a custom solution? <a
          href="#contact"
          class="text-purple-600 hover:underline dark:text-purple-400"
          >Contact our sales team</a
        >
      </p>
    </div>
  </div>
</section>
