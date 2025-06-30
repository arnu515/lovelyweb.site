<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { 
    Mic, 
    Square, 
    Play, 
    Pause, 
    Send, 
    X, 
    MicOff 
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  const dispatch = createEventDispatcher<{
    cancel: void;
    send: { blob: Blob; duration: number };
  }>();

  let mediaRecorder: MediaRecorder | null = null;
  let audioStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array | null = null;
  let animationFrame: number | null = null;

  let isRecording = false;
  let isPaused = false;
  let isPlaying = false;
  let recordedBlob: Blob | null = null;
  let recordedAudio: HTMLAudioElement | null = null;
  let duration = 0;
  let maxDuration = 30; // 30 seconds max
  let waveformCanvas: HTMLCanvasElement;

  let recordingTimer: ReturnType<typeof setInterval> | null = null;

  onMount(async () => {
    await initializeRecording();
  });

  onDestroy(() => {
    cleanup();
  });

  async function initializeRecording() {
    try {
      // Request microphone permission
      audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Set up audio context for waveform visualization
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(audioStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Set up MediaRecorder
      mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        recordedBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        chunks.length = 0;
      };

      // Start recording immediately
      startRecording();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
      dispatch('cancel');
    }
  }

  function startRecording() {
    if (!mediaRecorder || !audioContext) return;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    mediaRecorder.start();
    isRecording = true;
    isPaused = false;
    duration = 0;

    // Start timer
    recordingTimer = setInterval(() => {
      duration += 0.1;
      if (duration >= maxDuration) {
        stopRecording();
      }
    }, 100);

    // Start waveform animation
    drawWaveform();
  }

  function pauseRecording() {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') return;

    mediaRecorder.pause();
    isPaused = true;
    
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function resumeRecording() {
    if (!mediaRecorder || mediaRecorder.state !== 'paused') return;

    mediaRecorder.resume();
    isPaused = false;

    // Resume timer
    recordingTimer = setInterval(() => {
      duration += 0.1;
      if (duration >= maxDuration) {
        stopRecording();
      }
    }, 100);

    // Resume waveform animation
    drawWaveform();
  }

  function stopRecording() {
    if (!mediaRecorder) return;

    if (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused') {
      mediaRecorder.stop();
    }

    isRecording = false;
    isPaused = false;

    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    // Clear the canvas
    if (waveformCanvas) {
      const ctx = waveformCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
      }
    }
  }

  function drawWaveform() {
    if (!analyser || !dataArray || !waveformCanvas || !isRecording || isPaused) return;

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
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#3b82f6');

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      
      x += barWidth;
    }

    animationFrame = requestAnimationFrame(drawWaveform);
  }

  async function playRecording() {
    if (!recordedBlob) return;

    if (recordedAudio) {
      recordedAudio.pause();
      recordedAudio = null;
    }

    recordedAudio = new Audio(URL.createObjectURL(recordedBlob));
    recordedAudio.onended = () => {
      isPlaying = false;
    };

    isPlaying = true;
    await recordedAudio.play();
  }

  function pausePlayback() {
    if (recordedAudio) {
      recordedAudio.pause();
      isPlaying = false;
    }
  }

  function sendRecording() {
    if (!recordedBlob) return;

    // Dummy function as requested
    const durationInSeconds = Math.round(duration * 10) / 10;
    const sizeInBytes = recordedBlob.size;
    const sizeInKB = Math.round(sizeInBytes / 1024 * 10) / 10;

    console.log(`Voice message recorded:
      Duration: ${durationInSeconds} seconds
      Size: ${sizeInBytes} bytes (${sizeInKB} KB)
      Type: ${recordedBlob.type}`);

    dispatch('send', { blob: recordedBlob, duration: durationInSeconds });
  }

  function cancelRecording() {
    cleanup();
    dispatch('cancel');
  }

  function cleanup() {
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
      mediaRecorder.stop();
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      audioStream = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    if (recordedAudio) {
      recordedAudio.pause();
      recordedAudio = null;
    }

    mediaRecorder = null;
    analyser = null;
    dataArray = null;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="glass dark:glass-dark rounded-2xl border border-white/30 p-4 dark:border-gray-700/50">
  <!-- Header -->
  <div class="mb-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
        <Mic class="h-4 w-4 text-white" />
      </div>
      <span class="font-medium text-gray-900 dark:text-white">
        {#if isRecording}
          {isPaused ? 'Recording Paused' : 'Recording...'}
        {:else if recordedBlob}
          Voice Message Ready
        {:else}
          Preparing...
        {/if}
      </span>
    </div>
    
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-gray-500 hover:text-red-500"
      on:click={cancelRecording}
    >
      <X class="h-4 w-4" />
    </Button>
  </div>

  <!-- Waveform or Playback Area -->
  <div class="mb-4">
    {#if isRecording || isPaused}
      <!-- Recording Waveform -->
      <div class="relative">
        <canvas
          bind:this={waveformCanvas}
          width="400"
          height="80"
          class="w-full rounded-lg bg-gray-100 dark:bg-gray-800"
        ></canvas>
        
        <!-- Recording indicator -->
        {#if isRecording && !isPaused}
          <div class="absolute right-2 top-2 flex items-center gap-1">
            <div class="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
            <span class="text-xs font-medium text-red-500">REC</span>
          </div>
        {/if}
      </div>
    {:else if recordedBlob}
      <!-- Playback Area -->
      <div class="flex items-center justify-center rounded-lg bg-gray-100 p-8 dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            class="h-12 w-12 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800"
            on:click={isPlaying ? pausePlayback : playRecording}
          >
            {#if isPlaying}
              <Pause class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            {:else}
              <Play class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            {/if}
          </Button>
          
          <div class="text-center">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              Voice Message
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Loading State -->
      <div class="flex items-center justify-center rounded-lg bg-gray-100 p-8 dark:bg-gray-800">
        <div class="flex items-center gap-2">
          <MicOff class="h-5 w-5 text-gray-400" />
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Initializing microphone...
          </span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Timer and Progress -->
  <div class="mb-4">
    <div class="flex items-center justify-between text-sm">
      <span class="font-mono text-gray-600 dark:text-gray-400">
        {formatTime(duration)}
      </span>
      <span class="text-xs text-gray-500 dark:text-gray-400">
        Max: {formatTime(maxDuration)}
      </span>
    </div>
    
    <!-- Progress Bar -->
    <div class="mt-2 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        class="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-100"
        style="width: {Math.min((duration / maxDuration) * 100, 100)}%"
      ></div>
    </div>
  </div>

  <!-- Controls -->
  <div class="flex items-center justify-center gap-3">
    {#if isRecording}
      <!-- Recording Controls -->
      <Button
        variant="outline"
        size="sm"
        class="gap-2"
        on:click={isPaused ? resumeRecording : pauseRecording}
      >
        {#if isPaused}
          <Mic class="h-4 w-4" />
          Resume
        {:else}
          <Pause class="h-4 w-4" />
          Pause
        {/if}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        class="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        on:click={stopRecording}
      >
        <Square class="h-4 w-4" />
        Stop
      </Button>
    {:else if recordedBlob}
      <!-- Playback Controls -->
      <Button
        variant="outline"
        size="sm"
        class="gap-2"
        on:click={() => {
          recordedBlob = null;
          duration = 0;
          initializeRecording();
        }}
      >
        <Mic class="h-4 w-4" />
        Re-record
      </Button>
      
      <Button
        class="gradient-primary gap-2 text-white"
        size="sm"
        on:click={sendRecording}
      >
        <Send class="h-4 w-4" />
        Send
      </Button>
    {/if}
  </div>

  <!-- Mobile-specific adjustments -->
  <style>
    @media (max-width: 640px) {
      canvas {
        height: 60px;
      }
    }
  </style>
</div>