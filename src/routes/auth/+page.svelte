<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { enhance } from '$app/forms';
  import * as Alert from '$lib/components/ui/alert';
  import { Github, Loader2 } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import type { Step } from './+page.server.ts';
  import { cn } from '$lib/utils';
  import { onMount } from 'svelte';

  export let data;
  export let form;

  let loading = false;
  $: error = form?.error || '';

  $: step = (form?.step || 'email') as Step;

  // Fragment error handling
  let fragmentError: string | null = null;
  onMount(() => {
    const hash = window.location.hash?.replace(/^#/, '');
    if (hash) {
      const params = new URLSearchParams(hash);
      if (params.has('error') || params.has('error_message')) {
        fragmentError =
          params.get('error_message') ||
          params.get('error') ||
          'An unknown error occurred.';
      }
      // Remove the hash from the URL without reloading the page
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  });
</script>

<svelte:head>
  <title>Sign In - organised.today</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-900 p-4">
  <div class="w-full max-w-md">
    <div class="glass-dark rounded-2xl border border-gray-700/50 p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="mb-2 text-2xl font-bold text-white">
          {#if step === 'email'}
            Enter your email
          {:else if step === 'otp'}
            Enter sign-in code
          {:else if step === 'profile'}
            Set-up your profile
          {:else if step === 'password'}
            Enter your password
          {/if}
        </h1>
        <p class="text-gray-400">
          {#if step === 'email'}
            Enter your email to sign in/up
          {:else if step === 'password'}
            Enter your password to continue
          {:else if step === 'otp'}
            A code was sent to your email. Enter it below to continue
          {:else if step === 'profile'}
            We need a few more details to create your account
          {/if}
        </p>
      </div>

      {#if fragmentError}
        <Alert.Root variant="destructive" class="my-4 space-y-2">
          <Alert.Title>Authentication Error</Alert.Title>
          <Alert.Description>{fragmentError}</Alert.Description>
        </Alert.Root>
      {:else if error}
        <Alert.Root variant="destructive" class="my-4 space-y-2">
          <Alert.Title>An error occured</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      {:else if data.auth?.user}
        <Alert.Root variant="warning" class="my-4 space-y-2">
          <Alert.Title>You're already logged in</Alert.Title>
          <Alert.Description
            >Logged in as <code>{data.auth.user.email}</code>.<br /><a
              href="/app"
              class="text-amber-700 underline dark:text-amber-300"
              >Go to your Dashboard</a
            ></Alert.Description
          >
        </Alert.Root>
      {/if}

      <div class="space-y-6">
        {#if step === 'email'}
          <Button
            variant="outline"
            class="w-full border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
            on:click={() => goto('/auth/oauth/github')}
          >
            <Github class="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>

          <div class="flex items-center gap-2">
            <div class="w-full border-t border-gray-600"></div>
            <span class="text-gray-400">or</span>
            <div class="w-full border-t border-gray-600"></div>
          </div>
        {/if}

        <form
          use:enhance={async () => {
            loading = true;
            return async ({ update }) => {
              loading = false;
              update({ reset: false });
            };
          }}
          method="POST"
          enctype={step === 'profile' ? 'multipart/form-data' : undefined}
          class="space-y-4"
        >
          <input type="hidden" name="step" value={step} />
          {#if step === 'email'}
            <div>
              <Label
                class={cn(
                  'mb-2 block text-sm font-medium text-gray-300',
                  step !== 'email' && 'sr-only'
                )}
                for="email"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                class="w-full border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your email"
                value={form?.email || ''}
                autocomplete="email"
              />
            </div>
          {:else}
            <div class="flex items-center justify-between gap-1 text-sm">
              <p class="truncate">
                Email: <span class="font-mono text-muted-foreground"
                  >{form?.email}</span
                >
              </p>
              <Button size="sm" variant="link" on:click={() => (step = 'email')}
                >Change</Button
              >
            </div>
            <input type="hidden" name="email" value={form?.email || ''} />
          {/if}
          {#if step === 'password'}
            <div>
              <Label
                for="password"
                class="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                class="w-full border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
            </div>
          {:else if step === 'otp'}
            <div>
              <Label for="otp" class="mb-2 block text-sm font-medium text-gray-300"
                >OTP Code</Label
              >
              <Input
                id="otp"
                name="otp"
                type="text"
                required
                maxlength={8}
                minlength={8}
                class="w-full border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter OTP"
                autocomplete="one-time-code"
              />
            </div>
          {:else if step === 'profile'}
            <div>
              <Label for="name" class="mb-2 block text-sm font-medium text-gray-300"
                >Name</Label
              >
              <Input
                id="name"
                name="name"
                type="text"
                required
                class="w-full border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Your name"
                autocomplete="name"
              />
            </div>
            <div>
              <Label
                for="username"
                class="mb-2 block text-sm font-medium text-gray-300"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                class="w-full border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Choose a username"
                autocomplete="username"
              />
            </div>
            <div>
              <Label
                for="password"
                class="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                class="w-full border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter a password"
                autocomplete="new-password"
              />
            </div>
          {/if}
          <Button
            class="gradient-primary w-full gap-2 text-white"
            disabled={loading}
            type="submit"
          >
            {#if loading}
              <Loader2 class="size-5 animate-spin" />
            {/if}
            {#if step === 'email'}
              Continue
            {:else if step === 'otp'}
              Continue
            {:else if step === 'profile'}
              Create Account
            {:else if step === 'password'}
              Sign In
            {/if}
          </Button>
        </form>

        <!-- Terms -->
        <p class="text-center text-xs text-gray-500">
          By continuing, you agree to lovelyweb.site's
          <a href="/terms" class="text-purple-400 hover:text-purple-300 hover:underline"
            >Terms of Service</a
          > and <a href="/privacy" class="text-purple-400 hover:text-purple-300 hover:underline"
            >Privacy Policy</a>.
        </p>
      </div>
    </div>
  </div>
</div>
