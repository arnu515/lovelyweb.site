<script lang="ts">
  import { Mail, MessageCircle, Users } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';

  export let user: NonNullable<App.Locals['auth']['user']>;

  // Mock data for recent emails
  const recentEmails = [
    {
      from: 'Sarah Wilson',
      subject: 'Q4 Budget Review',
      preview:
        "Hi team, I've attached the Q4 budget review for your consideration...",
      time: '2 min ago',
      unread: true
    },
    {
      from: 'Mike Chen',
      subject: 'Project Update',
      preview:
        "The development phase is progressing well. We're on track to meet...",
      time: '1 hour ago',
      unread: true
    },
    {
      from: 'Emma Davis',
      subject: 'Meeting Reschedule',
      preview: 'I need to reschedule our meeting tomorrow due to a conflict...',
      time: '3 hours ago',
      unread: false
    },
    {
      from: 'Alex Johnson',
      subject: 'Design Feedback',
      preview:
        "I've reviewed the latest designs and have some feedback to share...",
      time: 'Yesterday',
      unread: false
    },
    {
      from: 'Lisa Park',
      subject: 'Welcome to the team!',
      preview: "Welcome aboard! We're excited to have you join our team...",
      time: '2 days ago',
      unread: false
    }
  ];

  import { chatOverview } from '$lib/stores/chat';
  import { page } from '$app/stores';
  import { createBrowserClient } from '@supabase/ssr';
  import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL
  } from '$env/static/public';
  import { formatRelative } from 'date-fns';

  // Helper to get group avatar url (copied from ChatSidebar)
  const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );
  $: orgId = $page.params.orgId;
  function getGroupAvatarUrl(gid: string, avatar_type: string) {
    if (avatar_type !== 'svg' && avatar_type !== 'webp') return null;
    return supabase.storage
      .from('avatars')
      .getPublicUrl(`/org/${orgId}/group/${gid}.${avatar_type}`).data.publicUrl;
  }

  // Use chatOverview store for recent chats
  // Use .name, get avatar like ChatSidebar, and use latest message logic
  $: recentChats =
    $chatOverview?.data?.map(chat => ({
      id: chat.id,
      name: chat.name,
      data: chat.data,
      typ: chat.typ,
      time: chat.msg_created_at
        ? formatRelative(
            new Date(chat.msg_edited_at || chat.msg_created_at),
            new Date()
          )
        : '',
      is_group: chat.is_group,
      // todo: online
      online: true,
      avatar: chat.is_group
        ? getGroupAvatarUrl(chat.id, chat.avatar_url)
        : chat.avatar_url,
      // TODO: unread count
      unread: 2
    })) ?? [];

  let searchQuery = '';
</script>

<div class="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
  <!-- Header -->
  <div class="space-y-4 text-center">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
      Good {new Date().getHours() < 12
        ? 'morning'
        : new Date().getHours() < 18
          ? 'afternoon'
          : 'evening'}, <span class="text-nowrap">{user.name}</span>!
    </h1>
  </div>

  <!-- Recent Activity Grid -->
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
    <!-- Recent Emails -->
    <div class="space-y-4">
      <div class="flex items-center space-x-2">
        <Mail class="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Latest emails
        </h2>
      </div>
      <div class="glass dark:glass-dark relative space-y-4 rounded-2xl p-6">
        <div
          class="absolute left-0 top-0 z-20 h-full w-full rounded-2xl bg-gray-200/20 backdrop-blur dark:bg-gray-800/20"
        ></div>
        <div
          class="absolute z-30 mb-6 flex justify-center"
          style="left: 50%; top: 50%; transform: translate(-50%, -50%);"
        >
          <div
            class="glass dark:glass-dark rounded-2xl bg-white/40 px-8 py-4 text-center shadow-lg backdrop-blur-md dark:bg-gray-900/40"
          >
            <span class="text-lg font-semibold text-gray-900 dark:text-white"
              >Coming Soon</span
            >
          </div>
        </div>
        {#each recentEmails as email}
          <div
            class="flex cursor-pointer items-start space-x-4 rounded-xl p-3 transition-all duration-200 hover:bg-white/20 dark:hover:bg-gray-800/20"
          >
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <span class="text-sm font-semibold text-white"
                >{email.from.charAt(0)}</span
              >
            </div>
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center justify-between">
                <h4
                  class="truncate text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {email.from}
                </h4>
                <span
                  class="ml-2 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400"
                  >{email.time}</span
                >
              </div>
              <h5
                class="mb-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200 {email.unread
                  ? 'font-bold'
                  : ''}"
              >
                {email.subject}
              </h5>
              <p class="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {email.preview}
              </p>
            </div>
            {#if email.unread}
              <div class="h-2 w-2 flex-shrink-0 rounded-full bg-purple-500"></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Recent Chats -->
    <div class="space-y-4">
      <div class="flex items-center space-x-2">
        <MessageCircle class="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Recent chats
        </h2>
      </div>
      <div class="glass dark:glass-dark space-y-4 rounded-2xl p-6">
        {#if recentChats.length === 0}
          <p class="text-center text-lg text-muted-foreground m-4"><em>You don't have any chats</em></p>
        {:else}
        {#each recentChats as chat}
          <Button
            variant="ghost"
            href="/app/{orgId}/chat/{chat.is_group ? '-' : '@'}{chat.id}"
            class="flex cursor-pointer items-center gap-4 rounded-xl p-3 !py-8 transition-all duration-200 hover:bg-gray-200/50 dark:hover:bg-gray-900/50"
          >
            <div class="relative">
              {#if chat.avatar}
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  class="h-10 w-10 rounded-full border border-gray-400 dark:border-gray-700"
                />
              {:else}
                <div
                  class="glass dark:glass-dark flex h-10 w-10 items-center justify-center rounded-full border border-gray-400 text-lg uppercase shadow-none dark:border-gray-700"
                >
                  {chat.name.charAt(0)}
                </div>
              {/if}
              {#if chat.is_group}
                <div
                  class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-blue-500 text-xs font-bold text-white dark:border-gray-800"
                >
                  <Users class="h-3 w-3" />
                </div>
              {:else if chat.online}
                <div
                  class="dark:border-gray-1000 absolute -bottom-1 -right-1 h-4 w-4 rounded-full border border-gray-200 bg-green-400 dark:border-gray-800"
                ></div>
              {/if}
            </div>
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center justify-between">
                <h4
                  class="truncate text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {chat.name}
                </h4>
                <span
                  class="ml-2 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400"
                  >{chat.time}</span
                >
              </div>
              <!-- TODO: typing -->
              {#if false}
                <span class="text-green-500">Typing...</span>
              {:else if !chat.typ}
                <em class="text-muted-foreground">No message yet</em>
              {:else if chat.typ === 'text'}
                {chat.data}
              {:else if chat.typ === 'attachment'}
                TODO: attachment
              {:else if chat.typ === 'voice'}
                TODO: voice message
              {/if}
            </div>
          </Button>
        {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
