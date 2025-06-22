<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import {
    Building,
    Users,
    Check,
    X,
    Plus,
    Mail,
    Calendar,
    ExternalLink
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  export let data;

  // Mock data for organization invites
  const invites = [
    {
      id: '1',
      organisation: {
        id: 'acme-corp',
        name: 'Acme Corporation',
        description: 'Leading provider of innovative solutions for modern businesses',
        link: 'https://acme.com',
        plan: 'pro',
        memberCount: 24
      },
      invitedBy: {
        name: 'Sarah Wilson',
        email: 'sarah@acme.com',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
      },
      invitedAt: '2 days ago',
      role: 'Member'
    },
    {
      id: '2',
      organisation: {
        id: 'startup-inc',
        name: 'Startup Inc',
        description: 'Fast-growing tech startup building the future of communication',
        link: 'https://startup.inc',
        plan: 'basic',
        memberCount: 8
      },
      invitedBy: {
        name: 'Mike Chen',
        email: 'mike@startup.inc',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
      },
      invitedAt: '1 week ago',
      role: 'Admin'
    },
    {
      id: '3',
      organisation: {
        id: 'design-studio',
        name: 'Creative Design Studio',
        description: 'Award-winning design agency specializing in digital experiences',
        link: null,
        plan: 'free',
        memberCount: 5
      },
      invitedBy: {
        name: 'Emma Davis',
        email: 'emma@design.studio',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
      },
      invitedAt: '3 weeks ago',
      role: 'Member'
    }
  ];

  function getPlanColor(plan: string) {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      case 'basic':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pro':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  function getPlanName(plan: string) {
    switch (plan) {
      case 'free':
        return 'Free';
      case 'basic':
        return 'Basic';
      case 'pro':
        return 'Professional';
      default:
        return 'Unknown';
    }
  }

  function handleAcceptInvite(inviteId: string) {
    // TODO: Implement accept invite logic
    console.log('Accepting invite:', inviteId);
  }

  function handleRejectInvite(inviteId: string) {
    // TODO: Implement reject invite logic
    console.log('Rejecting invite:', inviteId);
  }
</script>

<svelte:head>
  <title>Welcome - lovelyweb.site</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="gradient-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        >
          <Building class="h-8 w-8 text-white" />
        </div>
        <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          Welcome to lovelyweb.site
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Get started by joining an organisation or creating your own
        </p>
      </div>

      <div class="space-y-8">
        <!-- Organization Invites -->
        {#if invites.length > 0}
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
                  class="glass dark:glass-dark animate-slide-up rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                  style="animation-delay: {index * 0.1}s;"
                >
                  <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <!-- Organisation Info -->
                    <div class="flex-1 space-y-4">
                      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div class="flex-1">
                          <div class="mb-2 flex flex-wrap items-center gap-2">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                              {invite.organisation.name}
                            </h3>
                            <Badge class={cn('text-xs', getPlanColor(invite.organisation.plan))}>
                              {getPlanName(invite.organisation.plan)}
                            </Badge>
                          </div>
                          {#if invite.organisation.description}
                            <p class="mb-3 text-gray-600 dark:text-gray-300">
                              {invite.organisation.description}
                            </p>
                          {/if}
                          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div class="flex items-center gap-1">
                              <Users class="h-4 w-4" />
                              <span>{invite.organisation.memberCount} members</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <Calendar class="h-4 w-4" />
                              <span>Invited {invite.invitedAt}</span>
                            </div>
                            {#if invite.organisation.link}
                              <a
                                href={invite.organisation.link}
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
                      <div class="flex items-center gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
                        <img
                          src={invite.invitedBy.avatar}
                          alt={invite.invitedBy.name}
                          class="h-10 w-10 rounded-full"
                        />
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900 dark:text-white">
                            Invited by {invite.invitedBy.name}
                          </p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            {invite.invitedBy.email} • Role: {invite.role}
                          </p>
                        </div>
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
                        on:click={() => handleRejectInvite(invite.id)}
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

        <!-- Create Organisation Card -->
        <div class="text-center">
          <div
            class="glass dark:glass-dark animate-slide-up mx-auto max-w-2xl rounded-2xl p-8"
            style="animation-delay: {invites.length * 0.1 + 0.2}s;"
          >
            <div
              class="gradient-secondary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            >
              <Plus class="h-8 w-8 text-white" />
            </div>
            <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Create Your Organisation
            </h2>
            <p class="mb-6 text-gray-600 dark:text-gray-300">
              Start your own organisation and invite your team to collaborate with AI-powered
              communication tools.
            </p>
            <div class="space-y-4">
              <Button
                href="/app/new"
                class="gradient-primary gap-2 px-8 py-3 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105"
              >
                <Building class="h-5 w-5" />
                Create Organisation
              </Button>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Free plan available • No credit card required
              </p>
            </div>
          </div>
        </div>

        {#if invites.length === 0}
          <!-- No Invites State -->
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
        {/if}
      </div>

      <!-- Help Text -->
      <div class="mt-12 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Need help getting started? <a
            href="mailto:support@lovelyweb.site"
            class="text-purple-600 hover:underline dark:text-purple-400"
          >
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  </div>
</div>