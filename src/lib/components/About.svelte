<script lang="ts">
  import { Target, Users, Lightbulb, Rocket } from 'lucide-svelte';

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description:
        'We believe communication should be effortless, not overwhelming. Our mission is to eliminate communication chaos.'
    },
    {
      icon: Users,
      title: 'People-First',
      description:
        'Technology should work for people, not the other way around. We design with empathy and real user needs in mind.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description:
        "We're constantly pushing the boundaries of what's possible with AI and communication technology."
    },
    {
      icon: Rocket,
      title: 'Growth',
      description:
        'We grow with our users, continuously evolving our platform to meet changing needs and scale.'
    }
  ];
</script>

<section id="about" class="bg-white py-20 dark:bg-gray-900">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Header -->
    <div class="mx-auto mb-16 max-w-3xl text-center">
      <h2 class="mb-6 text-4xl font-bold md:text-5xl">
        <span class="text-gradient">About</span>
        lovelyweb.site
      </h2>
      <p class="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
        We're on a mission to revolutionise how teams communicate and collaborate in
        the modern workplace.
      </p>
    </div>

    <div class="mb-20 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
      <!-- Story -->
      <div class="space-y-6">
        <h3 class="text-3xl font-bold text-gray-900 dark:text-white">Our Story</h3>
        <p class="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          Founded in 2024, lovelyweb.site was born from a simple observation: teams
          were drowning in communication tools that didn't talk to each other.
          Email, chat, video calls, and documents lived in separate silos, creating
          chaos instead of clarity.
        </p>
        <p class="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          We set out to build something different—a unified platform that harnesses
          the power of AI to not just connect these tools, but to make them
          intelligent, predictive, and truly helpful.
        </p>
        <p class="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          Today, thousands of teams across the globe use lovelyweb.site to
          streamline their communication, boost productivity, and focus on what
          matters most: their work and their people.
        </p>
      </div>

      <!-- Visual Element -->
      <div class="relative">
        <div class="glass dark:glass-dark rounded-2xl p-8">
          <div class="space-y-6">
            <div class="flex items-center space-x-4">
              <div
                class="gradient-primary flex h-12 w-12 items-center justify-center rounded-full"
              >
                <span class="font-bold text-white">1M+</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  Messages Organised
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Every single day
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div
                class="gradient-secondary flex h-12 w-12 items-center justify-center rounded-full"
              >
                <span class="font-bold text-white">10K+</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  Teams Connected
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Across 50+ countries
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-500"
              >
                <span class="font-bold text-white">99%</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  Uptime Guarantee
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Always available when you need us
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Values -->
    <div class="mb-16">
      <h3
        class="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white"
      >
        Our Values
      </h3>
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {#each values as value, index}
          <div
            class="glass dark:glass-dark animate-slide-up rounded-2xl p-6 text-center transition-transform duration-300 hover:scale-105"
            style="animation-delay: {index * 0.1}s;"
          >
            <div
              class="gradient-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            >
              <svelte:component this={value.icon} class="h-8 w-8 text-white" />
            </div>
            <h4 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              {value.title}
            </h4>
            <p class="text-gray-600 dark:text-gray-300">
              {value.description}
            </p>
          </div>
        {/each}
      </div>
    </div>

    <!-- Team CTA -->
    <div
      class="glass dark:glass-dark mx-auto max-w-4xl rounded-2xl p-12 text-center"
    >
      <h3 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
        Join Our Journey
      </h3>
      <p class="mb-8 text-xl text-gray-600 dark:text-gray-300">
        We're always looking for talented individuals who share our vision of making
        communication effortless and meaningful.
      </p>
      <div class="flex flex-col justify-center gap-4 sm:flex-row">
        <button
          class="gradient-primary rounded-lg px-8 py-3 font-semibold text-white transition-transform duration-200 hover:scale-105"
        >
          View Open Positions
        </button>
        <button
          class="rounded-lg border border-purple-200 px-8 py-3 font-semibold text-purple-600 transition-colors duration-200 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
        >
          Learn More About Us
        </button>
      </div>
    </div>
  </div>
</section>
