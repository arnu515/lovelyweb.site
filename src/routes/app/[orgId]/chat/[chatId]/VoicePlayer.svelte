<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { 
    Play, 
    Pause, 
    Volume2, 
    Loader2,
    Download
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  export let messageId: string;
  export let orgId: string;
  export let isGroup: boolean;
  export let duration: number;
  export let size: number;
  export let isOwn: boolean = false;

  const dispatch = createEventDispatcher();

  let isPlaying = false;
  let isLoading = false;
  let currentTime = 0;
  let audioElement: HTMLAudioElement | null = null;
  let audioUrl: string | null = null;
  let progressBarElement: HTMLDivElement;
  let isDragging = false;

  // Audio visualization
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array | null = null;
  let animationFrame: number | null = null;
  let waveformCanvas: HTMLCanvasElement;
  let showWaveform = false;

  onMount(() => {
    // Check if we can show waveform (requires AudioContext support)
    try {
      const testContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      testContext.close();
      showWaveform = true;
    } catch {
      showWaveform = false;
    }
  });

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

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    analyser = null;
    dataArray = null;
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

      // Set up event listeners
      audioElement.addEventListener('loadedmetadata', () => {
        if (showWaveform) {
          setupAudioVisualization();
        }
      });

      audioElement.addEventListener('timeupdate', () => {
        if (audioElement && !isDragging) {
          currentTime = audioElement.currentTime;
        }
      });

      audioElement.addEventListener('ended', () => {
        isPlaying = false;
        currentTime = 0;
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      });

      audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast.error('Failed to play audio');
        isPlaying = false;
      });

      await audioElement.load();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    } finally {
      isLoading = false;
    }
  }

  function setupAudioVisualization() {
    if (!audioElement || !waveformCanvas) return;

    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioElement);
      analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      dataArray = new Uint8Array(analyser.frequencyBinCount);
      drawWaveform();
    } catch (error) {
      console.error('Failed to setup audio visualization:', error);
      showWaveform = false;
    }
  }

  function drawWaveform() {
    if (!analyser || !dataArray || !waveformCanvas || !isPlaying) return;

    const ctx = waveformCanvas.getContext('2d');
    if (!ctx) return;

    analyser.getByteFrequencyData(dataArray);

    const width = waveformCanvas.width;
    const height = waveformCanvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / dataArray.length * 2;
    let x = 0;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isOwn ? '#8b5cf6' : '#3b82f6');
    gradient.addColorStop(1, isOwn ? '#3b82f6' : '#8b5cf6');

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.6;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      
      x += barWidth;
    }

    animationFrame = requestAnimationFrame(drawWaveform);
  }

  async function togglePlayback() {
    if (!audioElement) {
      await initializeAudio();
      if (!audioElement) return;
    }

    if (isPlaying) {
      audioElement.pause();
      isPlaying = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    } else {
      try {
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        await audioElement.play();
        isPlaying = true;
        if (showWaveform && analyser && dataArray) {
          drawWaveform();
        }
      } catch (error) {
        console.error('Failed to play audio:', error);
        toast.error('Failed to play audio');
      }
    }
  }

  function handleProgressClick(event: MouseEvent) {
    if (!audioElement || !progressBarElement) return;

    const rect = progressBarElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioElement.duration;
    
    audioElement.currentTime = newTime;
    currentTime = newTime;
  }

  function handleProgressMouseDown(event: MouseEvent) {
    isDragging = true;
    handleProgressClick(event);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleProgressClick(e);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
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
    <!-- Waveform or Progress Bar -->
    <div class="mb-2">
      {#if showWaveform && isPlaying && audioElement}
        <canvas
          bind:this={waveformCanvas}
          width="300"
          height="40"
          class="w-full h-10 rounded cursor-pointer"
          on:click={handleProgressClick}
          on:mousedown={handleProgressMouseDown}
        ></canvas>
      {:else}
        <!-- Progress Bar -->
        <div
          bind:this={progressBarElement}
          class={cn(
            "relative h-2 rounded-full cursor-pointer transition-all duration-200",
            isOwn 
              ? "bg-white/20 hover:bg-white/30" 
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          )}
          on:click={handleProgressClick}
          on:mousedown={handleProgressMouseDown}
          role="slider"
          tabindex="0"
          aria-label="Audio progress"
        >
          <!-- Progress Fill -->
          <div
            class={cn(
              "h-full rounded-full transition-all duration-100",
              isOwn 
                ? "bg-white" 
                : "bg-purple-500 dark:bg-purple-400"
            )}
            style="width: {audioElement ? (currentTime / audioElement.duration) * 100 : 0}%"
          ></div>
          
          <!-- Progress Handle -->
          {#if audioElement && currentTime > 0}
            <div
              class={cn(
                "absolute top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 transition-all duration-100 shadow-lg",
                isOwn 
                  ? "bg-white" 
                  : "bg-purple-500 dark:bg-purple-400"
              )}
              style="left: {(currentTime / audioElement.duration) * 100}%"
            ></div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Time and Info -->
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center space-x-2">
        <Volume2 class="h-4 w-4 opacity-70" />
        <span class="font-medium">
          {audioElement ? formatTime(currentTime) : '0:00'} / {formatTime(duration)}
        </span>
      </div>
      
      <div class="flex items-center space-x-2 opacity-70">
        <span class="text-xs">{formatSize(size)}</span>
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
    </div>
  </div>
</div>

<style>
  canvas {
    image-rendering: pixelated;
  }
</style>