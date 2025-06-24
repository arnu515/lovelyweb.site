<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { MessageCircle, Users, Plus } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Chat - lovelyweb.site</title>
</svelte:head>

<div class="hidden h-full items-center justify-center p-8 md:flex">
  <div class="text-center">
    <div class="glass dark:glass-dark mx-auto max-w-md rounded-2xl p-8">
      <div
        class="gradient-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
      >
        <MessageCircle class="h-8 w-8 text-white" />
      </div>
      <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        Welcome to Chat
      </h2>
      <p class="mb-6 text-gray-600 dark:text-gray-300">
        Select a conversation from the sidebar to start messaging, or create a new
        chat.
      </p>
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          href="./chat/new?mode=cht"
          class="gradient-primary gap-2 text-white"
        >
          <Plus class="h-4 w-4" />
          New Chat
        </Button>
        <Button href="./chat/new?mode=grp" variant="outline" class="gap-2">
          <Users class="h-4 w-4" />
          Create Group
        </Button>
      </div>
    </div>
  </div>
</div>
