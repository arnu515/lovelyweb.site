<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import {
    Search,
    Star,
    Mail,
    MailOpen,
    Archive,
    Trash2,
    AlertTriangle,
    ChevronDown
  } from 'lucide-svelte';

  export let searchQuery: string;
  export let allSelected: boolean;
  export let someSelected: boolean;

  const dispatch = createEventDispatcher<{
    search: { query: string };
    toggleAllSelection: void;
    markSelectedAsRead: void;
    markSelectedAsUnread: void;
    markSelectedAsImportant: void;
    deleteSelected: void;
    archiveSelected: void;
    spamSelected: void;
  }>();
</script>

<div class="glass dark:glass-dark border-b border-white/20 p-3 md:p-4 dark:border-gray-700/50">
  <!-- Search Bar -->
  <div class="mb-4">
    <div class="relative max-w-full md:max-w-2xl">
      <Search class="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-gray-400" />
      <Input
        id="search-input"
        bind:value={searchQuery}
        placeholder="Search emails..."
        class="glass dark:glass-dark w-full border-white/30 py-2 md:py-3 pl-10 md:pl-12 pr-4 text-sm md:text-base shadow-lg transition-all duration-200 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/50 dark:border-gray-700/50"
        on:input={(e) => dispatch('search', { query: e.target.value })}
      />
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <Checkbox
        checked={allSelected}
        indeterminate={someSelected && !allSelected}
        on:click={() => dispatch('toggleAllSelection')}
        class="h-4 w-4 md:h-5 md:w-5"
        aria-label="Select all emails"
      />
      
      {#if someSelected}
        <div class="flex items-center space-x-1 md:space-x-2">
          <Button
            variant="ghost"
            size="sm"
            on:click={() => dispatch('markSelectedAsRead')}
            class="h-7 w-7 md:h-8 md:w-8 p-0 md:px-3 md:w-auto hover:bg-white/20 dark:hover:bg-gray-700/60"
            title="Mark as read"
            aria-label="Mark selected emails as read"
          >
            <MailOpen class="h-3 w-3 md:h-4 md:w-4" />
            <span class="hidden md:ml-2 md:inline">Read</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            on:click={() => dispatch('markSelectedAsUnread')}
            class="h-7 w-7 md:h-8 md:w-8 p-0 md:px-3 md:w-auto hover:bg-white/20 dark:hover:bg-gray-700/60"
            title="Mark as unread"
            aria-label="Mark selected emails as unread"
          >
            <Mail class="h-3 w-3 md:h-4 md:w-4" />
            <span class="hidden md:ml-2 md:inline">Unread</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            on:click={() => dispatch('markSelectedAsImportant')}
            class="h-7 w-7 md:h-8 md:w-8 p-0 md:px-3 md:w-auto hover:bg-white/20 dark:hover:bg-gray-700/60"
            title="Mark as important"
            aria-label="Mark selected emails as important"
          >
            <Star class="h-3 w-3 md:h-4 md:w-4" />
            <span class="hidden md:ml-2 md:inline">Star</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            on:click={() => dispatch('archiveSelected')}
            class="h-7 w-7 md:h-8 md:w-8 p-0 md:px-3 md:w-auto hover:bg-white/20 dark:hover:bg-gray-700/60"
            title="Archive"
            aria-label="Archive selected emails"
          >
            <Archive class="h-3 w-3 md:h-4 md:w-4" />
            <span class="hidden md:ml-2 md:inline">Archive</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            on:click={() => dispatch('deleteSelected')}
            class="h-7 w-7 md:h-8 md:w-8 p-0 md:px-3 md:w-auto text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
            title="Delete"
            aria-label="Delete selected emails"
          >
            <Trash2 class="h-3 w-3 md:h-4 md:w-4" />
            <span class="hidden md:ml-2 md:inline">Delete</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            on:click={() => dispatch('spamSelected')}
            class="h-7 w-7 md:h-8 md:w-8 p-0 md:px-3 md:w-auto hover:bg-white/20 dark:hover:bg-gray-700/60"
            title="Mark as spam"
            aria-label="Mark selected emails as spam"
          >
            <AlertTriangle class="h-3 w-3 md:h-4 md:w-4" />
            <span class="hidden md:ml-2 md:inline">Spam</span>
          </Button>
        </div>
      {/if}
    </div>

    <div class="flex items-center space-x-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button
            builders={[builder]}
            variant="ghost"
            size="sm"
            class="h-7 md:h-8 px-2 md:px-3 hover:bg-white/20 dark:hover:bg-gray-700/60"
            title="More actions"
            aria-label="More actions"
          >
            <span class="hidden md:inline">More</span>
            <ChevronDown class="h-3 w-3 md:ml-1" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="glass dark:glass-dark border-white/20 dark:border-gray-700/50">
          <DropdownMenu.Item>Mark all as read</DropdownMenu.Item>
          <DropdownMenu.Item>Select all</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>Export emails</DropdownMenu.Item>
          <DropdownMenu.Item>Email settings</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>
</div>