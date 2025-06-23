<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { 
    Send, 
    Paperclip, 
    Mic, 
    Phone, 
    Video, 
    MoreVertical,
    Smile,
    Image as ImageIcon,
    FileText,
    Sparkles,
    Volume2,
    Edit3
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { page } from '$app/stores';

  export let data;

  let messageInput = '';
  let messagesContainer: HTMLElement;
  let fileInput: HTMLInputElement;

  // Mock chat data
  const currentChat = {
    id: $page.params.chatId,
    name: 'Sarah Wilson',
    type: 'direct',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    isOnline: true,
    lastSeen: 'Active now'
  };

  const messages = [
    {
      id: '1',
      senderId: 'other',
      senderName: 'Sarah Wilson',
      content: 'Hey! How are you doing?',
      timestamp: new Date('2024-01-15T09:00:00'),
      type: 'text',
      status: 'delivered'
    },
    {
      id: '2',
      senderId: 'me',
      senderName: 'You',
      content: "I'm doing great! Just working on the new project.",
      timestamp: new Date('2024-01-15T09:02:00'),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: 'other',
      senderName: 'Sarah Wilson',
      content: 'That sounds exciting! Can you share some details?',
      timestamp: new Date('2024-01-15T09:05:00'),
      type: 'text',
      status: 'delivered'
    },
    {
      id: '4',
      senderId: 'me',
      senderName: 'You',
      content: 'Sure! It\'s a new communication platform with AI features.',
      timestamp: new Date('2024-01-15T09:07:00'),
      type: 'text',
      status: 'read'
    },
    {
      id: '5',
      senderId: 'other',
      senderName: 'Sarah Wilson',
      content: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      timestamp: new Date('2024-01-15T09:10:00'),
      type: 'image',
      status: 'delivered'
    },
    {
      id: '6',
      senderId: 'me',
      senderName: 'You',
      content: 'Nice! That looks really professional.',
      timestamp: new Date('2024-01-15T09:12:00'),
      type: 'text',
      status: 'read'
    }
  ];

  function formatMessageTime(date: Date) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  function formatDateHeader(date: Date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  }

  function shouldShowDateHeader(currentMsg: any, prevMsg: any) {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  }

  function sendMessage() {
    if (!messageInput.trim()) return;
    
    // Here you would send the message to your backend
    console.log('Sending message:', messageInput);
    messageInput = '';
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleFileUpload() {
    fileInput.click();
  }

  function handleFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      // Handle file upload
      console.log('Files selected:', files);
    }
  }

  afterUpdate(() => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
</script>

<svelte:head>
  <title>{currentChat.name} - Chat - lovelyweb.site</title>
</svelte:head>

<div class="flex h-full flex-col">
  <!-- Chat Header -->
  <div class="glass dark:glass-dark border-b border-white/20 p-4 dark:border-gray-700/50">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <img
            src={currentChat.avatar}
            alt={currentChat.name}
            class="h-10 w-10 rounded-full"
          />
          {#if currentChat.isOnline}
            <div class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-400 dark:border-gray-800"></div>
          {/if}
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {currentChat.name}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {currentChat.lastSeen}
          </p>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <Button variant="ghost" size="icon" class="h-9 w-9">
          <Phone class="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" class="h-9 w-9">
          <Video class="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" class="h-9 w-9">
          <MoreVertical class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>

  <!-- Messages -->
  <div 
    bind:this={messagesContainer}
    class="flex-1 overflow-y-auto p-4 space-y-4"
  >
    {#each messages as message, index}
      <!-- Date Header -->
      {#if shouldShowDateHeader(message, messages[index - 1])}
        <div class="flex justify-center">
          <div class="glass dark:glass-dark rounded-full px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
            {formatDateHeader(message.timestamp)}
          </div>
        </div>
      {/if}

      <!-- Message -->
      <div class={cn(
        'flex',
        message.senderId === 'me' ? 'justify-end' : 'justify-start'
      )}>
        <div class={cn(
          'max-w-xs lg:max-w-md xl:max-w-lg',
          message.senderId === 'me' ? 'order-2' : 'order-1'
        )}>
          <div class={cn(
            'rounded-2xl px-4 py-2 shadow-sm',
            message.senderId === 'me'
              ? 'gradient-primary text-white'
              : 'glass dark:glass-dark text-gray-900 dark:text-white'
          )}>
            {#if message.type === 'text'}
              <p class="text-sm leading-relaxed">{message.content}</p>
            {:else if message.type === 'image'}
              <img 
                src={message.content} 
                alt="Shared image"
                class="rounded-lg max-w-full h-auto"
              />
            {/if}
          </div>
          <div class={cn(
            'mt-1 flex items-center space-x-1 text-xs text-gray-500',
            message.senderId === 'me' ? 'justify-end' : 'justify-start'
          )}>
            <span>{formatMessageTime(message.timestamp)}</span>
            {#if message.senderId === 'me'}
              <span class={cn(
                'text-xs',
                message.status === 'read' ? 'text-blue-500' : 'text-gray-400'
              )}>
                {message.status === 'read' ? '✓✓' : '✓'}
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Message Input -->
  <div class="glass dark:glass-dark border-t border-white/20 p-4 dark:border-gray-700/50">
    <div class="flex items-end space-x-2">
      <!-- Attachment Button -->
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-10 w-10 flex-shrink-0"
        on:click={handleFileUpload}
      >
        <Paperclip class="h-4 w-4" />
      </Button>

      <!-- Message Input -->
      <div class="flex-1">
        <div class="glass dark:glass-dark relative rounded-2xl border border-white/30 dark:border-gray-700/50">
          <Input
            bind:value={messageInput}
            placeholder="Type a message..."
            class="border-0 bg-transparent pr-12 focus:ring-0"
            on:keypress={handleKeyPress}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            class="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          >
            <Smile class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- AI Dropdown -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button 
            builders={[builder]}
            variant="ghost" 
            size="icon" 
            class="h-10 w-10 flex-shrink-0 gradient-primary text-white"
          >
            <Sparkles class="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="glass dark:glass-dark border-white/20 dark:border-gray-700/50">
          <DropdownMenu.Item class="gap-2">
            <ImageIcon class="h-4 w-4" />
            Generate an Image
          </DropdownMenu.Item>
          <DropdownMenu.Item class="gap-2">
            <Edit3 class="h-4 w-4" />
            Refine Message
          </DropdownMenu.Item>
          <DropdownMenu.Item class="gap-2">
            <Volume2 class="h-4 w-4" />
            Send as Audio Message
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <!-- Send/Mic Button -->
      {#if messageInput.trim()}
        <Button 
          class="gradient-primary h-10 w-10 flex-shrink-0 text-white"
          size="icon"
          on:click={sendMessage}
        >
          <Send class="h-4 w-4" />
        </Button>
      {:else}
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-10 w-10 flex-shrink-0"
        >
          <Mic class="h-4 w-4" />
        </Button>
      {/if}
    </div>
  </div>
</div>

<!-- Hidden file input -->
<input
  bind:this={fileInput}
  type="file"
  multiple
  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
  class="hidden"
  on:change={handleFileSelected}
/>