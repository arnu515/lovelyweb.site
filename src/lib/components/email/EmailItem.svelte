<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import {
    Star,
    StarOff,
    Mail,
    MailOpen,
    Archive,
    Trash2,
    Paperclip,
    Download,
    Tag
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import type { Email } from './types';

  export let email: Email;
  export let isSelected: boolean;
  export let isFocused: boolean;

  const dispatch = createEventDispatcher<{
    select: void;
    open: void;
    toggleImportant: void;
    toggleRead: void;
    delete: void;
    archive: void;
  }>();

  let isHovered = false;

  function getFileIcon(type: string) {
    switch (type) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'word': return '📝';
      case 'csv': return '📈';
      default: return '📎';
    }
  }

  function getTagColor(tag: string) {
    const colors = {
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      finance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      project: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      development: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      design: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      meeting: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      team: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      marketing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      results: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    };
    return colors[tag] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  }
</script>

<div
  class={cn(
    'group relative border-b border-white/10 p-3 md:p-4 transition-all duration-200 hover:bg-white/10 dark:border-gray-700/30 dark:hover:bg-gray-800/30 cursor-pointer',
    isFocused && 'ring-2 ring-purple-500/50',
    isSelected && 'bg-purple-50/50 dark:bg-purple-900/20'
  )}
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => isHovered = false}
  role="button"
  tabindex="0"
  on:click={() => dispatch('open')}
  on:keydown={(e) => e.key === 'Enter' && dispatch('open')}
>
  <div class="flex items-start space-x-3 md:space-x-4">
    <!-- Checkbox -->
    <div class="flex items-center pt-1 flex-shrink-0">
      <Checkbox
        checked={isSelected}
        on:click={(e) => {
          e.stopPropagation();
          dispatch('select');
        }}
        class="h-4 w-4"
        aria-label="Select email from {email.from}"
      />
    </div>

    <!-- Avatar -->
    <div class="flex-shrink-0 hidden sm:block">
      <img
        src={email.avatar}
        alt={email.from}
        class="h-8 w-8 md:h-10 md:w-10 rounded-full"
      />
    </div>

    <!-- Email Content -->
    <div class="min-w-0 flex-1">
      <!-- Header Row -->
      <div class="flex items-start justify-between mb-1">
        <div class="flex items-center space-x-2 min-w-0 flex-1">
          <h3 class={cn(
            'truncate text-sm',
            email.isRead 
              ? 'font-normal text-gray-600 dark:text-gray-400' 
              : 'font-semibold text-gray-900 dark:text-white'
          )}>
            {email.from}
          </h3>
          {#if email.isImportant}
            <Star class="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
          {/if}
        </div>
        
        <!-- Time and Actions -->
        <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
          <span class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            {email.time}
          </span>
          
          <!-- Action buttons - always reserve space to prevent shifting -->
          <div class="flex items-center space-x-1" style="width: 120px; justify-content: flex-end;">
            {#if isHovered}
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6 hover:bg-white/20 dark:hover:bg-gray-700/60"
                title={email.isImportant ? 'Remove star' : 'Add star'}
                aria-label={email.isImportant ? 'Remove star' : 'Add star'}
                on:click={(e) => {
                  e.stopPropagation();
                  dispatch('toggleImportant');
                }}
              >
                {#if email.isImportant}
                  <StarOff class="h-3 w-3" />
                {:else}
                  <Star class="h-3 w-3" />
                {/if}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6 hover:bg-white/20 dark:hover:bg-gray-700/60"
                title={email.isRead ? 'Mark as unread' : 'Mark as read'}
                aria-label={email.isRead ? 'Mark as unread' : 'Mark as read'}
                on:click={(e) => {
                  e.stopPropagation();
                  dispatch('toggleRead');
                }}
              >
                {#if email.isRead}
                  <Mail class="h-3 w-3" />
                {:else}
                  <MailOpen class="h-3 w-3" />
                {/if}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6 hover:bg-white/20 dark:hover:bg-gray-700/60"
                title="Archive email"
                aria-label="Archive email"
                on:click={(e) => {
                  e.stopPropagation();
                  dispatch('archive');
                }}
              >
                <Archive class="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                title="Delete email"
                aria-label="Delete email"
                on:click={(e) => {
                  e.stopPropagation();
                  dispatch('delete');
                }}
              >
                <Trash2 class="h-3 w-3" />
              </Button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Subject -->
      <h4 class={cn(
        'mb-1 truncate text-sm',
        email.isRead 
          ? 'font-normal text-gray-700 dark:text-gray-300' 
          : 'font-medium text-gray-900 dark:text-white'
      )}>
        {email.subject}
      </h4>

      <!-- Preview -->
      <p class="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
        {email.preview}
      </p>

      <!-- Time on mobile -->
      <div class="sm:hidden mb-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {email.time}
        </span>
      </div>

      <!-- Tags and Attachments -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <!-- Tags -->
        {#if email.tags.length > 0}
          <div class="flex items-center flex-wrap gap-1">
            {#each email.tags.slice(0, 3) as tag}
              <span class={cn(
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                getTagColor(tag)
              )}>
                <Tag class="mr-1 h-2 w-2" />
                {tag}
              </span>
            {/each}
          </div>
        {/if}

        <!-- Attachments -->
        {#if email.attachments.length > 0}
          <div class="flex items-center space-x-1 flex-wrap">
            <Paperclip class="h-3 w-3 text-gray-400 flex-shrink-0" />
            {#each email.attachments.slice(0, 2) as attachment}
              <Button
                variant="ghost"
                size="sm"
                class="h-6 px-2 text-xs hover:bg-white/20 dark:hover:bg-gray-700/60"
                title="Download {attachment.name}"
                aria-label="Download {attachment.name}"
                on:click={(e) => {
                  e.stopPropagation();
                  // Download attachment
                }}
              >
                <span class="mr-1">{getFileIcon(attachment.type)}</span>
                <span class="hidden sm:inline">{attachment.name}</span>
                <span class="sm:hidden">{attachment.type.toUpperCase()}</span>
                <Download class="ml-1 h-2 w-2" />
              </Button>
            {/each}
            {#if email.attachments.length > 2}
              <span class="text-xs text-gray-500">
                +{email.attachments.length - 2}
              </span>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>