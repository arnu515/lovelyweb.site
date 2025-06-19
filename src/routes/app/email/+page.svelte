<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Search,
    Star,
    StarOff,
    Paperclip,
    Archive,
    Trash2,
    Mail,
    MailOpen,
    AlertTriangle,
    ChevronDown,
    Download,
    Tag,
    Check,
    X
  } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { cn } from '$lib/utils';

  // Mock email data
  let emails = [
    {
      id: '1',
      from: 'Sarah Wilson',
      fromEmail: 'sarah@company.com',
      subject: 'Q4 Budget Review Meeting',
      preview: 'Hi team, I\'ve scheduled our Q4 budget review for next Tuesday. Please review the attached documents...',
      time: '2 min ago',
      isRead: false,
      isImportant: true,
      isSelected: false,
      attachments: [
        { name: 'budget-q4.pdf', size: '2.4 MB', type: 'pdf' },
        { name: 'expenses.xlsx', size: '1.8 MB', type: 'excel' }
      ],
      tags: ['urgent', 'finance'],
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
    },
    {
      id: '2',
      from: 'Mike Chen',
      fromEmail: 'mike@techcorp.com',
      subject: 'Project Alpha Development Update',
      preview: 'The development phase is progressing well. We\'re on track to meet the deadline. Here\'s the latest status...',
      time: '1 hour ago',
      isRead: false,
      isImportant: false,
      isSelected: false,
      attachments: [
        { name: 'status-report.pdf', size: '856 KB', type: 'pdf' }
      ],
      tags: ['project', 'development'],
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
    },
    {
      id: '3',
      from: 'Emma Davis',
      fromEmail: 'emma@design.co',
      subject: 'Design System Updates',
      preview: 'I\'ve updated our design system with new components and guidelines. Please review and provide feedback...',
      time: '3 hours ago',
      isRead: true,
      isImportant: true,
      isSelected: false,
      attachments: [],
      tags: ['design'],
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
    },
    {
      id: '4',
      from: 'Alex Johnson',
      fromEmail: 'alex@startup.io',
      subject: 'Weekly Team Standup Notes',
      preview: 'Here are the notes from this week\'s standup meeting. Key highlights and action items are included...',
      time: 'Yesterday',
      isRead: true,
      isImportant: false,
      isSelected: false,
      attachments: [
        { name: 'standup-notes.docx', size: '245 KB', type: 'word' }
      ],
      tags: ['meeting', 'team'],
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
    },
    {
      id: '5',
      from: 'Lisa Park',
      fromEmail: 'lisa@marketing.com',
      subject: 'Marketing Campaign Results',
      preview: 'The Q3 marketing campaign has concluded with excellent results. Here\'s a detailed breakdown of the metrics...',
      time: '2 days ago',
      isRead: true,
      isImportant: false,
      isSelected: false,
      attachments: [
        { name: 'campaign-results.pdf', size: '3.2 MB', type: 'pdf' },
        { name: 'analytics.csv', size: '1.1 MB', type: 'csv' }
      ],
      tags: ['marketing', 'results'],
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
    }
  ];

  let searchQuery = '';
  let selectedEmails: string[] = [];
  let hoveredEmail: string | null = null;

  // Keyboard navigation
  let focusedIndex = 0;
  let isVimMode = false;

  $: filteredEmails = emails.filter(email => 
    email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: allSelected = selectedEmails.length === filteredEmails.length && filteredEmails.length > 0;
  $: someSelected = selectedEmails.length > 0;

  function toggleEmailSelection(emailId: string) {
    if (selectedEmails.includes(emailId)) {
      selectedEmails = selectedEmails.filter(id => id !== emailId);
    } else {
      selectedEmails = [...selectedEmails, emailId];
    }
  }

  function toggleAllSelection() {
    if (allSelected) {
      selectedEmails = [];
    } else {
      selectedEmails = filteredEmails.map(email => email.id);
    }
  }

  function toggleImportant(emailId: string) {
    emails = emails.map(email => 
      email.id === emailId ? { ...email, isImportant: !email.isImportant } : email
    );
  }

  function toggleRead(emailId: string) {
    emails = emails.map(email => 
      email.id === emailId ? { ...email, isRead: !email.isRead } : email
    );
  }

  function markSelectedAsRead() {
    emails = emails.map(email => 
      selectedEmails.includes(email.id) ? { ...email, isRead: true } : email
    );
  }

  function markSelectedAsUnread() {
    emails = emails.map(email => 
      selectedEmails.includes(email.id) ? { ...email, isRead: false } : email
    );
  }

  function markSelectedAsImportant() {
    emails = emails.map(email => 
      selectedEmails.includes(email.id) ? { ...email, isImportant: true } : email
    );
  }

  function deleteSelected() {
    emails = emails.filter(email => !selectedEmails.includes(email.id));
    selectedEmails = [];
  }

  function archiveSelected() {
    // In a real app, this would move emails to archive
    emails = emails.filter(email => !selectedEmails.includes(email.id));
    selectedEmails = [];
  }

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

  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement) return;

    switch (event.key) {
      case 'j':
        event.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, filteredEmails.length - 1);
        break;
      case 'k':
        event.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'x':
        event.preventDefault();
        if (filteredEmails[focusedIndex]) {
          toggleEmailSelection(filteredEmails[focusedIndex].id);
        }
        break;
      case 's':
        event.preventDefault();
        if (filteredEmails[focusedIndex]) {
          toggleImportant(filteredEmails[focusedIndex].id);
        }
        break;
      case 'r':
        event.preventDefault();
        if (filteredEmails[focusedIndex]) {
          toggleRead(filteredEmails[focusedIndex].id);
        }
        break;
      case 'Delete':
      case 'd':
        event.preventDefault();
        if (someSelected) {
          deleteSelected();
        } else if (filteredEmails[focusedIndex]) {
          emails = emails.filter(email => email.id !== filteredEmails[focusedIndex].id);
        }
        break;
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          toggleAllSelection();
        }
        break;
      case '/':
        event.preventDefault();
        document.getElementById('search-input')?.focus();
        break;
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head>
  <title>Inbox - lovelyweb.site</title>
</svelte:head>

<div class="flex h-full flex-col">
  <!-- Header -->
  <div class="glass dark:glass-dark border-b border-white/20 p-4 dark:border-gray-700/50">
    <!-- Search Bar -->
    <div class="mb-4">
      <div class="relative max-w-2xl">
        <Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          id="search-input"
          bind:value={searchQuery}
          placeholder="Search emails..."
          class="glass dark:glass-dark w-full border-white/30 py-3 pl-12 pr-4 text-base shadow-lg transition-all duration-200 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/50 dark:border-gray-700/50"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          on:click={toggleAllSelection}
          class="h-5 w-5"
        />
        
        {#if someSelected}
          <div class="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              on:click={markSelectedAsRead}
              class="h-8 px-3 hover:bg-white/20 dark:hover:bg-gray-700/60"
            >
              <MailOpen class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              on:click={markSelectedAsUnread}
              class="h-8 px-3 hover:bg-white/20 dark:hover:bg-gray-700/60"
            >
              <Mail class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              on:click={markSelectedAsImportant}
              class="h-8 px-3 hover:bg-white/20 dark:hover:bg-gray-700/60"
            >
              <Star class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              on:click={archiveSelected}
              class="h-8 px-3 hover:bg-white/20 dark:hover:bg-gray-700/60"
            >
              <Archive class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              on:click={deleteSelected}
              class="h-8 px-3 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="h-8 px-3 hover:bg-white/20 dark:hover:bg-gray-700/60"
            >
              <AlertTriangle class="h-4 w-4" />
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
              class="h-8 px-3 hover:bg-white/20 dark:hover:bg-gray-700/60"
            >
              More
              <ChevronDown class="ml-1 h-3 w-3" />
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

  <!-- Email List -->
  <div class="flex-1 overflow-y-auto">
    {#each filteredEmails as email, index (email.id)}
      <div
        class={cn(
          'group relative border-b border-white/10 p-4 transition-all duration-200 hover:bg-white/10 dark:border-gray-700/30 dark:hover:bg-gray-800/30',
          index === focusedIndex && 'ring-2 ring-purple-500/50',
          email.isSelected && 'bg-purple-50/50 dark:bg-purple-900/20'
        )}
        on:mouseenter={() => hoveredEmail = email.id}
        on:mouseleave={() => hoveredEmail = null}
        role="button"
        tabindex="0"
        on:click={() => toggleEmailSelection(email.id)}
        on:keydown={(e) => e.key === 'Enter' && toggleEmailSelection(email.id)}
      >
        <div class="flex items-start space-x-4">
          <!-- Checkbox -->
          <div class="flex items-center pt-1">
            <Checkbox
              checked={selectedEmails.includes(email.id)}
              on:click={(e) => {
                e.stopPropagation();
                toggleEmailSelection(email.id);
              }}
              class="h-4 w-4"
            />
          </div>

          <!-- Avatar -->
          <div class="flex-shrink-0">
            <img
              src={email.avatar}
              alt={email.from}
              class="h-10 w-10 rounded-full"
            />
          </div>

          <!-- Email Content -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <h3 class={cn(
                  'truncate text-sm',
                  email.isRead 
                    ? 'font-normal text-gray-600 dark:text-gray-400' 
                    : 'font-semibold text-gray-900 dark:text-white'
                )}>
                  {email.from}
                </h3>
                {#if email.isImportant}
                  <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {/if}
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {email.time}
                </span>
                {#if hoveredEmail === email.id}
                  <div class="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 hover:bg-white/20 dark:hover:bg-gray-700/60"
                      on:click={(e) => {
                        e.stopPropagation();
                        toggleImportant(email.id);
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
                      on:click={(e) => {
                        e.stopPropagation();
                        toggleRead(email.id);
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
                      on:click={(e) => {
                        e.stopPropagation();
                        archiveSelected();
                      }}
                    >
                      <Archive class="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                      on:click={(e) => {
                        e.stopPropagation();
                        emails = emails.filter(e => e.id !== email.id);
                      }}
                    >
                      <Trash2 class="h-3 w-3" />
                    </Button>
                  </div>
                {/if}
              </div>
            </div>

            <h4 class={cn(
              'mb-1 truncate text-sm',
              email.isRead 
                ? 'font-normal text-gray-700 dark:text-gray-300' 
                : 'font-medium text-gray-900 dark:text-white'
            )}>
              {email.subject}
            </h4>

            <p class="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {email.preview}
            </p>

            <!-- Tags and Attachments -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <!-- Tags -->
                {#if email.tags.length > 0}
                  <div class="flex items-center space-x-1">
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
              </div>

              <!-- Attachments -->
              {#if email.attachments.length > 0}
                <div class="flex items-center space-x-1">
                  <Paperclip class="h-3 w-3 text-gray-400" />
                  {#each email.attachments.slice(0, 2) as attachment}
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-6 px-2 text-xs hover:bg-white/20 dark:hover:bg-gray-700/60"
                      on:click={(e) => {
                        e.stopPropagation();
                        // Download attachment
                      }}
                    >
                      <span class="mr-1">{getFileIcon(attachment.type)}</span>
                      {attachment.name}
                      <Download class="ml-1 h-2 w-2" />
                    </Button>
                  {/each}
                  {#if email.attachments.length > 2}
                    <span class="text-xs text-gray-500">
                      +{email.attachments.length - 2} more
                    </span>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}

    {#if filteredEmails.length === 0}
      <div class="flex h-64 items-center justify-center">
        <div class="text-center">
          <Mail class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No emails found
          </h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            {searchQuery ? 'Try adjusting your search terms.' : 'Your inbox is empty.'}
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Keyboard shortcuts help -->
  <div class="glass dark:glass-dark border-t border-white/20 p-2 dark:border-gray-700/50">
    <div class="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">j/k</kbd> navigate</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">x</kbd> select</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">s</kbd> star</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">r</kbd> read</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">d</kbd> delete</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">/</kbd> search</span>
    </div>
  </div>
</div>