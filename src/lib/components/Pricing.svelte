<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Check } from 'lucide-svelte';
  import { PLANS } from '$lib/plans';
  import { cn } from '$lib/utils';
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
      {#each PLANS as plan, index}
        <div
          class="group relative animate-slide-up"
          style="animation-delay: {index * 0.1}s;"
        >
          <!-- Popular Badge -->
          {#if index === 1}
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
            class={cn(
              'glass dark:glass-dark flex h-full flex-col rounded-2xl p-8 transition-all duration-300 hover:scale-105',
              index === 1 ? 'ring-2 ring-purple-500' : ''
            )}
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
                  {plan.price.usd}
                </span>
                <span class="ml-1 text-gray-600 dark:text-gray-300"> /month </span>
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
    <div class="mx-auto mt-12 max-w-screen-sm text-center">
      <p class="text-muted-foreground">Please note that upgrading your plan has no effect as of now.</p>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Need a custom solution? <a
          href="mailto:support@lovelyweb.site"
          class="text-purple-600 hover:underline dark:text-purple-400">Contact us</a
        >
      </p>
    </div>
  </div>
</section>
