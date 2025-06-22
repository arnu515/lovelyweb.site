<script lang="ts">
  import { Mail, UserPlus, Users, Calendar } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { formatRelative } from 'date-fns';
  import { Root as Skeleton } from '$lib/components/ui/skeleton';
  import { createBrowserClient } from '@supabase/ssr';
  import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL
  } from '$env/static/public';
  import { onDestroy } from 'svelte';
  import type { Database } from '$lib/database.types';
  import { z } from 'zod/v4';
  import * as Alert from '$lib/components/ui/alert';
  import { toast } from 'svelte-sonner';
  import { invalidate } from '$app/navigation';

  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  export let data;

  let email = '';
  let message = '';
  let loading = false;
  let error = '';

  // User profile preview state
  let userProfile: { name: string; avatar_url: string } | null = null;
  let userProfileLoading = false;
  let userProfileError: string | null = null;

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  let abortController: AbortController | null = null;

  const emailSchema = z.email().min(8).max(255).trim();

  const userProfileCache = new Map<
    string,
    { name: string; avatar_url: string; id: string; username: string } | null
  >();

  function fetchUserProfile(email: string) {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (abortController) abortController.abort('aborted');
    if (!email || !emailSchema.safeParse(email).success) return;
    userProfileLoading = true;
    userProfile = null;
    userProfileError = null;

    if (userProfileCache.has(email)) {
      const cachedProfile = userProfileCache.get(email);
      if (cachedProfile) {
        userProfile = cachedProfile;
        userProfileError = null;
      } else {
        userProfile = null;
        userProfileError = 'No user found for this email.';
      }
      userProfileLoading = false;
      return;
    }

    debounceTimeout = setTimeout(async () => {
      abortController = new AbortController();
      try {
        const { data: user, error } = await supabase
          .rpc('get_user_by_email', { email })
          .abortSignal(abortController.signal)
          .single();
        if (!abortController.signal.aborted) {
          if (error && !error.message.includes('AbortError')) {
            console.error(error);
            userProfileError = 'No user found for this email.';
            userProfile = null;
            userProfileCache.set(email, null);
          } else if (user && user.name && user.avatar_url) {
            userProfile = { name: user.name, avatar_url: user.avatar_url };
            userProfileError = null;
            userProfileCache.set(email, user);
          }
        }
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error(err);
          userProfileError = 'Error fetching user profile.';
          userProfile = null;
        }
      } finally {
        userProfileLoading = false;
      }
    }, 300);
  }

  async function inviteUser(fd: FormData): Promise<boolean> {
    error = '';
    const res = z
      .object({
        email: emailSchema,
        message: z.string().min(10).max(500).trim().optional().or(z.literal(''))
      })
      .safeParse(Object.fromEntries(fd.entries()));
    if (!res.success) {
      error = z.prettifyError(res.error);
      console.error(error);
      return false;
    }
    if (!userProfileCache.has) {
      error = 'Please wait until the profile is fetched';
      return false;
    }
    const profile = userProfileCache.get(res.data.email);
    if (!profile) {
      error = 'This email does not exist';
      return false;
    }
    if (profile.id === data.auth.user.id) {
      error = "You can't invite yourself.";
      return false;
    }

    loading = true;
    const { data: existingInvite, error: inviteCheckError } = await supabase
      .from('org_invites')
      .select('invitee')
      .eq('org_id', data.org.id)
      .eq('invitee', profile.id)
      .maybeSingle();

    if (inviteCheckError) {
      loading = false;
      error = 'Error checking existing invites: ' + inviteCheckError.message;
      return false;
    }
    if (existingInvite) {
      loading = false;
      error = 'This user has already been invited to this organisation.';
      return false;
    }

    const { data: existingMember, error: memberCheckError } = await supabase
      .from('organisations_users')
      .select('user_id')
      .eq('organisation_id', data.org.id)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (memberCheckError) {
      loading = false;
      error = 'Error checking organisation membership: ' + memberCheckError.message;
      return false;
    }
    if (existingMember) {
      loading = false;
      error = 'This user is already a member of this organisation.';
      return false;
    }

    const { error: invErr } = await supabase.from('org_invites').insert({
      invitee: profile.id,
      org_id: data.org.id,
      message: res.data.message || null
    });
    if (invErr) {
      loading = false;
      error = invErr.message;
      return false;
    }
    toast('User has been invited', {
      description: `${profile.name} has been invited to ${data.org.name}`
    });

    await invalidate(`org:${data.org.id}:invites`);
    loading = false;
    return true;
  }

  onDestroy(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (abortController) abortController.abort();
  });
</script>

<div
  class="flex min-h-screen items-start justify-center bg-transparent px-2 py-12 sm:px-6 md:px-8"
>
  <div class="flex w-full max-w-3xl flex-col gap-8">
    <div class="px-2 sm:px-0">
      <div class="glass dark:glass-dark animate-slide-up rounded-2xl p-8">
        <div class="mb-6 flex items-center gap-4">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600"
          >
            <Users class="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Invited Users
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              People you've invited to join your organisation.
            </p>
          </div>
        </div>
        {#await data.invites}
          <div class="space-y-4">
            {#each Array(3) as _, i}
              <Skeleton class="mb-2 h-20 w-full" />
            {/each}
          </div>
        {:then invites}
          {#if invites && invites.length > 0}
            <div class="space-y-4">
              {#each invites as invite (invite.invitee)}
                <div
                  class="flex flex-col gap-4 rounded-xl bg-white/60 p-4 shadow-sm backdrop-blur-md dark:bg-gray-900/60"
                >
                  <div
                    class="flex flex-col justify-between gap-2 md:flex-row md:items-center"
                  >
                    <div class="flex items-center gap-3">
                      <img
                        src={invite.users.avatar_url}
                        alt="{invite.users.name}'s Avatar"
                        class="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div class="font-semibold text-gray-900 dark:text-white">
                          {invite.users.name}
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-2 md:items-center">
                      <div
                        class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
                      >
                        <Calendar class="h-4 w-4" />
                        Invited {formatRelative(invite.created_at, new Date())}
                      </div>
                    </div>
                  </div>
                  <div class="flex-1 md:ml-8">
                    {#if invite.message}
                      <div
                        class="rounded bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-2 text-sm text-gray-700 dark:from-purple-900/30 dark:to-indigo-900/30 dark:text-gray-200"
                      >
                        <span class="font-medium">Message:</span>
                        {invite.message}
                      </div>
                    {/if}
                    <Button
                      size="sm"
                      variant="destructive"
                      class="mt-2"
                      disabled={loading}
                      on:click={async () => {
                        loading = true;
                        const { error: delErr } = await supabase
                          .from('org_invites')
                          .delete()
                          .eq('org_id', data.org.id)
                          .eq('invitee', invite.invitee);
                        if (delErr) {
                          toast('Failed to cancel invite', {
                            description: delErr.message
                          });
                          loading = false;
                        } else {
                          toast('Invite cancelled', {
                            description: `Invite for ${invite.users.name} has been cancelled.`
                          });
                          await invalidate(`org:${data.org.id}:invites`);
                          loading = false;
                        }
                      }}
                    >
                      Cancel Invite
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="py-10 text-center">
              <div
                class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600"
              >
                <Mail class="h-8 w-8 text-white" />
              </div>
              <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                No Invited Users Yet
              </h3>
              <p class="text-gray-600 dark:text-gray-300">
                You haven't invited anyone to your organisation yet.
              </p>
            </div>
          {/if}
        {/await}
      </div>
    </div>

    <div class="px-2 sm:px-0">
      <div class="glass dark:glass-dark animate-slide-up rounded-2xl p-8">
        <div class="mb-6 flex items-center gap-4">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600"
          >
            <UserPlus class="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Invite a User
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              Enter an email to invite someone to your organisation.
            </p>
          </div>
        </div>
        {#if error}
          <Alert.Root variant="destructive" class="my-4 space-y-2">
            <Alert.Title>An error occured</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        {/if}
        <form
          class="space-y-6"
          on:submit|preventDefault={e =>
            inviteUser(new FormData(e.currentTarget)).then(
              i => i && e.currentTarget?.reset()
            )}
        >
          <div>
            <label
              for="invite-email"
              class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Email *
            </label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              minlength={8}
              maxlength={255}
              on:input={e => fetchUserProfile(e.currentTarget.value)}
              placeholder="user@email.com"
              class="glass dark:glass-dark w-full border-white/30 dark:border-gray-700/50"
              bind:value={email}
              required
            />
            {#if email && email.length > 3}
              <div class="mt-4">
                {#if userProfileLoading}
                  <div
                    class="flex animate-pulse items-center gap-3 rounded-xl border-2 border-purple-400 bg-purple-100/40 px-4 py-3 dark:bg-purple-900/20"
                  >
                    <div
                      class="h-10 w-10 rounded-full bg-purple-300/60 dark:bg-purple-700/60"
                    ></div>
                    <div>
                      <div
                        class="mb-1 h-4 w-24 rounded bg-purple-200/80 dark:bg-purple-800/60"
                      ></div>
                      <div
                        class="h-3 w-36 rounded bg-purple-200/60 dark:bg-purple-800/40"
                      ></div>
                    </div>
                  </div>
                {:else if userProfile}
                  <div
                    class="flex items-center gap-3 rounded-xl border-2 border-purple-500 bg-gradient-to-r from-purple-100/70 to-indigo-100/60 px-4 py-3 shadow dark:from-purple-900/40 dark:to-indigo-900/30"
                  >
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.name}
                      class="h-10 w-10 rounded-full border-2 border-purple-400 object-cover"
                    />
                    <div>
                      <div
                        class="font-semibold text-purple-900 dark:text-purple-200"
                      >
                        {userProfile.name}
                      </div>
                      <div class="text-sm text-gray-700 dark:text-gray-300">
                        {email}
                      </div>
                    </div>
                  </div>
                {:else if userProfileError}
                  <div
                    class="rounded-xl border-2 border-purple-300 bg-purple-100/40 px-4 py-3 text-purple-700 dark:bg-purple-900/20 dark:text-purple-200"
                  >
                    {userProfileError}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
          <div>
            <label
              for="invite-message"
              class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Message <span class="text-xs text-gray-400">(optional)</span>
            </label>
            <Textarea
              minlength={10}
              maxlength={500}
              id="invite-message"
              placeholder="Add a message (optional)"
              name="message"
              class="glass dark:glass-dark w-full border-white/30 dark:border-gray-700/50"
              rows={3}
              bind:value={message}
            />
          </div>
          <Button
            type="submit"
            class="gradient-primary w-full gap-2 text-white"
            disabled={loading || !userProfile}
          >
            <UserPlus class="h-4 w-4" />
            Send Invite
          </Button>
        </form>
      </div>
    </div>
  </div>
</div>
