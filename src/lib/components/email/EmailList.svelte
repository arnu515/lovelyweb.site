<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import EmailItem from './EmailItem.svelte';
  import { Mail } from 'lucide-svelte';
  import type { Email } from './types';

  export let emails: Email[];
  export let selectedEmails: string[];
  export let searchQuery: string;
  export let focusedIndex: number;

  const dispatch = createEventDispatcher<{
    selectEmail: { emailId: string };
    openEmail: { emailId: string };
    toggleImportant: { emailId: string };
    toggleRead: { emailId: string };
    deleteEmail: { emailId: string };
    archiveEmail: { emailId: string };
  }>();

  $: filteredEmails = emails.filter(email => 
    email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="flex-1 overflow-y-auto">
  {#each filteredEmails as email, index (email.id)}
    <EmailItem
      {email}
      isSelected={selectedEmails.includes(email.id)}
      isFocused={index === focusedIndex}
      on:select={() => dispatch('selectEmail', { emailId: email.id })}
      on:open={() => dispatch('openEmail', { emailId: email.id })}
      on:toggleImportant={() => dispatch('toggleImportant', { emailId: email.id })}
      on:toggleRead={() => dispatch('toggleRead', { emailId: email.id })}
      on:delete={() => dispatch('deleteEmail', { emailId: email.id })}
      on:archive={() => dispatch('archiveEmail', { emailId: email.id })}
    />
  {/each}

  {#if filteredEmails.length === 0}
    <div class="flex h-64 items-center justify-center p-4">
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