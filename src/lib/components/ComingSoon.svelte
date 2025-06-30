<script lang="ts">
  import { Mail, Sparkles, Calendar, ArrowRight } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import {page} from "$app/stores"

  export let title: string
  export let description: string
</script>

<div class="relative h-full">
  <!-- Blurred Email UI Background -->
  <div class="absolute inset-0 filter blur-sm opacity-30">
    <div class="h-16 w-full border-b border-gray-200 dark:border-gray-700"></div>
    <div class="grid h-full grid-cols-1 gap-4 p-4">
      {#each Array(8) as _}
        <div class="h-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      {/each}
    </div>
  </div>
  
  <!-- Coming Soon Overlay -->
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="glass dark:glass-dark max-w-2xl rounded-2xl border border-white/30 p-8 text-center shadow-xl dark:border-gray-700/50">
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
        <Mail class="h-10 w-10 text-white" />
      </div>
      
      <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      
      <p class="mb-6 text-lg text-gray-600 dark:text-gray-300">
        {description}
      </p>
      
      {#if $page.url.pathname.includes('email')}
      <div class="mb-8 space-y-4">
        <div class="flex items-center gap-3 rounded-lg bg-white/50 p-4 text-left dark:bg-gray-800/50">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <Sparkles class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">AI-Powered Email Management</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Smart categorization, priority inbox, and automated responses</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 rounded-lg bg-white/50 p-4 text-left dark:bg-gray-800/50">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Calendar class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Seamless Calendar Integration</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Schedule meetings directly from emails with smart suggestions</p>
          </div>
        </div>
      </div>
      {/if}
      
      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button href="/app/{$page.params.orgId}" class="gap-2">
          <ArrowRight class="h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  </div>
</div>
