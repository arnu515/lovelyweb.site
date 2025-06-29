<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { 
    BookOpen, 
    Plus, 
    Trash2, 
    FileText,
    Calendar,
    User
  } from 'lucide-svelte';
  import { createBrowserClient } from '@supabase/ssr';
  import { 
    PUBLIC_SUPABASE_ANON_KEY, 
    PUBLIC_SUPABASE_URL 
  } from '$env/static/public';
  import { toast } from 'svelte-sonner';
  import { invalidate } from '$app/navigation';
  import { formatRelative } from 'date-fns';
  import { cn } from '$lib/utils';
  import type { Database } from '$lib/database.types';

  export let data;

  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  let createDialogOpen = false;
  let createLoading = false;
  let deleteLoading = false;

  // Form state
  let notebookName = '';
  let notebookDescription = '';
  let notebookColor = '#8b5cf6';

  const colorOptions = [
    '#8b5cf6', // Purple
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5a2b', // Brown
    '#6b7280', // Gray
    '#ec4899'  // Pink
  ];

  async function createNotebook() {
    if (!notebookName.trim()) {
      toast.error('Please enter a notebook name');
      return;
    }

    createLoading = true;
    try {
      const { error } = await supabase.from('notebooks').insert({
        name: notebookName.trim(),
        description: notebookDescription.trim() || null,
        color: notebookColor,
        org_id: data.org.id,
        owner_id: data.auth.user.id
      });

      if (error) throw error;

      toast.success('Notebook created successfully');
      createDialogOpen = false;
      notebookName = '';
      notebookDescription = '';
      notebookColor = '#8b5cf6';
      
      await invalidate('app:notes');
    } catch (error: any) {
      toast.error('Failed to create notebook', {
        description: error.message
      });
    } finally {
      createLoading = false;
    }
  }

  async function deleteNotebook(notebookId: string, notebookName: string) {
    if (!confirm(`Are you sure you want to delete "${notebookName}"? This will also delete all pages in this notebook.`)) {
      return;
    }

    deleteLoading = true;
    try {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', notebookId);

      if (error) throw error;

      toast.success('Notebook deleted successfully');
      await invalidate('app:notes');
    } catch (error: any) {
      toast.error('Failed to delete notebook', {
        description: error.message
      });
    } finally {
      deleteLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Notes - lovelyweb.site</title>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Notes
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        Organize your thoughts and ideas in beautiful notebooks
      </p>
    </div>
    
    <Button
      on:click={() => (createDialogOpen = true)}
      class="gradient-primary gap-2 text-white"
    >
      <Plus class="h-4 w-4" />
      New Notebook
    </Button>
  </div>

  <!-- Notebooks Grid -->
  {#await data.notebooks}
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each Array(6) as _}
        <div class="glass dark:glass-dark rounded-2xl p-6">
          <Skeleton class="mb-4 h-6 w-3/4" />
          <Skeleton class="mb-2 h-4 w-full" />
          <Skeleton class="mb-4 h-4 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      {/each}
    </div>
  {:then notebooks}
    {#if notebooks.length === 0}
      <div class="flex h-64 items-center justify-center">
        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600"
          >
            <BookOpen class="h-8 w-8 text-white" />
          </div>
          <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            No notebooks yet
          </h3>
          <p class="mb-4 text-gray-600 dark:text-gray-300">
            Create your first notebook to start taking notes
          </p>
          <Button
            on:click={() => (createDialogOpen = true)}
            class="gradient-primary gap-2 text-white"
          >
            <Plus class="h-4 w-4" />
            Create Notebook
          </Button>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each notebooks as notebook (notebook.id)}
          <div class="group relative">
            <a
              href="/app/{data.org.id}/notes/{notebook.id}"
              class="glass dark:glass-dark block rounded-2xl p-6 transition-all duration-300 hover:scale-105"
            >
              <!-- Color indicator -->
              <div
                class="mb-4 h-2 w-full rounded-full"
                style="background-color: {notebook.color}"
              ></div>
              
              <!-- Notebook info -->
              <div class="mb-4">
                <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {notebook.name}
                </h3>
                {#if notebook.description}
                  <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {notebook.description}
                  </p>
                {/if}
              </div>

              <!-- Metadata -->
              <div class="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex items-center gap-1">
                  <Calendar class="h-3 w-3" />
                  <span>Created {formatRelative(new Date(notebook.created_at), new Date())}</span>
                </div>
                <div class="flex items-center gap-1">
                  <User class="h-3 w-3" />
                  <span>by {notebook.owner_id === data.auth.user.id ? 'You' : 'Someone'}</span>
                </div>
              </div>
            </a>

            <!-- Delete button -->
            {#if notebook.owner_id === data.auth.user.id}
              <Button
                variant="ghost"
                size="icon"
                class="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                on:click|preventDefault={() => deleteNotebook(notebook.id, notebook.name)}
                disabled={deleteLoading}
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {:catch error}
    <div class="flex h-64 items-center justify-center">
      <div class="text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-600"
        >
          <FileText class="h-8 w-8 text-white" />
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Failed to load notebooks
        </h3>
        <p class="text-gray-600 dark:text-gray-300">
          {error.message}
        </p>
      </div>
    </div>
  {/await}
</div>

<!-- Create Notebook Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
  <Dialog.Content class="glass dark:glass-dark border-white/20 dark:border-gray-700/50">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <BookOpen class="h-5 w-5" />
        Create New Notebook
      </Dialog.Title>
      <Dialog.Description>
        Create a new notebook to organize your notes and ideas.
      </Dialog.Description>
    </Dialog.Header>

    <form on:submit|preventDefault={createNotebook} class="space-y-4">
      <div>
        <Label for="notebook-name">Notebook Name *</Label>
        <Input
          id="notebook-name"
          bind:value={notebookName}
          placeholder="Enter notebook name"
          maxlength={100}
          required
          class="glass dark:glass-dark border-white/30 dark:border-gray-700/50"
        />
      </div>

      <div>
        <Label for="notebook-description">Description</Label>
        <Textarea
          id="notebook-description"
          bind:value={notebookDescription}
          placeholder="Optional description"
          maxlength={500}
          rows={3}
          class="glass dark:glass-dark border-white/30 dark:border-gray-700/50"
        />
      </div>

      <div>
        <Label>Color</Label>
        <div class="mt-2 flex flex-wrap gap-2">
          {#each colorOptions as color}
            <button
              type="button"
              class={cn(
                "h-8 w-8 rounded-full border-2 transition-all duration-200",
                notebookColor === color 
                  ? "border-gray-900 dark:border-white scale-110" 
                  : "border-gray-300 dark:border-gray-600 hover:scale-105"
              )}
              style="background-color: {color}"
              on:click={() => (notebookColor = color)}
            />
          {/each}
        </div>
      </div>

      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          on:click={() => (createDialogOpen = false)}
          disabled={createLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          class="gradient-primary text-white"
          disabled={createLoading}
        >
          {#if createLoading}
            Creating...
          {:else}
            Create Notebook
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>