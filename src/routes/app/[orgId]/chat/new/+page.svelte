<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import * as Tabs from '$lib/components/ui/tabs';
  import { ArrowLeft } from 'lucide-svelte';
  import UsersList from './UsersList.svelte';
  import { invalidate } from '$app/navigation';

  export let data;
  $: orgId = $page.params.orgId;
  let mode = $page.url.searchParams.get('mode') || 'cht';
</script>

<div class="mx-auto my-10 flex max-w-screen-md p-4">
  {#await data.users}
    <div class="flex-col content-center justify-center gap-4">
      <Skeleton class="h-12 w-full" />
      <Skeleton class="h-48 w-full" />
    </div>
  {:then users}
    <Tabs.Root bind:value={mode} class="w-full space-y-4">
      <div class="flex items-center">
        <Button variant="ghost" size="icon" class="mr-2 md:hidden" href=".">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <Tabs.List class="grid w-full grid-cols-2">
          <Tabs.Trigger value="cht">New Chat</Tabs.Trigger>
          <Tabs.Trigger value="grp">New Group</Tabs.Trigger>
        </Tabs.List>
      </div>
      <Tabs.Content value="cht">
        <div class="glass dark:glass-dark rounded-2xl p-4 sm:p-8">
          <UsersList
            genHref={({ username }) => `/app/${orgId}/chat/@${username}`}
            on:refresh={() => invalidate(`org:${orgId}:members`)}
            showRefreshButton
            {users}
          />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Select a user from the above list to chat with them.
          </p>
        </div>
      </Tabs.Content>
      <Tabs.Content value="grp">
        <div class="glass dark:glass-dark rounded-2xl p-4 sm:p-8"></div>
      </Tabs.Content>
    </Tabs.Root>
  {:catch err}
    <div class="glass dark:glass-dark rounded-2xl p-8">
      <h1 class="mb-4 text-xl">An error occured while trying to fetch users:</h1>
      <p class="font-mono text-lg text-red-500">{err.message}</p>
    </div>
  {/await}
</div>
