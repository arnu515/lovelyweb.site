<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Alert from '$lib/components/ui/alert';
  import { ArrowLeft, Loader2 } from 'lucide-svelte';
  import UsersList from './UsersList.svelte';
  import { goto, invalidate } from '$app/navigation';
  import GroupUsersList from './GroupUsersList.svelte';
  import { createBrowserClient } from '@supabase/ssr';
  import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL
  } from '$env/static/public';
  import type { Database } from '$lib/database.types';
  import { nanoid } from 'nanoid';
  import { captureException } from '@sentry/sveltekit';
  import { toast } from 'svelte-sonner';

  export let data;
  $: orgId = $page.params.orgId;
  let mode = $page.url.searchParams.get('mode') || 'cht';

  // Group form state
  let groupName = '';
  let groupDescription = '';
  let groupAvatar: File | null = null;
  let selectedUsers: Set<string> = new Set();
  let groupLoading = false;
  let groupError = '';

  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  async function convertAvatarToWebp(img: File): Promise<string | Blob> {
    if (!img.type.startsWith('image')) return 'Group Avatar must be an image file.';

    return await new Promise<Blob>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imgElement = new Image();
        imgElement.onload = function () {
          const canvas = document.createElement('canvas');
          canvas.width = imgElement.width;
          canvas.height = imgElement.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Could not get canvas context.');
            return;
          }
          ctx.drawImage(imgElement, 0, 0);
          canvas.toBlob(
            blob => {
              if (blob) {
                resolve(blob);
              } else {
                reject('Failed to convert image to WebP.');
              }
            },
            'image/webp',
            0.92 // quality
          );
        };
        imgElement.onerror = function () {
          reject('Failed to load image.');
        };
        imgElement.src = e.target?.result as string;
      };
      reader.onerror = function () {
        reject('Failed to read file.');
      };
      reader.readAsDataURL(img);
    }).catch(e => (typeof e === 'string' ? e : 'Unknown error'));
  }

  async function createGroup() {
    // this should never happen
    if (data.auth.user === null) {
      goto('/auth');
      return;
    }

    groupError = '';
    groupName = groupName.trim();
    if (!groupName || groupName.length < 4 || groupName.length > 64) {
      groupError = 'Group name must be between 4 and 64 characters.';
      return;
    }
    groupDescription = groupDescription.trim();
    if (groupDescription && groupDescription.length > 500) {
      groupError = 'Description must be 500 characters or less.';
      return;
    }
    if (selectedUsers.size < 2) {
      groupError = 'Groups must have at least three people (including yourself)';
      return;
    }
    let avatarBlob: Blob | null = null;
    let imgType: 'webp' | 'svg' = 'webp';
    if (groupAvatar) {
      if (groupAvatar.type.startsWith('image/svg')) {
        imgType = 'svg';
        avatarBlob = groupAvatar;
      } else {
        const res = await convertAvatarToWebp(groupAvatar);
        if (typeof res === 'string') {
          groupError = res;
          return;
        }
        avatarBlob = res;
      }
      if (avatarBlob.size > 1024 * 1024) {
        groupError = 'Group Avatar must be less than 1 MiB.';
        return;
      }
    }

    groupLoading = true;
    try {
      const groupId = nanoid(16);
      const { error: grErr } = await supabase.from('chat_groups').insert({
        id: groupId,
        name: groupName,
        description: groupDescription || null,
        org_id: orgId,
        owner_id: data.auth.user.id,
        has_avatar: true
      });

      if (grErr) {
        groupError = 'Could not create group: ' + grErr.message;
        captureException(grErr, { tags: { supabase: 'chat_groups' } });
        return;
      }

      toast('Created group ' + groupName);

      const groupMembersPromise = Promise.all(
        selectedUsers.keys().map(async id => {
          const { error } = await supabase.from('chat_group_members').insert({
            group_id: groupId,
            user_id: id
          });
          if (error) {
            captureException(error, { tags: { supabase: 'chat_group_members' } });
            toast(`Could not add ${id}: ${error.message}`);
          }
        })
      );

      if (avatarBlob) {
        const res = await fetch('/api/groups/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ groupId, imgType })
        });
        const data = await res.json();
        if (!res.ok) {
          toast('Could not upload group avatar: ' + data.error);
        } else {
          const { data: up, error: upErr } = await supabase.storage
            .from('avatars')
            .uploadToSignedUrl(data.path, data.token, avatarBlob, {
              upsert: false
            });
          if (upErr) {
            toast('Could not upload group avatar: ' + data.error);
            captureException(upErr, {
              tags: { supabase: 'storage-upload-avatars' }
            });
          } else {
            toast('Uploaded group avatar');
          }
        }
      }

      await groupMembersPromise;
      toast('Added group members');
      goto(`/app/${orgId}/chat/-${groupId}`);
    } catch (e) {
      captureException(e, { tags: { action: 'create-group' } });
    } finally {
      groupLoading = false;
    }
  }
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
        <div class="glass dark:glass-dark rounded-2xl p-4 sm:p-8">
          <form
            class="space-y-4"
            on:submit|preventDefault={createGroup}
            enctype="multipart/form-data"
          >
            {#if groupError}
              <Alert.Root variant="destructive" class="my-4 space-y-2">
                <Alert.Title>An error occured</Alert.Title>
                <Alert.Description>{groupError}</Alert.Description>
              </Alert.Root>
            {/if}
            <div>
              <label
                for="group-name"
                class="mb-2 block text-sm font-medium text-gray-300"
              >
                Group Name
              </label>
              <input
                id="group-name"
                type="text"
                minlength={4}
                maxlength={64}
                bind:value={groupName}
                required
                class="w-full rounded-md border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter group name"
                autocomplete="off"
              />
            </div>
            <div>
              <label
                for="group-description"
                class="mb-2 block text-sm font-medium text-gray-300"
              >
                Description
              </label>
              <textarea
                id="group-description"
                name="group-description"
                bind:value={groupDescription}
                class="w-full rounded-md border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Describe your group (optional)"
                maxlength={500}
                rows="2"
              />
            </div>
            <div>
              <label
                for="group-avatar"
                class="mb-2 block text-sm font-medium text-gray-300"
              >
                Group Avatar (optional)
              </label>
              <input
                id="group-avatar"
                name="group-avatar"
                type="file"
                accept="image/*"
                on:change={e => (groupAvatar = e.currentTarget.files?.[0] ?? null)}
                class="block w-full text-sm text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white hover:file:bg-purple-700"
              />
            </div>
            <div>
              <p class="mb-2 block text-sm font-medium text-gray-300">
                Add Members
              </p>
              <GroupUsersList
                {users}
                {orgId}
                on:add={e => selectedUsers.add(e.detail)}
                on:remove={e => selectedUsers.delete(e.detail)}
              />
              <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Select users to add to your group.
              </p>
            </div>
            <button
              type="submit"
              class="gradient-primary flex w-full items-center gap-2 rounded-md px-4 py-2 font-semibold text-white"
              disabled={groupLoading}
            >
              {#if groupLoading}
                <Loader2 class="size-5 animate-spin" />
              {/if}
              Create Group
            </button>
          </form>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  {:catch err}
    <div class="glass dark:glass-dark rounded-2xl p-8">
      <h1 class="mb-4 text-xl">An error occured while trying to fetch users:</h1>
      <p class="font-mono text-lg text-red-500">{err.message}</p>
    </div>
  {/await}
</div>
