<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import Features from '$lib/components/Features.svelte';
  import Pricing from '$lib/components/Pricing.svelte';
  import About from '$lib/components/About.svelte';
</script>

<svelte:head>
  <title>lovelyweb.site - AI-Powered Communication Platform</title>
  <meta
    name="description"
    content="Unify email, chat, and meetings with AI-powered organisation. Never miss important communications again with lovelyweb.site."
  />
  <meta
    name="keywords"
    content="email management, team chat, video meetings, AI communication, productivity, lovelyweb.site"
  />
  <meta
    property="og:title"
    content="lovelyweb.site - AI-Powered Communication Platform"
  />
  <meta
    property="og:description"
    content="Unify email, chat, and meetings with AI-powered organisation. Never miss important communications again."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lovelyweb.site" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="lovelyweb.site - AI-Powered Communication Platform"
  />
  <meta
    name="twitter:description"
    content="Unify email, chat, and meetings with AI-powered organisation. Never miss important communications again."
  />
</svelte:head>
<Hero />
<Features />
<Pricing />
<About />
