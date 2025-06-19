<script lang="ts">
  import {
    Brain,
    Mail,
    MessageCircle,
    Video,
    FileText,
    Zap,
    Shield,
    Globe
  } from 'lucide-svelte';

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Email Management',
      description:
        'Smart summarisation, automated prioritisation, and intelligent draft generation keep your inbox organised and efficient.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: MessageCircle,
      title: 'Integrated Team Chat',
      description:
        'Real-time communication with AI-assisted translation, conversation summarisation, and automated meeting notes.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Video,
      title: 'Seamless Meeting Platform',
      description:
        'Integrated video conferencing with AI-driven transcription, action item capture, and automatic follow-ups.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: FileText,
      title: 'Centralised Knowledge Base',
      description:
        'Connect all your documents, wikis, and shared resources with intelligent AI search and organisation.',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Automated Workflows',
      description:
        'Create custom automation rules that handle routine tasks, schedule follow-ups, and manage priorities.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Bank-level encryption, compliance-ready features, and advanced security controls for peace of mind.',
      gradient: 'from-red-500 to-pink-500'
    }
  ];
</script>

<section
  id="features"
  class="relative overflow-hidden bg-white py-20 dark:bg-gray-900"
>
  <!-- Background Pattern -->
  <div
    class="bg-grid-gray-100 dark:bg-grid-gray-800 absolute inset-0 opacity-50"
  ></div>

  <div class="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Header -->
    <div class="mx-auto mb-16 max-w-3xl text-center">
      <h2 class="mb-6 text-4xl font-bold md:text-5xl">
        <span class="text-gradient">Powerful Features</span>
        <br />
        for Modern Teams
      </h2>
      <p class="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
        Join thousands of teams already using lovelyweb.site to streamline their
        communication.
      </p>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {#each features as feature, index}
        <div
          class="glass dark:glass-dark group animate-slide-up rounded-2xl p-8 transition-all duration-300 hover:scale-105"
          style="animation-delay: {index * 0.1}s;"
        >
          <!-- Icon -->
          <div
            class="h-16 w-16 rounded-2xl bg-gradient-to-r {feature.gradient} mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          >
            <svelte:component this={feature.icon} class="h-8 w-8 text-white" />
          </div>

          <!-- Content -->
          <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            {feature.title}
          </h3>
          <p class="leading-relaxed text-gray-600 dark:text-gray-300">
            {feature.description}
          </p>

          <!-- Hover Effect -->
          <div
            class="mt-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <div
              class="h-1 w-full bg-gradient-to-r {feature.gradient} rounded-full"
            ></div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Bottom CTA -->
    <div class="mt-16 text-center">
      <div class="glass dark:glass-dark mx-auto max-w-2xl rounded-2xl p-8">
        <h3 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Ready to transform your workflow?
        </h3>
        <p class="mb-6 text-gray-600 dark:text-gray-300">
          Join thousands of teams already using lovelyweb.site to streamline their
          communication.
        </p>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            class="gradient-primary rounded-lg px-8 py-3 font-semibold text-white transition-transform duration-200 hover:scale-105"
          >
            Start Free Trial
          </button>
          <button
            class="rounded-lg border border-purple-200 px-8 py-3 font-semibold text-purple-600 transition-colors duration-200 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
          >
            Schedule Demo
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
