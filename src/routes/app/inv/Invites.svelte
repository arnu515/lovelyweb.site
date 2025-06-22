<script lang="ts">
  import {
    Check,
    X,
    Calendar,
    ExternalLink,
    Mail
  } from 'lucide-svelte';
  import { createBrowserClient } from '@supabase/ssr';
  import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
  import { Button } from '$lib/components/ui/button';
  import type { Database } from '$lib/database.types';
  import { formatRelative } from 'date-fns'
  import { toast } from "svelte-sonner"

  export let invites: any

  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
  )

  function handleAcceptInvite(inviteId: string) {
    // TODO: Implement accept invite logic
    console.log('Accepting invite:', inviteId);
  }

  async function handleRejectInvite(orgId: string, idx: number) {
    const invite = invites[idx]
    if (!invite || invite.org_id !== orgId) return;

    invites = invites.splice(idx, 0)
    const { error } = await supabase.from("org_invites").delete().eq('org_id', invite.org_id).eq('invitee', invite.invitee)
    if (error) {
      toast("Could not delete invite", { description: error.message })
      invites.splice(idx, 0, invite)
      invites = invites
    } else {
      toast("Rejected invite to " + invite.organisations.name)
    }
  }
</script>

{#if invites.length === 0}
  <div class="text-center">
    <div
      class="glass dark:glass-dark animate-slide-up mx-auto max-w-2xl rounded-2xl p-8"
    >
      <div
        class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600"
      >
        <Mail class="h-8 w-8 text-white" />
      </div>
      <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        No Invites Yet
      </h2>
      <p class="mb-6 text-gray-600 dark:text-gray-300">
        You don't have any pending organisation invites. Create your own organisation
        to get started with your team.
      </p>
    </div>
  </div>
{:else}
<div class="space-y-6">
  <div class="text-center">
    <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
      Organisation Invites
    </h2>
    <p class="text-gray-600 dark:text-gray-300">
      You've been invited to join these organisations
    </p>
  </div>

  <div class="space-y-4">
    {#each invites as invite, index}
      <div
        class="glass dark:glass-dark animate-slide-up rounded-2xl p-6"
        style="animation-delay: {index * 0.1}s;"
      >
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <!-- Organisation Info -->
          <div class="flex-1 space-y-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    {invite.organisations.name}
                  </h3>
                </div>
                {#if invite.organisations.description}
                  <p class="mb-3 text-gray-600 dark:text-gray-300">
                    {invite.organisations.description}
                  </p>
                {/if}
                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center gap-1">
                    <Calendar class="h-4 w-4" />
                    <span>Invited {formatRelative(invite.created_at, new Date())}</span>
                  </div>
                  {#if invite.organisations.link}
                    <a
                      href={invite.organisations.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      <ExternalLink class="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Invited By -->
            <div class="flex flex-col gap-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-800/50">
            <div class="flex items-center gap-2">
              <img
                src={invite.organisations.users.avatar_url}
                alt={invite.organisations.users.name}
                class="h-10 w-10 rounded-full"
              />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  Invited by {invite.organisations.users.name}
                </p>
              </div>
            </div>
            {#if invite.message}
              <p class="px-4 py-2"><strong>Message:</strong> {invite.message}</p>
            {/if}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 md:flex-col">
            <Button
              on:click={() => handleAcceptInvite(invite.id)}
              class="gradient-primary flex-1 gap-2 text-white transition-transform duration-200 hover:scale-105 md:flex-none"
            >
              <Check class="h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="outline"
              on:click={() => handleRejectInvite(invite.org_id, index)}
              class="glass dark:glass-dark flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 md:flex-none"
            >
              <X class="h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
{/if}
