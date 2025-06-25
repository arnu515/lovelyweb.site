<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { X, Users, UserMinus, UserPlus, Search, Crown } from 'lucide-svelte';
  import { createBrowserClient } from '@supabase/ssr';
  import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL
  } from '$env/static/public';
  import type { Database } from '$lib/database.types';
  import { toast } from 'svelte-sonner';
  import { cn } from '$lib/utils';
  import { page } from '$app/stores';

  export let isOpen = false;
  export let chat: any;
  export let currentUser: any;

  const dispatch = createEventDispatcher<{ close: void }>();
  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  $: orgId = $page.params.orgId;

  let members: any[] = [];
  let membersLoading = false;
  let membersError = '';

  let searchQuery = '';
  let searchResults: any[] = [];
  let searchLoading = false;
  let addingMember = false;

  // Fetch group members if it's a group chat
  async function fetchGroupMembers() {
    if (!chat?.is_group || !isOpen) return;

    membersLoading = true;
    membersError = '';

    try {
      const { data, error } = await supabase
        .from('chat_group_members')
        .select(`
          user_id,
          created_at,
          users (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('group_id', chat.id.toString());

      if (error) throw error;

      members = data.map(member => ({
        ...member.users,
        joined_at: member.created_at
      }));
    } catch (error: any) {
      membersError = error.message;
      toast.error('Failed to load group members', {
        description: error.message
      });
    } finally {
      membersLoading = false;
    }
  }

  // Search for users to add to group
  async function searchUsers() {
    if (!searchQuery.trim() || !chat?.is_group) return;

    searchLoading = true;
    try {
      const { data, error } = await supabase
        .from('organisations_users')
        .select(`
          users (
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('organisation_id', orgId)
        .or(`users.name.ilike.%${searchQuery}%,users.username.ilike.%${searchQuery}%`);

      if (error) throw error;

      // Filter out users who are already members
      const memberIds = new Set(members.map(m => m.id));
      searchResults = data
        .map(item => item.users)
        .filter(user => user && !memberIds.has(user.id));
    } catch (error: any) {
      toast.error('Failed to search users', {
        description: error.message
      });
    } finally {
      searchLoading = false;
    }
  }

  // Add member to group
  async function addMember(userId: string) {
    if (!chat?.is_group || addingMember) return;

    addingMember = true;
    try {
      const { error } = await supabase
        .from('chat_group_members')
        .insert({
          group_id: chat.id.toString(),
          user_id: userId
        });

      if (error) throw error;

      toast.success('Member added successfully');
      searchQuery = '';
      searchResults = [];
      await fetchGroupMembers();
    } catch (error: any) {
      toast.error('Failed to add member', {
        description: error.message
      });
    } finally {
      addingMember = false;
    }
  }

  // Remove member from group
  async function removeMember(userId: string) {
    if (!chat?.is_group || userId === currentUser.id) return;

    try {
      const { error } = await supabase
        .from('chat_group_members')
        .delete()
        .eq('group_id', chat.id.toString())
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Member removed successfully');
      await fetchGroupMembers();
    } catch (error: any) {
      toast.error('Failed to remove member', {
        description: error.message
      });
    }
  }

  function getGroupAvatarUrl(gid: string, avatar_type: string) {
    if (avatar_type !== 'svg' && avatar_type !== 'webp') return null;
    return supabase.storage
      .from('avatars')
      .getPublicUrl(`/org/${orgId}/group/${gid}.${avatar_type}`).data.publicUrl;
  }

  // Check if current user is group owner
  $: isGroupOwner = chat?.is_group && chat?.owner_id === currentUser.id;

  // Reactive fetch when sidebar opens
  $: if (isOpen && chat?.is_group) {
    fetchGroupMembers();
  }

  // Search when query changes
  $: if (searchQuery.trim()) {
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  } else {
    searchResults = [];
  }
</script>

<!-- Mobile overlay -->
{#if isOpen}
  <div
    class="fixed inset-0 z-40 bg-black/50 md:hidden"
    on:click={() => dispatch('close')}
    on:keydown={e => e.key === 'Escape' && dispatch('close')}
    role="button"
    tabindex="0"
  ></div>
{/if}

<!-- Sidebar -->
<div
  class={cn(
    'glass dark:glass-dark fixed right-0 top-0 z-50 h-full w-full border-l border-white/20 transition-transform duration-300 dark:border-gray-700/50 md:w-80',
    isOpen ? 'translate-x-0' : 'translate-x-full'
  )}
>
  <!-- Header -->
  <div class="border-b border-white/20 p-4 dark:border-gray-700/50">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Chat Info
      </h2>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        on:click={() => dispatch('close')}
      >
        <X class="h-4 w-4" />
      </Button>
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto p-4">
    {#if !chat}
      <div class="space-y-4">
        <Skeleton class="h-16 w-16 rounded-full" />
        <Skeleton class="h-6 w-32" />
        <Skeleton class="h-4 w-24" />
      </div>
    {:else}
      <!-- Chat Avatar and Info -->
      <div class="mb-6 text-center">
        {@const avatar = chat.is_group
          ? getGroupAvatarUrl(chat.id, chat.avatar_url)
          : chat.avatar_url}
        
        <div class="relative mx-auto mb-4 w-fit">
          {#if avatar}
            <img
              src={avatar}
              alt="{chat.name}'s Avatar"
              class="h-20 w-20 rounded-full border-2 border-purple-200 dark:border-purple-800"
            />
          {:else}
            <div
              class="glass dark:glass-dark flex h-20 w-20 items-center justify-center rounded-full border-2 border-purple-200 text-2xl uppercase shadow-none dark:border-purple-800"
            >
              {chat.name.charAt(0)}
            </div>
          {/if}
          
          {#if chat.is_group}
            <div
              class="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white"
            >
              <Users class="h-4 w-4" />
            </div>
          {/if}
        </div>

        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {chat.name}
        </h3>
        
        {#if !chat.is_group}
          <p class="text-sm text-gray-500 dark:text-gray-400">
            @{chat.slug.substring(1)}
          </p>
        {:else}
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Group Chat
          </p>
        {/if}
      </div>

      <!-- Group Members Section -->
      {#if chat.is_group}
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
              Members
            </h4>
            {#if !membersLoading}
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            {/if}
          </div>

          <!-- Members List -->
          {#if membersLoading}
            <div class="space-y-3">
              {#each Array(3) as _}
                <div class="flex items-center space-x-3">
                  <Skeleton class="h-10 w-10 rounded-full" />
                  <div class="flex-1">
                    <Skeleton class="h-4 w-24" />
                    <Skeleton class="h-3 w-16" />
                  </div>
                </div>
              {/each}
            </div>
          {:else if membersError}
            <div class="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-300">
              <p class="text-sm">{membersError}</p>
            </div>
          {:else}
            <div class="space-y-2">
              {#each members as member (member.id)}
                <div
                  class="flex items-center justify-between rounded-lg bg-white/60 p-3 dark:bg-gray-800/60"
                >
                  <div class="flex items-center space-x-3">
                    <img
                      src={member.avatar_url}
                      alt="{member.name}'s Avatar"
                      class="h-10 w-10 rounded-full"
                    />
                    <div>
                      <div class="flex items-center space-x-2">
                        <p class="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </p>
                        {#if member.id === chat.owner_id}
                          <Crown class="h-4 w-4 text-yellow-500" title="Group Owner" />
                        {/if}
                      </div>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        @{member.username}
                      </p>
                    </div>
                  </div>
                  
                  {#if isGroupOwner && member.id !== currentUser.id}
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                      on:click={() => removeMember(member.id)}
                      title="Remove member"
                    >
                      <UserMinus class="h-4 w-4" />
                    </Button>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          <!-- Add Member Section (only for group owner) -->
          {#if isGroupOwner}
            <div class="border-t border-white/20 pt-4 dark:border-gray-700/50">
              <h5 class="mb-3 font-medium text-gray-900 dark:text-white">
                Add Member
              </h5>
              
              <div class="space-y-3">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    bind:value={searchQuery}
                    placeholder="Search by name or username..."
                    class="glass dark:glass-dark border-white/30 pl-10 dark:border-gray-700/50"
                  />
                </div>

                {#if searchLoading}
                  <div class="space-y-2">
                    {#each Array(2) as _}
                      <div class="flex items-center space-x-3 rounded-lg p-2">
                        <Skeleton class="h-8 w-8 rounded-full" />
                        <div class="flex-1">
                          <Skeleton class="h-4 w-20" />
                          <Skeleton class="h-3 w-16" />
                        </div>
                      </div>
                    {/each}
                  </div>
                {:else if searchResults.length > 0}
                  <div class="max-h-40 space-y-1 overflow-y-auto">
                    {#each searchResults as user (user.id)}
                      <div
                        class="flex items-center justify-between rounded-lg bg-white/40 p-2 dark:bg-gray-800/40"
                      >
                        <div class="flex items-center space-x-2">
                          <img
                            src={user.avatar_url}
                            alt="{user.name}'s Avatar"
                            class="h-8 w-8 rounded-full"
                          />
                          <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          class="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
                          on:click={() => addMember(user.id)}
                          disabled={addingMember}
                          title="Add member"
                        >
                          <UserPlus class="h-4 w-4" />
                        </Button>
                      </div>
                    {/each}
                  </div>
                {:else if searchQuery.trim()}
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    No users found matching "{searchQuery}"
                  </p>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</div>