<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Github, Mail, ArrowLeft, Loader2 } from "lucide-svelte";
	import { createSupabaseClient } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let showPassword = false;
	let showMagicLink = false;
	let loading = false;
	let error = '';
	let success = '';
	let emailExists = false;
	let hasPassword = false;

	const supabase = createSupabaseClient();

	onMount(() => {
		// Check if user is already logged in
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				goto('/app');
			}
		});
	});

	async function signInWithGitHub() {
		loading = true;
		error = '';
		
		const { error: authError } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: `${window.location.origin}/app`
			}
		});

		if (authError) {
			error = authError.message;
		}
		loading = false;
	}

	async function checkEmail() {
		if (!email) {
			error = 'Email is required';
			return;
		}

		loading = true;
		error = '';

		// Try to sign in with a dummy password to check if user exists
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password: 'dummy-password-check'
		});

		if (signInError) {
			if (signInError.message.includes('Invalid login credentials')) {
				// User might exist but wrong password, or user doesn't exist
				// Try to sign up to see if email is already registered
				const { error: signUpError } = await supabase.auth.signUp({
					email,
					password: 'dummy-password-check'
				});

				if (signUpError && signUpError.message.includes('already registered')) {
					// User exists, ask for password
					emailExists = true;
					hasPassword = true;
					showPassword = true;
				} else {
					// User doesn't exist, send magic link
					emailExists = false;
					sendMagicLink();
					return;
				}
			} else {
				error = signInError.message;
			}
		} else {
			// This shouldn't happen with dummy password, but just in case
			goto('/app');
		}

		loading = false;
	}

	async function signInWithPassword() {
		if (!password) {
			error = 'Password is required';
			return;
		}

		loading = true;
		error = '';

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (signInError) {
			if (signInError.message.includes('Invalid login credentials')) {
				// User might not have a password set, send magic link
				hasPassword = false;
				showMagicLink = true;
				sendMagicLink();
				return;
			} else {
				error = signInError.message;
			}
		} else {
			goto('/app');
		}

		loading = false;
	}

	async function sendMagicLink() {
		loading = true;
		error = '';
		success = '';

		const { error: magicLinkError } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${window.location.origin}/app`
			}
		});

		if (magicLinkError) {
			error = magicLinkError.message;
		} else {
			success = 'Check your email for a magic link to sign in!';
			showMagicLink = true;
		}

		loading = false;
	}

	function resetForm() {
		email = '';
		password = '';
		showPassword = false;
		showMagicLink = false;
		error = '';
		success = '';
		emailExists = false;
		hasPassword = false;
	}
</script>

<svelte:head>
	<title>Sign In - organised.today</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="glass-dark rounded-2xl p-8 border border-gray-700/50">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-2xl font-bold text-white mb-2">
					{showMagicLink ? 'Check your email' : showPassword ? 'Welcome back' : 'Welcome back'}
				</h1>
				<p class="text-gray-400">
					{showMagicLink ? 'We sent you a magic link' : showPassword ? 'Enter your password to continue' : 'Sign in to your account'}
				</p>
			</div>

			{#if showMagicLink}
				<!-- Magic Link Sent -->
				<div class="text-center space-y-6">
					<div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
						<Mail class="w-8 h-8 text-green-400" />
					</div>
					<div>
						<p class="text-green-400 mb-2">Magic link sent!</p>
						<p class="text-gray-400 text-sm">
							Check your email and click the link to sign in.
						</p>
					</div>
					<Button 
						variant="ghost" 
						class="w-full text-gray-400 hover:text-white"
						on:click={resetForm}
					>
						<ArrowLeft class="w-4 h-4 mr-2" />
						Back to sign in
					</Button>
				</div>
			{:else}
				<!-- Sign In Form -->
				<div class="space-y-6">
					<!-- GitHub Sign In -->
					<Button 
						variant="outline" 
						class="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
						on:click={signInWithGitHub}
						disabled={loading}
					>
						{#if loading}
							<Loader2 class="w-4 h-4 mr-2 animate-spin" />
						{:else}
							<Github class="w-4 h-4 mr-2" />
						{/if}
						Continue with GitHub
					</Button>

					<!-- Divider -->
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-gray-600"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="px-2 bg-gray-900 text-gray-400">or</span>
						</div>
					</div>

					<!-- Email Form -->
					<div class="space-y-4">
						<div>
							<label for="email" class="block text-sm font-medium text-gray-300 mb-2">
								Email
							</label>
							<input
								id="email"
								type="email"
								bind:value={email}
								disabled={showPassword || loading}
								class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
								placeholder="Enter your email"
								on:keydown={(e) => e.key === 'Enter' && !showPassword && checkEmail()}
							/>
						</div>

						{#if showPassword}
							<div>
								<div class="flex items-center justify-between mb-2">
									<label for="password" class="block text-sm font-medium text-gray-300">
										Password
									</label>
									<button 
										class="text-sm text-purple-400 hover:text-purple-300"
										on:click={() => {
											showPassword = false;
											sendMagicLink();
										}}
									>
										Forgot Password?
									</button>
								</div>
								<input
									id="password"
									type="password"
									bind:value={password}
									disabled={loading}
									class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									placeholder="Enter your password"
									on:keydown={(e) => e.key === 'Enter' && signInWithPassword()}
								/>
							</div>
						{/if}

						<!-- Error Message -->
						{#if error}
							<div class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
								{error}
							</div>
						{/if}

						<!-- Success Message -->
						{#if success}
							<div class="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
								{success}
							</div>
						{/if}

						<!-- Submit Button -->
						<Button 
							class="w-full gradient-primary text-white"
							on:click={showPassword ? signInWithPassword : checkEmail}
							disabled={loading || !email}
						>
							{#if loading}
								<Loader2 class="w-4 h-4 mr-2 animate-spin" />
							{/if}
							{showPassword ? 'Sign In' : 'Continue'}
						</Button>

						{#if showPassword}
							<Button 
								variant="ghost" 
								class="w-full text-gray-400 hover:text-white"
								on:click={resetForm}
							>
								<ArrowLeft class="w-4 h-4 mr-2" />
								Back
							</Button>
						{/if}
					</div>

					<!-- Terms -->
					<p class="text-xs text-gray-500 text-center">
						By continuing, you agree to organised.today's 
						<a href="#" class="text-purple-400 hover:text-purple-300">Terms of Service</a> and 
						<a href="#" class="text-purple-400 hover:text-purple-300">Privacy Policy</a>, 
						and to receive periodic emails with updates.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>