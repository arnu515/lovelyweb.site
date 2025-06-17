<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { createSupabaseClient } from '$lib/supabase'

	export let data

	$: ({ session } = data)

	onMount(() => {
		const supabase = createSupabaseClient()
		
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
			}
		})

		return () => subscription.unsubscribe()
	})
</script>

<ModeWatcher />
<main>
	<slot />
</main>