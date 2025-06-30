<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Alert from '$lib/components/ui/alert';
  import * as Dialog from '$lib/components/ui/dialog';
  import { 
    Building, 
    Trash2, 
    Save, 
    CreditCard, 
    AlertTriangle,
    Loader2
  } from 'lucide-svelte';
  import { PLANS, PLANS_BY_ID } from '$lib/plans';
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { goto } from '$app/navigation';
  import { cn } from '$lib/utils';

  export let data;
  export let form;

  let loading = false;
  let error = form?.error || '';
  let success = form?.success || '';

  // Organization details
  let name = data.org.name;
  let description = data.org.description || '';
  let link = data.org.link || '';

  // Subscription
  let selectedPlan = data.org.plan;
  
  // Delete confirmation
  let deleteDialogOpen = false;
  let deleteConfirmText = '';
  let deleteConfirmStep = 1;
  let deleteLoading = false;

  // Determine if user can downgrade to free plan
  $: canDowngradeToFree = data.canDowngradeToFree;

  function resetDeleteConfirmation() {
    deleteConfirmText = '';
    deleteConfirmStep = 1;
    deleteDialogOpen = false;
  }

  async function handleDeleteOrganization() {
    if (deleteConfirmStep < 3) {
      deleteConfirmStep++;
      deleteConfirmText = '';
      return;
    }

    if (deleteConfirmText !== data.org.name) {
      toast.error('Organization name does not match');
      return;
    }

    deleteLoading = true;
    
    try {
      const response = await fetch(`/api/organizations/${data.org.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete organization');
      }

      toast.success('Organization deleted successfully');
      goto('/app');
    } catch (error) {
      toast.error('Failed to delete organization', {
        description: (error as any).message
      });
      deleteLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Organization Settings - lovelyweb.site</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Organization Settings
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        Manage your organization details and subscription
      </p>
    </div>
  </div>

  {#if error}
    <Alert.Root variant="destructive" class="my-4">
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{error}</Alert.Description>
    </Alert.Root>
  {/if}

  {#if success}
    <Alert.Root class="my-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20">
      <Alert.Title class="text-green-800 dark:text-green-300">Success</Alert.Title>
      <Alert.Description class="text-green-700 dark:text-green-400">{success}</Alert.Description>
    </Alert.Root>
  {/if}

  <!-- Organization Details -->
  <div class="glass dark:glass-dark rounded-2xl p-6 md:p-8">
    <div class="mb-6 flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600">
        <Building class="h-6 w-6 text-white" />
      </div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        Organization Details
      </h2>
    </div>

    <form 
      method="POST" 
      action="?/updateDetails"
      class="space-y-6"
    >
      <div>
        <Label for="name" class="mb-2 block text-sm font-medium">
          Organization Name *
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          minlength={4}
          maxlength={36}
          class="glass dark:glass-dark border-white/30 dark:border-gray-700/50"
          placeholder="Enter organization name"
          value={name}
        />
      </div>

      <div>
        <Label for="link" class="mb-2 block text-sm font-medium">
          Website Link
        </Label>
        <Input
          id="link"
          name="link"
          type="url"
          class="glass dark:glass-dark border-white/30 dark:border-gray-700/50"
          placeholder="https://your-website.com"
          value={link}
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Optional: Your organization's website
        </p>
      </div>

      <div>
        <Label for="description" class="mb-2 block text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          class="glass dark:glass-dark border-white/30 dark:border-gray-700/50"
          placeholder="Describe your organization..."
          rows={4}
          value={description}
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Optional: Brief description of your organization (max 500 characters)
        </p>
      </div>

      <Button
        type="submit"
        class="gradient-primary gap-2 text-white"
        disabled={loading}
      >
        {#if loading}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <Save class="h-4 w-4" />
        {/if}
        Save Changes
      </Button>
    </form>
  </div>

  <!-- Subscription -->
  <div class="glass dark:glass-dark rounded-2xl p-6 md:p-8">
    <div class="mb-6 flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500">
        <CreditCard class="h-6 w-6 text-white" />
      </div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        Subscription
      </h2>
    </div>

    <div class="mb-6">
      <div class="glass dark:glass-dark rounded-xl border-2 border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r {PLANS_BY_ID[data.org.plan].gradient}">
            <svelte:component this={PLANS_BY_ID[data.org.plan].icon} class="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Current Plan: {PLANS_BY_ID[data.org.plan].name}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              ${PLANS_BY_ID[data.org.plan].price.usd}/month
            </p>
          </div>
        </div>
      </div>
    </div>

    <form 
      method="POST" 
      action="?/updateSubscription"
      use:enhance={() => {
        loading = true;
        error = '';
        success = '';
        return async ({ update }) => {
          loading = false;
          update();
        };
      }}
      class="space-y-6"
    >
      <div>
        <Label class="mb-4 block text-sm font-medium">
          Change Plan
        </Label>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {#each PLANS as plan}
            {@const isDisabled = plan.id === 'free' && !canDowngradeToFree && data.org.plan !== 'free'}
            <label class={cn(
              "block cursor-pointer",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}>
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selectedPlan === plan.id}
                disabled={isDisabled}
                class="sr-only"
                on:change={() => selectedPlan = plan.id}
              />
              <div class={cn(
                "glass dark:glass-dark h-full rounded-xl p-4 transition-all duration-200",
                selectedPlan === plan.id ? "ring-2 ring-purple-500" : "",
                isDisabled && "pointer-events-none"
              )}>
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r {plan.gradient}">
                    <svelte:component this={plan.icon} class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      ${plan.price.usd}/month
                    </p>
                  </div>
                </div>
              </div>
            </label>
          {/each}
        </div>
        
        {#if !canDowngradeToFree && data.org.plan !== 'free'}
          <p class="mt-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle class="mr-1 inline-block h-4 w-4" />
            You cannot downgrade to the Free plan because you already have another organization on the Free plan.
          </p>
        {/if}
      </div>

      <Button
        type="submit"
        class="gradient-primary gap-2 text-white"
        disabled={loading || selectedPlan === data.org.plan}
      >
        {#if loading}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <Save class="h-4 w-4" />
        {/if}
        Update Subscription
      </Button>
    </form>
  </div>

  <!-- Danger Zone -->
  <div class="glass dark:glass-dark rounded-2xl p-6 md:p-8">
    <div class="mb-6 flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-pink-500">
        <AlertTriangle class="h-6 w-6 text-white" />
      </div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        Danger Zone
      </h2>
    </div>

    <div class="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <h3 class="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
        Delete Organization
      </h3>
      <p class="mb-4 text-red-600 dark:text-red-300">
        This action cannot be undone. All data associated with this organization will be permanently deleted.
      </p>
      <Button
        variant="destructive"
        class="gap-2"
        on:click={() => deleteDialogOpen = true}
      >
        <Trash2 class="h-4 w-4" />
        Delete Organization
      </Button>
    </div>
  </div>
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteDialogOpen} onOpenChange={resetDeleteConfirmation}>
  <Dialog.Content class="glass dark:glass-dark border-white/20 dark:border-gray-700/50">
    <Dialog.Header>
      <Dialog.Title class="text-red-600 dark:text-red-400 flex items-center gap-2">
        <AlertTriangle class="h-5 w-5" />
        Delete Organization
      </Dialog.Title>
      <Dialog.Description>
        {#if deleteConfirmStep === 1}
          This action cannot be undone. This will permanently delete the organization and all associated data.
        {:else if deleteConfirmStep === 2}
          Are you absolutely sure? All data will be lost, including:
          <ul class="mt-2 list-disc pl-5 text-sm">
            <li>All chat messages and groups</li>
            <li>All notes and notebooks</li>
            <li>All kanban boards and cards</li>
            <li>All voice messages</li>
            <li>All organization settings and members</li>
          </ul>
        {:else}
          Final confirmation: Type <strong class="font-mono">{data.org.name}</strong> to confirm deletion.
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    {#if deleteConfirmStep === 3}
      <div class="py-4">
        <Label for="confirm-text" class="mb-2 block text-sm font-medium">
          Type organization name to confirm
        </Label>
        <Input
          id="confirm-text"
          bind:value={deleteConfirmText}
          placeholder={data.org.name}
          class="glass dark:glass-dark border-white/30 dark:border-gray-700/50"
        />
      </div>
    {/if}

    <Dialog.Footer>
      <Button
        variant="outline"
        on:click={resetDeleteConfirmation}
        disabled={deleteLoading}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        on:click={handleDeleteOrganization}
        disabled={deleteLoading || (deleteConfirmStep === 3 && deleteConfirmText !== data.org.name)}
      >
        {#if deleteLoading}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        {:else}
          {#if deleteConfirmStep === 1}
            I understand, continue
          {:else if deleteConfirmStep === 2}
            Yes, I'm sure
          {:else}
            Permanently delete organization
          {/if}
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
