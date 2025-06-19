<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import EmailToolbar from '$lib/components/email/EmailToolbar.svelte';
  import EmailList from '$lib/components/email/EmailList.svelte';
  import type { Email } from '$lib/components/email/types';

  // Mock email data
  let emails: Email[] = [
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
  let focusedIndex = 0;

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

  function openEmail(emailId: string) {
    // Navigate to email detail view
    goto(`/app/email/${emailId}`);
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

  function deleteEmail(emailId: string) {
    emails = emails.filter(email => email.id !== emailId);
    selectedEmails = selectedEmails.filter(id => id !== emailId);
  }

  function archiveSelected() {
    // In a real app, this would move emails to archive
    emails = emails.filter(email => !selectedEmails.includes(email.id));
    selectedEmails = [];
  }

  function archiveEmail(emailId: string) {
    emails = emails.filter(email => email.id !== emailId);
    selectedEmails = selectedEmails.filter(id => id !== emailId);
  }

  function spamSelected() {
    // In a real app, this would move emails to spam
    emails = emails.filter(email => !selectedEmails.includes(email.id));
    selectedEmails = [];
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
      case 'Enter':
        event.preventDefault();
        if (filteredEmails[focusedIndex]) {
          openEmail(filteredEmails[focusedIndex].id);
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
          deleteEmail(filteredEmails[focusedIndex].id);
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
  <EmailToolbar
    bind:searchQuery
    {allSelected}
    {someSelected}
    on:toggleAllSelection={toggleAllSelection}
    on:markSelectedAsRead={markSelectedAsRead}
    on:markSelectedAsUnread={markSelectedAsUnread}
    on:markSelectedAsImportant={markSelectedAsImportant}
    on:deleteSelected={deleteSelected}
    on:archiveSelected={archiveSelected}
    on:spamSelected={spamSelected}
  />

  <EmailList
    {emails}
    {selectedEmails}
    {searchQuery}
    {focusedIndex}
    on:selectEmail={(e) => toggleEmailSelection(e.detail.emailId)}
    on:openEmail={(e) => openEmail(e.detail.emailId)}
    on:toggleImportant={(e) => toggleImportant(e.detail.emailId)}
    on:toggleRead={(e) => toggleRead(e.detail.emailId)}
    on:deleteEmail={(e) => deleteEmail(e.detail.emailId)}
    on:archiveEmail={(e) => archiveEmail(e.detail.emailId)}
  />

  <!-- Keyboard shortcuts help -->
  <div class="glass dark:glass-dark border-t border-white/20 p-2 dark:border-gray-700/50">
    <div class="flex items-center justify-center space-x-2 md:space-x-4 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto">
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">j/k</kbd> navigate</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">x</kbd> select</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">Enter</kbd> open</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">s</kbd> star</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">r</kbd> read</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">d</kbd> delete</span>
      <span><kbd class="rounded bg-gray-200 px-1 dark:bg-gray-700">/</kbd> search</span>
    </div>
  </div>
</div>