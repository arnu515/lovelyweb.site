<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { ArrowRight, Mail, MessageCircle, Video, Brain } from 'lucide-svelte';
</script>

<section
  class="relative flex min-h-screen items-center justify-center overflow-hidden py-[30%] sm:py-[20%] md:py-[10%]"
>
  <!-- Background Gradient -->
  <div
    class="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"
  ></div>

  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <div
      class="absolute left-1/4 top-1/4 h-64 w-64 animate-float rounded-full bg-purple-300/20 blur-3xl"
    ></div>
    <div
      class="absolute right-1/4 top-3/4 h-96 w-96 animate-float rounded-full bg-blue-300/20 blur-3xl"
      style="animation-delay: -3s;"
    ></div>
    <div
      class="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 transform animate-float rounded-full bg-indigo-300/20 blur-3xl"
      style="animation-delay: -1.5s;"
    ></div>
  </div>

  <div class="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <!-- Badge -->
      <div
        class="glass dark:glass-dark mb-8 hidden animate-fade-in items-center space-x-2 rounded-full px-4 py-2 md:inline-flex"
      >
        <Brain class="h-4 w-4 text-purple-600" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          AI-Powered Communication Platform
        </span>
      </div>

      <!-- Main Headline -->
      <h1
        class="mb-6 animate-slide-up text-5xl font-bold leading-tight md:text-7xl"
      >
        <span class="text-gradient">Organise</span> your entire
        <br />
        communication workflow
      </h1>

      <!-- Subheadline -->
      <p
        class="mb-8 animate-slide-up text-xl leading-relaxed text-gray-600 dark:text-gray-300 md:text-2xl"
        style="animation-delay: 0.2s;"
      >
        Unify email, chat, and meetings with AI-powered organisation.
        <br class="hidden md:block" />
        Never miss important communications again.
      </p>

      <!-- CTA Buttons -->
      <div
        class="mb-12 flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row"
        style="animation-delay: 0.4s;"
      >
        <Button
          size="lg"
          class="gradient-primary animate-glow px-8 py-4 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105"
        >
          Start Free Trial
          <ArrowRight class="ml-2 h-5 w-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          class="glass dark:glass-dark border-purple-200 px-8 py-4 text-lg font-semibold hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
        >
          Watch Demo
        </Button>
      </div>

      <!-- Feature Icons -->
      <div
        class="mx-auto grid max-w-3xl animate-slide-up grid-cols-1 gap-8 md:grid-cols-3"
        style="animation-delay: 0.6s;"
      >
        <div class="flex flex-col items-center space-y-2">
          <div
            class="glass dark:glass-dark flex h-16 w-16 items-center justify-center rounded-2xl"
          >
            <Mail class="h-8 w-8 text-purple-600" />
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white">Smart Email</h3>
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            AI-powered email management and organisation
          </p>
        </div>
        <div class="flex flex-col items-center space-y-2">
          <div
            class="glass dark:glass-dark flex h-16 w-16 items-center justify-center rounded-2xl"
          >
            <MessageCircle class="h-8 w-8 text-blue-600" />
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white">Team Chat</h3>
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            Real-time messaging with intelligent features
          </p>
        </div>
        <div class="flex flex-col items-center space-y-2">
          <div
            class="glass dark:glass-dark flex h-16 w-16 items-center justify-center rounded-2xl"
          >
            <Video class="h-8 w-8 text-indigo-600" />
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            Video Meetings
          </h3>
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            Seamless video conferencing with AI notes
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-bounce">
    <div
      class="flex h-10 w-6 justify-center rounded-full border-2 border-gray-300 dark:border-gray-600"
    >
      <div class="mt-2 h-3 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
    </div>
  </div>
</section>
