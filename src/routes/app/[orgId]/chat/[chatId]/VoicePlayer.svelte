<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { 
    Play, 
    Pause, 
    Loader2,
    Download,
    Trash2
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import { createEventDispatcher } from 'svelte';

  export let messageId: string;
  export let orgId: string;
  export let isGroup: boolean;
  export let duration: number;
  export const size: number = 0;
  export let isOwn: boolean = false;
  
  const dispatch = createEventDispatcher<{
    delete: { messageId: string; isGroup: boolean };
  }>();
 
  // Playback speed options
  const speedOptions = [0.5, 1, 1.5, 2];
  let currentSpeedIndex = 1; // Start with 1x speed
  let playbackSpeed = speedOptions[currentSpeedIndex];

  let isPlaying = false;
  let isLoading = false;
  let currentTime = 0;
  let audioElement: HTMLAudioElement | null = null;
  let audioUrl: string | null = null;

  onDestroy(() => {
    cleanup();
  });

  function cleanup() {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      audioElement = null;
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }
  }

  async function fetchSignedUrl() {
    try {
      const response = await fetch('/api/voice/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          orgId,
          isGroup
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get audio URL');
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      toast.error('Failed to load audio', {
        description: error.message
      });
      throw error;
    }
  }

  async function initializeAudio() {
    if (audioElement) return;

    isLoading = true;
    try {
      const signedUrl = await fetchSignedUrl();
      
      // Fetch the audio data
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error('Failed to fetch audio');
      
      const audioBlob = await response.blob();
      audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element
      audioElement = new Audio(audioUrl);
      audioElement.preload = 'metadata';

      // Set playback speed
      audioElement.playbackRate = playbackSpeed;

      // Set up event listeners
      audioElement.addEventListener('loadedmetadata', () => {});

      audioElement.addEventListener('timeupdate', () => {
        if (audioElement) currentTime = audioElement.currentTime;
      });

      audioElement.addEventListener('ended', () => {
        isPlaying = false;
        currentTime = 0;
      });

      audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast.error('Failed to play audio');
        isPlaying = false;
      });

      audioElement.load();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    } finally {
      isLoading = false;
    }
  }

  async function togglePlayback() {
    if (!audioElement) {
      await initializeAudio();
      if (!audioElement) return;
    }

    // Update playback speed
    if (audioElement) {
      audioElement.playbackRate = playbackSpeed;
    }

    if (isPlaying) {
      audioElement.pause();
      isPlaying = false;
    } else {
      try {
        await audioElement.play();
        isPlaying = true;
      } catch (error) {
        console.error('Failed to play audio:', error);
        toast.error('Failed to play audio');
      }
    }
  }

  function togglePlaybackSpeed() {
    currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
    playbackSpeed = speedOptions[currentSpeedIndex];
    
    if (audioElement) {
      audioElement.playbackRate = playbackSpeed;
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class={cn(
  "flex items-center space-x-3 rounded-2xl p-4 min-w-[280px] max-w-[400px]",
  isOwn 
    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
)}>
  <!-- Play/Pause Button -->
  <Button
    variant="ghost"
    size="icon"
    class={cn(
      "h-12 w-12 rounded-full flex-shrink-0 transition-all duration-200",
      isOwn 
        ? "bg-white/20 hover:bg-white/30 text-white" 
        : "bg-purple-100 hover:bg-purple-200 text-purple-600 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-400"
    )}
    on:click={togglePlayback}
    disabled={isLoading}
  >
    {#if isLoading}
      <Loader2 class="h-6 w-6 animate-spin" />
    {:else if isPlaying}
      <Pause class="h-6 w-6" />
    {:else}
      <Play class="h-6 w-6 ml-0.5" />
    {/if}
  </Button>

  <!-- Audio Content -->
  <div class="flex-1 min-w-0">
    <div class="flex flex-col gap-1">
        <div
          class={cn(
            "relative h-2 rounded-full cursor-pointer transition-all duration-200",
            isOwn 
              ? "bg-white/20 hover:bg-white/30" 
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          )}
        >
          <!-- Progress Fill -->
          <div
            class={cn(
              "h-full rounded-full transition-all duration-100",
              isOwn 
                ? "bg-white" 
                : "bg-purple-500 dark:bg-purple-400"
            )}
            style="width: {audioElement ? (currentTime / duration) * 100 : 0}%"
          ></div>
        </div>
    </div>

    <!-- Time and Info -->
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center space-x-2">
        <span class="font-medium">
          {audioElement ? formatTime(currentTime) : '0:00'} / {formatTime(duration)}
        </span>
      </div>
      
      <div class="flex items-center space-x-2 opacity-70">
        <!-- Playback Speed Button -->
        <Button
          variant="ghost" 
          size="sm"
          class="h-6 px-2 text-xs opacity-70 hover:opacity-100"
          on:click={togglePlaybackSpeed}
          title="Change playback speed"
        >
          <span class="font-mono">{playbackSpeed}x</span>
        </Button>
        
        {#if audioUrl}
          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6 opacity-70 hover:opacity-100"
            on:click={() => {
              if (audioUrl) {
                const a = document.createElement('a');
                a.href = audioUrl;
                a.download = `voice-message-${messageId}.webm`;
                a.click();
              }
            }}
            title="Download"
          >
            <Download class="h-3 w-3" />
          </Button>
        {/if}
      </div>
      
      <!-- Delete button (only shown for own messages when hovered) -->
      {#if isOwn}
        <div class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6 bg-white/90 text-gray-600 hover:bg-white hover:text-red-600 dark:bg-gray-800/90 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
            on:click={() => dispatch('delete', { messageId, isGroup })}
            title="Delete message"
          >
            <Trash2 class="h-3 w-3" />
          </Button>
        </div>
      {/if}
    </div>
  </div>
</div>
