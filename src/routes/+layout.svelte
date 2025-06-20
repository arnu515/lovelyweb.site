<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';
  import { Toaster } from '$lib/components/ui/sonner';

  export let data: LayoutData;
  $: ({
    auth: { session },
    supabase
  } = data);

  onMount(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at)
        invalidate('supabase:auth');
    });

    return () => subscription.unsubscribe();
  });
</script>

<ModeWatcher />
<Toaster />
<main>
  <slot />
</main>
