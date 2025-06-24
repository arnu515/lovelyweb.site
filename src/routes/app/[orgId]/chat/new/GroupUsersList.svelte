<script lang="ts">
  import { invalidate } from '$app/navigation';
  import UsersList from './UsersList.svelte';
  import { createEventDispatcher } from 'svelte';

  export let users: any[];
  export let orgId: string;
  const d = createEventDispatcher();
  $: actualUsers = users;
</script>

<UsersList
  users={actualUsers}
  showRefreshButton={true}
  genHref={undefined}
  on:refresh={() => invalidate(`org:${orgId}:members`)}
  on:select={e => {
    const { id, checked } = e.detail;
    actualUsers = actualUsers.map(i =>
      i.id === id ? { ...i, checked: !checked } : i
    );
    d(checked ? 'remove' : 'add', id);
  }}
/>
