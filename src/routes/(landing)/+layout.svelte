<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<Header isLoggedIn={!!data.auth.session} />
<slot />
<Footer />
