<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Label } from '$lib/components/ui/label';
  import { Edit3, Volume2, X, Sparkles, Loader2 } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import { page } from '$app/stores';

  export let mode: 'refine' | 'voice' | null = null;
  export let messageInput: string = '';
  export let loading = false;

  const dispatch = createEventDispatcher<{
    cancel: void;
    refine: { style: string; customInstructions: string };
    voice: { voice: string };
  }>();

  // Refine message options
  const refineStyles = [
    { id: 'formal', label: 'Formal', description: 'Professional and polite' },
    { id: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
    { id: 'funny', label: 'Funny', description: 'Humorous and light-hearted' },
    { id: 'concise', label: 'Concise', description: 'Brief and to the point' },
    { id: 'professional', label: 'Professional', description: 'Business-appropriate' }
  ];
  
  let selectedRefineStyle = 'formal';
  let customInstructions = '';

  // Voice message options
  const voiceOptions = [
    { id: 'male', label: 'Male Voice', description: 'Deep and clear' },
    { id: 'female', label: 'Female Voice', description: 'Smooth and natural' },
    { id: 'robot', label: 'Robot Voice', description: 'Mechanical and futuristic' }
  ];
  
  let selectedVoice = 'male';

  function handleCancel() {
    dispatch('cancel');
  }

  function handleRefine() {
    if (!messageInput.trim()) {
      toast.error('Please enter a message to refine');
      return;
    }
    
    dispatch('refine', {
      style: selectedRefineStyle,
      customInstructions: customInstructions.trim()
    });
  }

  function handleVoice() {
    if (!messageInput.trim()) {
      toast.error('Please enter a message to convert to voice');
      return;
    }
    
    if (messageInput.length > 500) {
      toast.error('Message is too long for voice conversion', {
        description: 'Please limit your message to 500 characters'
      });
      return;
    }
    
    dispatch('voice', {
      voice: selectedVoice
    });
  }
</script>

<div class="glass dark:glass-dark rounded-lg border border-white/30 p-4 dark:border-gray-700/50">
  <div class="mb-3 flex items-center justify-between">
    <div class="flex items-center space-x-2">
      {#if mode === 'refine'}
        <Edit3 class="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <span class="font-medium text-gray-900 dark:text-white">Refine Message</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">(1 per minute)</span>
      {:else if mode === 'voice'}
        <Volume2 class="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span class="font-medium text-gray-900 dark:text-white">Send as Voice</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">(1 per 5 minutes)</span>
      {/if}
    </div>
    <Button
      variant="ghost"
      size="icon"
      class="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      on:click={handleCancel}
    >
      <X class="h-4 w-4" />
    </Button>
  </div>

  {#if mode === 'refine'}
    <div class="space-y-3">
      <div>
        <Label class="mb-2 block text-sm">Style</Label>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {#each refineStyles as style}
            <Button
              variant={selectedRefineStyle === style.id ? 'default' : 'outline'}
              class={cn(
                "h-auto py-2 justify-start flex-col items-start",
                selectedRefineStyle === style.id 
                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
                  : ""
              )}
              on:click={() => (selectedRefineStyle = style.id)}
            >
              <span>{style.label}</span>
              <span class="text-xs opacity-80">{style.description}</span>
            </Button>
          {/each}
        </div>
      </div>

      <div>
        <Label for="custom-instructions" class="mb-2 block text-sm">Custom Instructions (Optional)</Label>
        <Textarea
          id="custom-instructions"
          bind:value={customInstructions}
          placeholder="Add specific instructions for refinement..."
          class="glass dark:glass-dark border-white/30 dark:border-gray-700/50"
          rows={2}
        />
      </div>

      <div class="flex justify-end space-x-2">
        <Button
          variant="outline"
          on:click={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          class="gradient-primary text-white"
          on:click={handleRefine}
          disabled={loading || !messageInput.trim()}
        >
          {#if loading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Refining...
          {:else}
            <Sparkles class="mr-2 h-4 w-4" />
            Refine Message
          {/if}
        </Button>
      </div>
    </div>
  {:else if mode === 'voice'}
    <div class="space-y-3">
      <div>
        <Label class="mb-2 block text-sm">Voice Type</Label>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {#each voiceOptions as voice}
            <Button
              variant={selectedVoice === voice.id ? 'default' : 'outline'}
              class={cn(
                "h-auto py-2 justify-start flex-col items-start",
                selectedVoice === voice.id 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : ""
              )}
              on:click={() => (selectedVoice = voice.id)}
            >
              <span>{voice.label}</span>
              <span class="text-xs opacity-80">{voice.description}</span>
            </Button>
          {/each}
        </div>
      </div>

      <div class="flex justify-end space-x-2">
        <Button
          variant="outline"
          on:click={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          class="gradient-secondary text-white"
          on:click={handleVoice}
          disabled={loading || !messageInput.trim() || messageInput.length > 500}
        >
          {#if loading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Generating...
          {:else}
            <Volume2 class="mr-2 h-4 w-4" />
            Generate Voice
          {/if}
        </Button>
      </div>
      
      {#if messageInput.length > 500}
        <p class="text-sm text-red-500">
          Message is too long ({messageInput.length}/500 characters)
        </p>
      {/if}
    </div>
  {/if}
</div>