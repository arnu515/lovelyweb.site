<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Plus, Trash2, FileText, Save, ArrowLeft, Loader2, Menu, X } from 'lucide-svelte';
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
  import { onDestroy, onMount } from 'svelte';
  import { Crepe } from '@milkdown/crepe';
  import '@milkdown/crepe/theme/common/style.css';
  import './theme.css';

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
  let sidebarOpen = false;
  let isMobile = false;

  // Page creation
  let newPageTitle = '';

  // Editor state
  let selectedPageId: string | null = null;
  let crepeEditor: Crepe | null = null;
  let hasUnsavedChanges = false;
  let currentContent = '';

  $: if (selectedPageId) {
    initEditor(selectedPageId);
  }

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
      if (!isMobile) {
        sidebarOpen = true;
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  async function initEditor(pageId: string) {
    if (crepeEditor) {
      crepeEditor.destroy();
      crepeEditor = null;
    };

    try {
      const { data: page, error } = await supabase
        .from('notebook_pages')
        .select('content')
        .eq('id', pageId)
        .single();
      if (error) throw error;

      currentContent = page.content || '';
      hasUnsavedChanges = false;

      crepeEditor = new Crepe({
        root: "#editor",
        defaultValue: currentContent,
        features: {
          [Crepe.Feature.CodeMirror]: true,
          [Crepe.Feature.ListItem]: true,
          [Crepe.Feature.LinkTooltip]: true,
          [Crepe.Feature.ImageBlock]: true,
          [Crepe.Feature.BlockEdit]: true,
          [Crepe.Feature.Table]: true,
          [Crepe.Feature.Toolbar]: true,
          [Crepe.Feature.Cursor]: true,
          [Crepe.Feature.Placeholder]: true,
          [Crepe.Feature.Latex]: false, // Disable for now to keep it lightweight
        },
        featureConfigs: {
          [Crepe.Feature.Placeholder]: {
            text: "Start writing your notes..."
          },
          [Crepe.Feature.LinkTooltip]: {
            inputPlaceholder: "Enter URL..."
          }
        }
      });

      await crepeEditor.create();

      // Set up event listeners
      crepeEditor.on((listener) => {
        listener.markdownUpdated((_, markdown) => {
          currentContent = markdown;
          hasUnsavedChanges = true;
        });

        listener.focus(() => {
          console.log('Editor focused');
        });

        listener.blur(() => {
          console.log('Editor blurred');
        });
      });

    } catch (error) {
      console.error('Failed to initialize Crepe editor:', error);
      toast.error('Failed to initialize editor');
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
      
      // Close sidebar on mobile after creating page
      if (isMobile) {
        sidebarOpen = false;
      }
      
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
        currentContent = '';
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
    if (!selectedPageId || !crepeEditor) return;

    saveLoading = true;
    try {
      const markdown = crepeEditor.getMarkdown();
      
      const { error } = await supabase
        .from('notebook_pages')
        .update({ 
          content: markdown,
        })
        .eq('id', selectedPageId);

      if (error) throw error;

      // Remove the toast notification - it was annoying
      hasUnsavedChanges = false;
      currentContent = markdown;
    } catch (error: any) {
      toast.error('Failed to save page', {
        description: error.message
      });
    } finally {
      saveLoading = false;
    }
  }

  function handlePageSelect(pageId: string) {
    selectedPageId = pageId;
    // Close sidebar on mobile when selecting a page
    if (isMobile) {
      sidebarOpen = false;
    }
  }

  // Auto-save functionality
  let autoSaveTimeout: ReturnType<typeof setTimeout>;
  $: if (hasUnsavedChanges && selectedPageId && crepeEditor) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      savePage();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }

  onDestroy(() => {
    if (crepeEditor) {
      crepeEditor.destroy();
      crepeEditor = null;
    }
    clearTimeout(autoSaveTimeout);
  });
</script>

<svelte:head>
  {#await data.notebook then notebook}
    <title>{notebook.name} - Notes - lovelyweb.site</title>
  {/await}
</svelte:head>

<!-- Mobile overlay -->
{#if isMobile && sidebarOpen}
  <div
    class="fixed inset-0 z-40 bg-black/50 md:hidden"
    on:click={() => (sidebarOpen = false)}
    on:keydown={e => e.key === 'Escape' && (sidebarOpen = false)}
    role="button"
    tabindex="0"
  ></div>
{/if}

<div class="flex h-screen bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-200/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
  <!-- Sidebar -->
  <div class={cn(
    "glass dark:glass-dark flex flex-col border-r border-white/20 dark:border-gray-700/50 transition-transform duration-300 md:relative md:translate-x-0",
    isMobile ? "fixed left-0 top-0 z-50 h-full w-80" : "w-80",
    isMobile && sidebarOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : ""
  )}>
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
          {#if isMobile}
            <Button
              variant="ghost"
              size="icon"
              class="ml-auto h-8 w-8 md:hidden"
              on:click={() => (sidebarOpen = false)}
            >
              <X class="h-4 w-4" />
            </Button>
          {/if}
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
                  on:click={() => handlePageSelect(page.id)}
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
    <!-- Mobile Header -->
    {#if isMobile}
      <div class="glass dark:glass-dark border-b border-white/20 p-4 dark:border-gray-700/50 md:hidden">
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            on:click={() => (sidebarOpen = true)}
          >
            <Menu class="h-4 w-4" />
          </Button>
          {#await data.notebook then notebook}
            <div
              class="h-3 w-3 rounded-full"
              style="background-color: {notebook.color}"
            ></div>
            <h1 class="truncate text-lg font-semibold text-gray-900 dark:text-white">
              {notebook.name}
            </h1>
          {/await}
        </div>
      </div>
    {/if}

    {#if selectedPageId}
      <!-- Editor Header -->
      <div class="glass dark:glass-dark border-b border-white/20 p-4 dark:border-gray-700/50 shadow-none">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full {hasUnsavedChanges ? 'bg-orange-500' : 'bg-green-500'}"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </span>
          </div>
          
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

      <!-- Crepe Editor Container -->
      <div class="flex-1 relative overflow-hidden">
        <div 
          id="editor"
          class="h-full w-full crepe-editor-container"
        />
        {#if !crepeEditor}
          <div class="absolute grid place-items-center p-4" style="left: 50%; top: 50%; transform: translate(-50% -50%);">
            <Loader2 class="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        {/if}
      </div>
    {:else}
      <!-- No Page Selected -->
      <div class="flex flex-1 items-center justify-center p-4">
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
            {#if isMobile}
              Tap the menu button to see your pages
            {:else}
              Choose a page from the sidebar or create a new one
            {/if}
          </p>
          {#if isMobile}
            <Button
              on:click={() => (sidebarOpen = true)}
              class="gradient-primary mt-4 gap-2 text-white"
            >
              <Menu class="h-4 w-4" />
              Open Pages
            </Button>
          {/if}
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

<style>
  :global(.crepe-editor-container) {
    /* Custom styles for Crepe editor to match our theme */
    --crepe-primary-color: #8b5cf6;
    --crepe-secondary-color: #3b82f6;
    --crepe-background-color: transparent;
    --crepe-text-color: inherit;
    --crepe-border-color: rgba(255, 255, 255, 0.2);
  }

  :global(.dark .crepe-editor-container) {
    --crepe-border-color: rgba(107, 114, 128, 0.5);
  }

  /* Override Crepe's default styles to match our glass design */
  :global(.crepe-editor-container .milkdown) {
    background: transparent !important;
    border: none !important;
    padding: 1.5rem !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    line-height: 1.6 !important;
  }

  :global(.crepe-editor-container .editor) {
    background: transparent !important;
    min-height: 100% !important;
  }

  /* Style the toolbar to match our design */
  :global(.crepe-editor-container .toolbar) {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(16px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 0.75rem !important;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37) !important;
  }

  :global(.dark .crepe-editor-container .toolbar) {
    background: rgba(17, 24, 39, 0.7) !important;
    border: 1px solid rgba(107, 114, 128, 0.5) !important;
  }

  /* Style toolbar buttons */
  :global(.crepe-editor-container .toolbar button) {
    border-radius: 0.5rem !important;
    transition: all 0.2s ease !important;
  }

  :global(.crepe-editor-container .toolbar button:hover) {
    background: rgba(139, 92, 246, 0.1) !important;
    transform: scale(1.05) !important;
  }

  /* Style the editor content */
  :global(.crepe-editor-container .ProseMirror) {
    outline: none !important;
    color: inherit !important;
  }

  :global(.crepe-editor-container .ProseMirror h1) {
    color: #8b5cf6 !important;
    font-weight: 700 !important;
    margin-bottom: 1rem !important;
  }

  :global(.crepe-editor-container .ProseMirror h2) {
    color: #3b82f6 !important;
    font-weight: 600 !important;
    margin-bottom: 0.75rem !important;
  }

  :global(.crepe-editor-container .ProseMirror p) {
    margin-bottom: 1rem !important;
  }

  :global(.crepe-editor-container .ProseMirror blockquote) {
    border-left: 4px solid #8b5cf6 !important;
    padding-left: 1rem !important;
    margin: 1rem 0 !important;
    font-style: italic !important;
    background: rgba(139, 92, 246, 0.05) !important;
    border-radius: 0 0.5rem 0.5rem 0 !important;
  }

  :global(.crepe-editor-container .ProseMirror code) {
    background: rgba(139, 92, 246, 0.1) !important;
    padding: 0.125rem 0.25rem !important;
    border-radius: 0.25rem !important;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  }

  :global(.crepe-editor-container .ProseMirror pre) {
    background: rgba(17, 24, 39, 0.9) !important;
    color: #f3f4f6 !important;
    padding: 1rem !important;
    border-radius: 0.75rem !important;
    overflow-x: auto !important;
    margin: 1rem 0 !important;
  }

  /* Style lists */
  :global(.crepe-editor-container .ProseMirror ul, .crepe-editor-container .ProseMirror ol) {
    padding-left: 1.5rem !important;
    margin-bottom: 1rem !important;
  }

  :global(.crepe-editor-container .ProseMirror li) {
    margin-bottom: 0.5rem !important;
  }

  /* Style tables */
  :global(.crepe-editor-container .ProseMirror table) {
    border-collapse: collapse !important;
    width: 100% !important;
    margin: 1rem 0 !important;
    border-radius: 0.5rem !important;
    overflow: hidden !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
  }

  :global(.crepe-editor-container .ProseMirror th, .crepe-editor-container .ProseMirror td) {
    border: 1px solid rgba(139, 92, 246, 0.2) !important;
    padding: 0.75rem !important;
    text-align: left !important;
  }

  :global(.crepe-editor-container .ProseMirror th) {
    background: rgba(139, 92, 246, 0.1) !important;
    font-weight: 600 !important;
  }
</style>