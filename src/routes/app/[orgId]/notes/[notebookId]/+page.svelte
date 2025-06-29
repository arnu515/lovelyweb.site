<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Plus, Trash2, FileText, FileEdit as Edit3, Save, ArrowLeft, Eye, EyeOff } from 'lucide-svelte';
  import { createBrowserClient } from '@supabase/ssr';
  import { 
    PUBLIC_SUPABASE_ANON_KEY, 
    PUBLIC_SUPABASE_URL 
  } from '$env/static/public';
  import { toast } from 'svelte-sonner';
  import { invalidate } from '$app/navigation';
  import { cn } from '$lib/utils';
  import type { Database } from '$lib/database.types';
  import { nanoid } from 'nanoid';
  import { page } from '$app/stores';

  export let data;

  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  $: notebookId = $page.params.notebookId
  
  let createPageDialogOpen = false;
  let createPageLoading = false;
  let deletePageLoading = false;
  let saveLoading = false;

  // Page creation
  let newPageTitle = '';

  // Editor state
  let selectedPageId: string | null = null;
  let editorContent = '';
  let isPreviewMode = false;
  let hasUnsavedChanges = false;

  $: if (selectedPageId) {
    loadPageContent(selectedPageId);
  }

  async function loadPageContent(pageId: string) {
    try {
      const { data: page, error } = await supabase
        .from('notebook_pages')
        .select('content')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      
      editorContent = page.content || '';
      hasUnsavedChanges = false;
    } catch (error: any) {
      toast.error('Failed to load page content', {
        description: error.message
      });
    }
  }

  async function createPage() {
    if (!newPageTitle.trim()) {
      toast.error('Please enter a page title');
      return;
    }

    createPageLoading = true;
    try {
      const notebook = await data.notebook;
      const pages = await data.pages;
      
      const { data: newPage, error } = await supabase
        .from('notebook_pages')
        .insert({
          id: nanoid(24),
          notebook_id: notebook.id,
          title: newPageTitle.trim(),
          content: '',
          position: pages.length,
          created_by: data.auth.user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Page created successfully');
      createPageDialogOpen = false;
      newPageTitle = '';
      selectedPageId = newPage.id;
      
      await invalidate('app:notebook-' + notebookId);
    } catch (error: any) {
      toast.error('Failed to create page', {
        description: error.message
      });
    } finally {
      createPageLoading = false;
    }
  }

  async function deletePage(pageId: string, pageTitle: string) {
    if (!confirm(`Are you sure you want to delete "${pageTitle}"?`)) {
      return;
    }

    deletePageLoading = true;
    try {
      const { error } = await supabase
        .from('notebook_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast.success('Page deleted successfully');
      
      if (selectedPageId === pageId) {
        selectedPageId = null;
        editorContent = '';
      }
      
      await invalidate('app:notebook-' + notebookId);
    } catch (error: any) {
      toast.error('Failed to delete page', {
        description: error.message
      });
    } finally {
      deletePageLoading = false;
    }
  }

  async function savePage() {
    if (!selectedPageId) return;

    saveLoading = true;
    try {
      const { error } = await supabase
        .from('notebook_pages')
        .update({ 
          content: editorContent,
        })
        .eq('id', selectedPageId);

      if (error) throw error;

      toast.success('Page saved successfully');
      hasUnsavedChanges = false;
    } catch (error: any) {
      toast.error('Failed to save page', {
        description: error.message
      });
    } finally {
      saveLoading = false;
    }
  }

  function handleContentChange() {
    hasUnsavedChanges = true;
  }

  function getRenderedContent(content: string): string {
    try {
      // TEMP
      return content;
    } catch (error) {
      return '<p>Error rendering content</p>';
    }
  }

  // Auto-save functionality
  let autoSaveTimeout: ReturnType<typeof setTimeout>;
  $: if (hasUnsavedChanges && selectedPageId) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      savePage();
    }, 10000); // Auto-save after 10 seconds of inactivity
  }
</script>

<svelte:head>
  {#await data.notebook then notebook}
    <title>{notebook.name} - Notes - lovelyweb.site</title>
  {/await}
</svelte:head>

<div class="flex h-screen bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-200/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
  <!-- Sidebar -->
  <div class="glass dark:glass-dark flex w-80 flex-col border-r border-white/20 dark:border-gray-700/50">
    <!-- Header -->
    {#await data.notebook}
      <div class="border-b border-white/20 p-4 dark:border-gray-700/50">
        <Skeleton class="mb-2 h-6 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
      </div>
    {:then notebook}
      <div class="border-b border-white/20 p-4 dark:border-gray-700/50">
        <div class="mb-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            href="/app/{data.org.id}/notes"
            class="h-8 w-8"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div
            class="h-3 w-3 rounded-full"
            style="background-color: {notebook.color}"
          ></div>
          <h1 class="truncate text-lg font-semibold text-gray-900 dark:text-white">
            {notebook.name}
          </h1>
        </div>
        
        <Button
          on:click={() => (createPageDialogOpen = true)}
          class="gradient-primary w-full gap-2 text-white"
          size="sm"
        >
          <Plus class="h-4 w-4" />
          New Page
        </Button>
      </div>
    {/await}

    <!-- Pages List -->
    <div class="flex-1 overflow-y-auto p-2">
      {#await data.pages}
        <div class="space-y-2">
          {#each Array(5) as _}
            <Skeleton class="h-10 w-full" />
          {/each}
        </div>
      {:then pages}
        {#if pages.length === 0}
          <div class="flex h-32 items-center justify-center text-center">
            <div>
              <FileText class="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                No pages yet. Create your first page to get started.
              </p>
            </div>
          </div>
        {:else}
          <div class="space-y-1">
            {#each pages as page (page.id)}
              <div class="group relative">
                <Button
                  variant="ghost"
                  class={cn(
                    "w-full justify-start text-left",
                    selectedPageId === page.id && "bg-purple-100/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                  )}
                  on:click={() => (selectedPageId = page.id)}
                >
                  <FileText class="mr-2 h-4 w-4 flex-shrink-0" />
                  <span class="truncate">{page.title}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  class="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  on:click={(e) => {e.stopPropagation(); deletePage(page.id, page.title)}}
                  disabled={deletePageLoading}
                >
                  <Trash2 class="h-3 w-3" />
                </Button>
              </div>
            {/each}
          </div>
        {/if}
      {/await}
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex flex-1 flex-col">
    {#if selectedPageId}
      <!-- Editor Header -->
      <div class="glass dark:glass-dark border-b border-white/20 p-4 dark:border-gray-700/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Edit3 class="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </span>
          </div>
          
          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              on:click={() => (isPreviewMode = !isPreviewMode)}
              class="gap-2"
            >
              {#if isPreviewMode}
                <EyeOff class="h-4 w-4" />
                Edit
              {:else}
                <Eye class="h-4 w-4" />
                Preview
              {/if}
            </Button>
            
            <Button
              on:click={savePage}
              disabled={!hasUnsavedChanges || saveLoading}
              class="gradient-primary gap-2 text-white"
              size="sm"
            >
              <Save class="h-4 w-4" />
              {saveLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <!-- Editor Content -->
      <div class="flex-1 overflow-hidden">
        {#if isPreviewMode}
          <!-- Preview Mode -->
          <div class="h-full overflow-y-auto p-6">
            <div class="prose prose-lg dark:prose-invert mx-auto max-w-none">
              {@html getRenderedContent(editorContent)}
            </div>
          </div>
        {:else}
          <!-- Edit Mode -->
          <textarea
            bind:value={editorContent}
            on:input={handleContentChange}
            placeholder="Start writing your notes... You can use Markdown formatting."
            class="h-full w-full resize-none border-0 bg-transparent p-6 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-gray-400"
            style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6;"
          />
        {/if}
      </div>
    {:else}
      <!-- No Page Selected -->
      <div class="flex flex-1 items-center justify-center">
        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600"
          >
            <FileText class="h-8 w-8 text-white" />
          </div>
          <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Select a page to start editing
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            Choose a page from the sidebar or create a new one
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Create Page Dialog -->
<Dialog.Root bind:open={createPageDialogOpen}>
  <Dialog.Content class="glass dark:glass-dark border-white/20 dark:border-gray-700/50">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <FileText class="h-5 w-5" />
        Create New Page
      </Dialog.Title>
      <Dialog.Description>
        Add a new page to your notebook.
      </Dialog.Description>
    </Dialog.Header>

    <form on:submit|preventDefault={createPage} class="space-y-4">
      <div>
        <Label for="page-title">Page Title *</Label>
        <Input
          id="page-title"
          bind:value={newPageTitle}
          placeholder="Enter page title"
          maxlength={200}
          required
          class="glass dark:glass-dark border-white/30 dark:border-gray-700/50"
        />
      </div>

      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          on:click={() => (createPageDialogOpen = false)}
          disabled={createPageLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          class="gradient-primary text-white"
          disabled={createPageLoading}
        >
          {#if createPageLoading}
            Creating...
          {:else}
            Create Page
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
