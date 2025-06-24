<script lang="ts" generics="T">
  import { Input } from '$lib/components/ui/input';
  import { cn } from '$lib/utils';
  import { Button } from '$lib/components/ui/button';
  import { createEventDispatcher } from 'svelte';
  import { Check, RefreshCw } from 'lucide-svelte';

  type User<T> = {
    id: T;
    name: string;
    username: string;
    avatar_url: string;
    checked?: boolean;
  };
  export let users: User<T>[];
  export let showRefreshButton: boolean = false;
  export let genHref: ((user: User<T>) => string) | undefined;

  const d = createEventDispatcher();
  let username = '';
  $: usersInEffect = username.trim().length
    ? users.filter(i => {
        const un = username.toLowerCase();
        return (
          i.name.toLowerCase().includes(un) || i.username.toLowerCase().includes(un)
        );
      })
    : users;
</script>

<div class="mb-1 flex items-end justify-between gap-2">
  <label
    for="username"
    class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
  >
    Name / Username
  </label>
  {#if showRefreshButton}
    <Button variant="ghost" size="icon" on:click={() => d('refresh')}>
      <RefreshCw class="h-4 w-4" />
    </Button>
  {/if}
</div>
<Input
  id="username"
  type="search"
  maxlength={255}
  placeholder="Search for users..."
  class="glass dark:glass-dark w-full rounded-none border-white/30 dark:border-gray-700/50"
  bind:value={username}
/>
<div class="glass dark:glass-dark mt-4 flex flex-col justify-center rounded-none">
  {#if usersInEffect.length === 0}
    <p class="p-4 text-sm text-gray-600 dark:text-gray-300">
      No users match your search.
    </p>
  {:else}
    {#each usersInEffect as user}
      <Button
        href={genHref ? genHref(user) : undefined}
        type={genHref ? undefined : 'button'}
        on:click={() => d('select', { id: user.id, checked: user.checked })}
        variant="ghost"
        class="flex w-full gap-4 rounded-none py-6 text-left transition-colors duration-200 dark:hover:bg-gray-900"
      >
        <div class="relative flex-shrink-0">
          <img
            src={user.avatar_url}
            alt="{user.name}'s Avatar"
            class="h-8 w-8 rounded-full"
          />
          <div
            class={cn(
              'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800',
              // todo: online indicator
              true ? 'bg-green-400' : 'bg-red-400'
            )}
          ></div>
        </div>
        <div class="flex-1">
          <p class="truncate font-medium">{user.name}</p>
          <p class="truncate font-mono text-sm text-muted-foreground">
            @{user.username}
          </p>
        </div>
        {#if user.checked}
          <Check class="text-purple-500" aria-label="Selected" />
        {/if}
      </Button>
    {/each}
  {/if}
</div>
