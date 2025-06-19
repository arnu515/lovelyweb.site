<script lang="ts">
  import {
    Search,
    Clock,
    Mail,
    MessageCircle,
    FileText,
    Calendar,
    CheckSquare,
    Kanban,
    User
  } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';

  export let user: any;

  // Mock data for recently viewed places
  const recentlyViewed = [
    {
      name: 'Project Planning',
      type: 'kanban',
      icon: Kanban,
      lastViewed: '2 hours ago',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Meeting Notes',
      type: 'notes',
      icon: FileText,
      lastViewed: 'Yesterday',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      name: 'Weekly Tasks',
      type: 'tasks',
      icon: CheckSquare,
      lastViewed: '2 days ago',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Team Calendar',
      type: 'calendar',
      icon: Calendar,
      lastViewed: '3 days ago',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Client Emails',
      type: 'email',
      icon: Mail,
      lastViewed: '1 week ago',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

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

  // Mock data for recent chats
  const recentChats = [
    {
      name: 'Sarah Wilson',
      message: 'Thanks for the update!',
      time: '5 min ago',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      unread: 2
    },
    {
      name: 'Design Team',
      message: 'Mike: The mockups look great',
      time: '1 hour ago',
      avatar:
        'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      unread: 0
    },
    {
      name: 'Emma Davis',
      message: "Let's sync up tomorrow",
      time: '2 hours ago',
      avatar:
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      unread: 0
    },
    {
      name: 'Project Alpha',
      message: 'Alex: Deployment successful',
      time: 'Yesterday',
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      unread: 1
    },
    {
      name: 'Lisa Park',
      message: 'Welcome to the team! 🎉',
      time: '2 days ago',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
      unread: 0
    }
  ];

  let searchQuery = '';
</script>

<div class="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
  <!-- Header -->
  <div class="space-y-4 text-center">
    <div class="mb-4 flex items-center justify-center space-x-3">
      <div
        class="gradient-primary flex h-12 w-12 items-center justify-center rounded-full"
      >
        <span class="text-lg font-bold text-white"
          >{user?.name?.charAt(0) || 'U'}</span
        >
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Good {new Date().getHours() < 12
          ? 'morning'
          : new Date().getHours() < 18
            ? 'afternoon'
            : 'evening'}, {user?.name || 'User'}!
      </h1>
    </div>
  </div>

  <!-- Search Bar -->
  <div class="mx-auto max-w-4xl">
    <div class="relative">
      <Search
        class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 md:left-6 md:h-6 md:w-6"
      />
      <Input
        bind:value={searchQuery}
        placeholder="Ask or find anything from your workspace..."
        class="glass dark:glass-dark w-full rounded-xl border-white/30 py-4 pl-12 pr-4 text-base shadow-xl transition-all duration-200 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/50 dark:border-gray-700/50 md:py-6 md:pl-16 md:pr-6 md:text-lg"
      />
    </div>
  </div>

  <!-- Recently Viewed -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2">
      <Clock class="h-5 w-5 text-gray-500 dark:text-gray-400" />
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Recently viewed
      </h2>
    </div>
    <div
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {#each recentlyViewed as item}
        <Button
          variant="ghost"
          class="h-auto p-0 transition-all duration-200 hover:scale-105"
        >
          <div
            class="glass dark:glass-dark w-full rounded-xl p-6 text-left transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-800/30"
          >
            <div
              class="h-12 w-12 rounded-xl bg-gradient-to-r {item.gradient} mb-4 flex items-center justify-center"
            >
              <svelte:component this={item.icon} class="h-6 w-6 text-white" />
            </div>
            <h3 class="mb-1 font-semibold text-gray-900 dark:text-white">
              {item.name}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {item.lastViewed}
            </p>
          </div>
        </Button>
      {/each}
    </div>
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
      <div class="glass dark:glass-dark space-y-4 rounded-2xl p-6">
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
        {#each recentChats as chat}
          <div
            class="flex cursor-pointer items-center space-x-4 rounded-xl p-3 transition-all duration-200 hover:bg-white/20 dark:hover:bg-gray-800/20"
          >
            <div class="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                class="h-10 w-10 rounded-full"
              />
              {#if chat.unread > 0}
                <div
                  class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white"
                >
                  {chat.unread}
                </div>
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
              <p
                class="truncate text-sm text-gray-600 dark:text-gray-400 {chat.unread >
                0
                  ? 'font-medium'
                  : ''}"
              >
                {chat.message}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
