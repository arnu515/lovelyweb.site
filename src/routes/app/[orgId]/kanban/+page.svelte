<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Label } from '$lib/components/ui/label';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as ContextMenu from '$lib/components/ui/context-menu';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Badge } from '$lib/components/ui/badge';
  import {
    Plus,
    MoreVertical,
    Settings,
    Trash2,
    Move,
    Sparkles,
    FileEdit as Edit,
    UserPlus,
    UserMinus,
    Calendar,
    Kanban,
    ChevronsUpDown,
    RefreshCw
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import * as Switch from '$lib/components/ui/switch';
  import { kanban, type Card, type Member } from '$lib/stores/kanban';
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/stores';
  import * as Skeleton from '$lib/components/ui/skeleton';
  import { captureException } from '@sentry/sveltekit';
  import { createBrowserClient } from '@supabase/ssr';
  import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  } from '$env/static/public';
  import type { Database } from '$lib/database.types.js';
  import * as realtime from '$lib/realtime';
  import { get } from 'svelte/store';

  export let data;

  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  let activeBoard = '';
  let realtimeSubscriptions: Record<string, (() => unknown) | undefined> = {};
  let draggedCard: Card | null = null;
  let draggedFromCategory: string | null = null;

  // Dialog states
  let showNewBoardDialog = false;
  let showNewCategoryDialog = false;
  let showNewCardDialog = false;
  let showCardDetailDialog = false;
  let showBoardSettingsDialog = false;

  // Add Member state for board settings
  let memberSearchQuery = '';
  let memberSearchResults: (Member & { username: string })[] = [];
  let memberIds: Set<string> = new Set();
  let allOrgUsersError: string = '';
  let allOrgUsers: (Member & { username: string })[] = [];

  // Form states
  let newBoardForm = { name: '', useOnboardingTemplate: true };
  let newCategoryForm = { name: '', color: '#eab306' };
  let newCardForm = {
    title: '',
    description: '',
    categoryId: '',
    priority: 'none',
    dueDate: '',
    tags: ''
  };
  let selectedCard: (Card & { tags: string }) | null = null;
  let selectedCategoryForNewCard = '';

  // Available colors for categories
  const categoryColors = [
    '#64748b',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#0ea5e9',
    '#6366f1',
    '#a855f7',
    '#d946ef'
  ];

  let loading = {
    all: true,
    createBoard: false,
    deleteBoard: false,
    createCategory: false,
    deleteCategory: false,
    createCard: false,
    updateCard: false,
    moveCardToBoard: false,
    deleteCard: false,
    addMember: false,
    removeMember: false
  };
  $: orgId = $page.params.orgId;
  $: error = $kanban?.error ?? null;
  $: currentBoard = $kanban.boards[activeBoard];

  onMount(() => {
    fetchAllOrgUsers();
    const { boards } = get(kanban);
    activeBoard = Object.keys(boards)[0] ?? null;
    if (activeBoard) {
      loading.all = false;
      Object.keys(boards).forEach(k => {
        realtimeSubscriptions[k] = realtime.kanbanBoard(k);
      });
      return;
    }
    loading.all = true;
    kanban.fetchAll(orgId).then(() => {
      const { boards } = get(kanban);
      if (!activeBoard) activeBoard = Object.keys(boards)[0] ?? null;
      Object.keys(boards).forEach(k => {
        realtimeSubscriptions[k] = realtime.kanbanBoard(k);
      });
      memberIds = new Set(boards[activeBoard].members.map(u => u.id));
      loading.all = false;
    });
  });

  onDestroy(() => {
    Object.values(realtimeSubscriptions).forEach(i => i?.());
    realtimeSubscriptions = {};
  });

  async function fetchAllOrgUsers() {
    const { data: users, error } = await supabase
      .from('organisations_users')
      .select('users (id, name, username, avatar_url)')
      .eq('organisation_id', orgId);
    if (error) {
      captureException(error, { tags: { supabase: 'organisations_users' } });
      allOrgUsersError = error.message;
    } else {
      allOrgUsers = users.map(u => u.users);
    }
  }

  $: if (memberSearchQuery.trim()) {
    const q = memberSearchQuery.trim().toLowerCase();
    memberSearchResults = allOrgUsers.filter(
      u =>
        (u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)) &&
        !memberIds.has(u.id)
    );
  } else {
    memberSearchResults = [];
  }

  async function handleAddBoardMember(userId: string) {
    loading.addMember = true;
    if (await kanban.addMember(currentBoard.id, userId)) memberIds.add(userId);
    loading.addMember = false;
    memberSearchQuery = '';
    memberSearchResults = [];
  }

  async function handleRemoveBoardMember(userId: string) {
    loading.removeMember = true;
    if (await kanban.removeMember(currentBoard.id, userId))
      memberIds.delete(userId);
    loading.removeMember = false;
  }

  function handleDragStart(event: DragEvent, card: any, categoryId: string) {
    if (event.dataTransfer) {
      draggedCard = card;
      draggedFromCategory = categoryId;
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDrop(event: DragEvent, targetCategoryId: string) {
    event.preventDefault();
    if (
      draggedCard &&
      draggedFromCategory &&
      draggedFromCategory !== targetCategoryId
    ) {
      moveCard(draggedCard.id, draggedFromCategory, targetCategoryId);
    }
    draggedCard = null;
    draggedFromCategory = null;
  }

  // Move card between categories
  async function moveCard(
    cardId: string,
    fromCategoryId: string,
    toCategoryId: string
  ) {
    if (!currentBoard) return;
    const newCat = $kanban.boards[activeBoard].categories.find(
      c => c.id === toCategoryId
    );
    if (!newCat) return;
    await kanban.updateCard(
      cardId,
      fromCategoryId,
      activeBoard,
      data.auth.user.id,
      {
        position: newCat.cards.length,
        category_id: newCat.id
      }
    );
  }

  async function createBoard() {
    if (!newBoardForm.name.trim()) return;
    loading.createBoard = true;
    await kanban.createBoard({
      name: newBoardForm.name,
      owner_id: data.auth.user.id,
      useOnboardingTemplate: newBoardForm.useOnboardingTemplate
    });
    loading.createBoard = false;
    showNewBoardDialog = false;
    newBoardForm = { name: '', useOnboardingTemplate: true };
  }

  async function createCategory() {
    if (!newCategoryForm.name.trim() || !currentBoard) return;
    loading.createCategory = true;
    await kanban.createCategory({
      board_id: currentBoard.id,
      name: newCategoryForm.name,
      color: newCategoryForm.color
    });
    loading.createCategory = false;
    showNewCategoryDialog = false;
    newCategoryForm = { name: '', color: '#eab308' };
  }

  async function createCard() {
    if (!newCardForm.title.trim() || !selectedCategoryForNewCard || !currentBoard)
      return;
    loading.createCard = true;
    await kanban.createCard({
      board_id: currentBoard.id,
      category_id: selectedCategoryForNewCard,
      title: newCardForm.title,
      description: newCardForm.description,
      priority: ['low', 'medium', 'high'].includes(newCardForm.priority)
        ? (newCardForm.priority as any)
        : null,
      due_date: newCardForm.dueDate || undefined,
      tags: newCardForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      created_by: data.auth.user.id
    });
    loading.createCard = false;
    showNewCardDialog = false;
    newCardForm = {
      title: '',
      description: '',
      categoryId: '',
      priority: 'medium',
      dueDate: '',
      tags: ''
    };
    selectedCategoryForNewCard = '';
  }

  async function deleteCard(cardId: string, categoryId: string) {
    if (!activeBoard) return;
    loading.deleteCard = true;
    await kanban.deleteCard(cardId);
    loading.deleteCard = false;
  }

  async function deleteCategory(categoryId: string) {
    if (!activeBoard) return;
    loading.deleteCategory = true;
    await kanban.deleteCategory(categoryId, activeBoard);
    loading.deleteCategory = false;
  }

  async function deleteBoard(boardId: string) {
    loading.deleteBoard = true;
    await kanban.deleteBoard(boardId);
    loading.deleteBoard = false;
  }

  function openCardDetail(card: any) {
    selectedCard = { ...card, tags: card.tags.join(',') };
    showCardDetailDialog = true;
  }

  async function saveCardDetail() {
    if (!selectedCard || !activeBoard) return;
    loading.updateCard = true;
    await kanban.updateCard(
      selectedCard.id,
      selectedCard.category_id,
      activeBoard,
      data.auth.user.id,
      {
        title: selectedCard.title,
        description: selectedCard.description,
        priority: ['low', 'medium', 'high'].includes(selectedCard.priority as any)
          ? (selectedCard.priority as any)
          : null,
        due_date: selectedCard.due_date || null,
        tags: selectedCard.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      }
    );
    loading.updateCard = false;
    showCardDetailDialog = false;
  }

  function getPriorityColor(priority: string | null | undefined) {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  function refineCardWithAI(card: any) {
    toast.info(`AI refinement for "${card.title}" - Feature coming soon!`);
    console.log('AI refine card:', card);
  }

  async function moveCardToBoard(card: any, targetBoardId: string) {
    loading.moveCardToBoard = true;
    const board = await kanban.fetchBoard(targetBoardId);
    if (!board) return;
    if (!board.categories.length) {
      toast.error('Could not move card', {
        description: 'This board does not have any categories.'
      });
      return;
    }
    await kanban.updateCard(
      card.id,
      card.category_id,
      targetBoardId,
      data.auth.user.id,
      {
        board_id: board.id,
        category_id: board.categories[0].id,
        position: board.categories[0].cards.length
      }
    );
    loading.moveCardToBoard = false;
  }
</script>

<svelte:head>
  <title>Kanban Board - lovelyweb.site</title>
</svelte:head>

<div class="flex h-[calc(100vh-64px)] flex-col overflow-hidden md:h-screen">
  <!-- Header -->
  <div
    class="glass dark:glass-dark border-b border-white/20 p-4 dark:border-gray-700/50"
  >
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <h1
          class="hidden text-2xl font-bold text-gray-900 dark:text-white sm:block"
        >
          Lovely Kanban
        </h1>

        {#if activeBoard}
          <div class="relative">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                class={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'glass dark:glass-dark h-auto max-w-64 gap-2 truncate border border-gray-200/50 p-2 shadow-sm transition-all duration-200 hover:bg-white/20 dark:border-gray-800/50 dark:hover:bg-gray-800/50'
                )}
              >
                <Kanban class="h-4 w-4" />
                <span class="max-w-48 truncate text-sm font-medium">
                  {currentBoard ? currentBoard.name : 'Select Board'}
                </span>
                <ChevronsUpDown
                  class="ml-auto h-4 w-4 text-gray-500 dark:text-gray-400"
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                class="glass dark:glass-dark z-50 max-w-[90%] overflow-hidden rounded-lg border border-gray-200/50 shadow-xl dark:border-gray-800/50"
              >
                <div class="flex flex-col gap-1 p-1">
                  {#each Object.values($kanban.boards) as board (board.id)}
                    <DropdownMenu.Item
                      on:click={() => (activeBoard = board.id)}
                      class="flex h-12 w-full items-center justify-between gap-3 rounded-md p-2 text-left text-sm hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                    >
                      <span class="text-sm font-medium">{board.name}</span>
                      {#if board.id === activeBoard}
                        <span class="h-4 w-4 text-purple-500">✓</span>
                      {/if}
                    </DropdownMenu.Item>
                  {/each}
                </div>
                <div
                  class="border-t border-gray-200/50 p-1 dark:border-gray-700/50"
                >
                  <DropdownMenu.Item
                    on:click={() => (showNewBoardDialog = true)}
                    class="flex h-9 w-full items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                  >
                    <Plus class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span class="text-sm font-medium">New Board</span>
                  </DropdownMenu.Item>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        {/if}
      </div>

      {#if currentBoard}
        <Button
          variant="ghost"
          size="sm"
          on:click={() => {
            loading.all = true;
            kanban.fetchAll(orgId).then(() => {
              if (!$kanban.boards[activeBoard])
                activeBoard = Object.keys($kanban.boards)[0];
              if (activeBoard)
                memberIds = new Set(
                  $kanban.boards[activeBoard].members.map(u => u.id)
                );
              loading.all = false;
            });
            fetchAllOrgUsers();
          }}
          class="ml-auto gap-2 hover:bg-white/20 dark:hover:bg-gray-700/60"
        >
          <RefreshCw class="h-4 w-4" />
          <span class="hidden sm:inline">Refresh</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          on:click={() => (showNewCategoryDialog = true)}
          class="gap-2 hover:bg-white/20 dark:hover:bg-gray-700/60"
        >
          <Plus class="h-4 w-4" />
          <span class="hidden sm:inline">Add Category</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          on:click={() => (showBoardSettingsDialog = true)}
          class="h-9 w-9 hover:bg-white/20 dark:hover:bg-gray-700/60"
        >
          <Settings class="h-4 w-4" />
        </Button>
      {/if}
    </div>
  </div>

  <!-- Board Content -->
  <div class="flex-1 overflow-hidden">
    {#if loading.all}
      <div class="flex h-full space-x-4 overflow-x-auto p-2 sm:p-4">
        {#each Array(3) as _}
          <div
            class="flex w-full min-w-80 max-w-xs flex-col sm:min-w-80 sm:max-w-xs"
          >
            <Skeleton.Skeleton class="mb-4 h-16 rounded-lg" />
            <div
              class="flex-1 space-y-3 overflow-y-auto rounded-lg bg-gray-100/50 p-3 dark:bg-gray-800/50"
            >
              {#each Array(2) as _}
                <Skeleton.Skeleton class="h-20 rounded-lg" />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else if currentBoard}
      <div class="flex h-full space-x-4 overflow-x-auto p-2 sm:p-4">
        {#each currentBoard.categories as category (category.id)}
          <div
            class="flex w-full min-w-80 max-w-xs flex-col sm:min-w-80 sm:max-w-xs"
          >
            <!-- Category Header -->
            <div class="glass dark:glass-dark mb-4 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div
                    class="h-3 w-3 rounded-full"
                    style="background-color: {category.color}"
                  ></div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <Badge variant="secondary" class="text-xs">
                    {category.cards.length}
                  </Badge>
                </div>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 hover:bg-white/20 dark:hover:bg-gray-700/60"
                    >
                      <MoreVertical class="h-3 w-3" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    class="glass dark:glass-dark z-50 overflow-hidden rounded-lg border border-gray-200/50 shadow-xl dark:border-gray-800/50"
                  >
                    <div class="p-1">
                      <DropdownMenu.Item
                        class="flex h-9 w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                        on:click={() => {
                          selectedCategoryForNewCard = category.id;
                          showNewCardDialog = true;
                        }}
                      >
                        <Plus class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span class="text-sm font-medium">Add Card</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        class="flex h-9 w-full items-center gap-2 rounded-md p-2 text-left text-sm text-red-600 hover:bg-gray-200/60 dark:text-red-400 dark:hover:bg-gray-700/60"
                        on:click={() => deleteCategory(category.id)}
                        disabled={loading.deleteCategory}
                      >
                        {#if loading.deleteCategory}
                          <span class="mr-2 animate-spin"
                            ><svg
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 24 24"
                              ><circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                                opacity="0.25"
                              /><path
                                d="M22 12a10 10 0 0 1-10 10"
                                stroke="currentColor"
                                stroke-width="4"
                                stroke-linecap="round"
                              /></svg
                            ></span
                          >
                        {/if}
                        <Trash2 class="h-4 w-4" />
                        <span class="text-sm font-medium">Delete Category</span>
                      </DropdownMenu.Item>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            </div>

            <!-- Cards Container -->
            <div
              class="flex-1 space-y-3 overflow-y-auto rounded-lg bg-gray-100/50 p-3 dark:bg-gray-800/50"
              role="list"
              on:dragover={handleDragOver}
              on:drop={e => handleDrop(e, category.id)}
            >
              {#each category.cards as card (card.id)}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <div
                      class="glass dark:glass-dark cursor-pointer rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                      draggable={true}
                      role="listitem"
                      on:dragstart={e => handleDragStart(e, card, category.id)}
                    >
                      <!-- Card Title & Priority -->
                      <div class="mb-2 flex items-start justify-between">
                        <h4 class="font-medium text-gray-900 dark:text-white">
                          {card.title}
                        </h4>
                        <div
                          title="Priority: {card.priority}"
                          class="h-2 w-2 rounded-full {getPriorityColor(
                            card.priority
                          )}"
                        ></div>
                      </div>

                      <!-- Card Description -->
                      {#if card.description}
                        <p
                          class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          {card.description}
                        </p>
                      {/if}

                      <!-- Card Tags -->
                      {#if card.tags.length > 0}
                        <div class="mb-3 flex flex-wrap gap-1">
                          {#each card.tags.slice(0, 3) as tag}
                            <Badge variant="secondary" class="text-xs">
                              {tag}
                            </Badge>
                          {/each}
                          {#if card.tags.length > 3}
                            <Badge variant="outline" class="text-xs">
                              +{card.tags.length - 3}
                            </Badge>
                          {/if}
                        </div>
                      {/if}

                      <!-- Card Footer -->
                      <div class="flex items-center justify-end">
                        <!-- Due Date -->
                        {#if card.due_date}
                          <div
                            class="flex items-center text-xs text-gray-500 dark:text-gray-400"
                          >
                            <Calendar class="mr-1 h-3 w-3" />
                            Due: {formatDate(card.due_date)}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </ContextMenu.Trigger>

                  <ContextMenu.Content
                    class="glass dark:glass-dark rounded-lg border border-gray-200/50 shadow-xl dark:border-gray-800/50"
                  >
                    <ContextMenu.Item
                      class="flex h-9 w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                      on:click={() => openCardDetail(card)}
                    >
                      <Edit class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span class="text-sm font-medium">Edit Card</span>
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      class="flex h-9 w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                      on:click={() => refineCardWithAI(card)}
                    >
                      <Sparkles class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span class="text-sm font-medium">Refine with AI</span>
                    </ContextMenu.Item>
                    <ContextMenu.Separator
                      class="my-1 border-gray-200 dark:border-gray-700"
                    />
                    <ContextMenu.Sub>
                      <ContextMenu.SubTrigger
                        class="flex h-9 w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                      >
                        <Move class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span class="text-sm font-medium">Move to Board</span>
                      </ContextMenu.SubTrigger>
                      <ContextMenu.SubContent
                        class="glass dark:glass-dark w-48 rounded-lg border border-gray-200/50 shadow-xl dark:border-gray-800/50"
                      >
                        {#each Object.values($kanban.boards).filter(b => b.id !== activeBoard) as board}
                          <ContextMenu.Item
                            class="flex h-9 w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                            on:click={() => moveCardToBoard(card, board.id)}
                            disabled={loading.moveCardToBoard}
                          >
                            {#if loading.moveCardToBoard}
                              <span class="mr-2 animate-spin"
                                ><svg
                                  width="16"
                                  height="16"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  ><circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                    opacity="0.25"
                                  /><path
                                    d="M22 12a10 10 0 0 1-10 10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                    stroke-linecap="round"
                                  /></svg
                                ></span
                              >
                            {/if}
                            <span class="truncate text-sm font-medium"
                              >{board.name}</span
                            >
                          </ContextMenu.Item>
                        {/each}
                      </ContextMenu.SubContent>
                    </ContextMenu.Sub>
                    <ContextMenu.Separator
                      class="my-1 border-gray-200 dark:border-gray-700"
                    />
                    <ContextMenu.Item
                      class="flex h-9 w-full items-center gap-2 rounded-md p-2 text-left text-sm text-red-600 hover:bg-gray-200/60 dark:text-red-400 dark:hover:bg-gray-700/60"
                      on:click={() => deleteCard(card.id, category.id)}
                      disabled={loading.deleteCard}
                    >
                      {#if loading.deleteCard}
                        <span class="mr-2 animate-spin"
                          ><svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            ><circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="4"
                              opacity="0.25"
                            /><path
                              d="M22 12a10 10 0 0 1-10 10"
                              stroke="currentColor"
                              stroke-width="4"
                              stroke-linecap="round"
                            /></svg
                          ></span
                        >
                      {/if}
                      <Trash2 class="h-4 w-4" />
                      <span class="text-sm font-medium">Delete Card</span>
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              {/each}

              <!-- Add Card Button -->
              <Button
                variant="ghost"
                class="glass dark:glass-dark w-full justify-center border border-dashed border-gray-300 p-2 hover:bg-white/20 dark:border-gray-700 dark:hover:bg-gray-800/50"
                on:click={() => {
                  selectedCategoryForNewCard = category.id;
                  showNewCardDialog = true;
                }}
              >
                <Plus class="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </div>
          </div>
        {/each}

        <div class="flex w-full min-w-80 max-w-xs flex-col sm:min-w-80 sm:max-w-xs">
          <Button
            variant="ghost"
            class="glass dark:glass-dark h-full border-2 border-dashed border-gray-300 hover:bg-white/20 dark:border-gray-600 dark:hover:bg-gray-800/50"
            on:click={() => (showNewCategoryDialog = true)}
          >
            <Plus class="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>
    {:else}
      <div class="flex h-full items-center justify-center">
        <div class="text-center">
          <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            No Boards Found
          </h2>
          <p class="mb-6 text-gray-600 dark:text-gray-300">
            Create your first board to get started with Kanban
          </p>
          <Button
            on:click={() => (showNewBoardDialog = true)}
            class="gradient-primary gap-2 text-white"
          >
            <Plus class="h-4 w-4" />
            Create Board
          </Button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- New Board Dialog -->
<Dialog.Root bind:open={showNewBoardDialog}>
  <Dialog.Content class="glass dark:glass-dark">
    <Dialog.Header>
      <Dialog.Title>Create New Board</Dialog.Title>
      <Dialog.Description>
        Create a new Kanban board for your project
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4">
      <div>
        <Label for="board-name">Board Name</Label>
        <Input
          id="board-name"
          bind:value={newBoardForm.name}
          placeholder="Enter board name"
          class="glass dark:glass-dark"
        />
      </div>
    </div>
    <div>
      <Label for="onboarding-switch" class="flex items-center gap-2">
        <span>Use onboarding template</span>
        <Switch.Switch
          id="onboarding-switch"
          bind:checked={newBoardForm.useOnboardingTemplate}
          class="ml-2"
        />
      </Label>
      <div class="ml-1 mt-1 text-xs text-gray-500">
        Recommended for new users: adds example categories and cards.
      </div>
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        on:click={() => (showNewBoardDialog = false)}
        disabled={loading.createBoard}
      >
        Cancel
      </Button>
      <Button
        on:click={createBoard}
        class="gradient-primary text-white"
        disabled={loading.createBoard}
      >
        {#if loading.createBoard}
          <span class="mr-2 animate-spin"
            ><svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              ><circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                opacity="0.25"
              /><path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
              /></svg
            ></span
          >
        {/if}
        Create Board
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- New Category Dialog -->
<Dialog.Root bind:open={showNewCategoryDialog}>
  <Dialog.Content class="glass dark:glass-dark">
    <Dialog.Header>
      <Dialog.Title>Create New Category</Dialog.Title>
      <Dialog.Description>
        Add a new category to organize your cards
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="category-name">Category Name</Label>
        <Input
          id="category-name"
          bind:value={newCategoryForm.name}
          placeholder="Enter category name"
          class="glass dark:glass-dark"
        />
      </div>
      <div class="space-y-2">
        <Label>Category Color</Label>
        <div class="flex flex-wrap gap-2">
          {#each categoryColors as color}
            <button
              type="button"
              class="h-6 w-6 rounded-full {newCategoryForm.color === color
                ? 'ring-2 ring-purple-500 ring-offset-2'
                : ''}"
              style="background-color: {color}"
              on:click={() => (newCategoryForm.color = color)}
            ></button>
          {/each}
        </div>
      </div>
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        on:click={() => (showNewCategoryDialog = false)}
        disabled={loading.createCategory}
      >
        Cancel
      </Button>
      <Button
        on:click={createCategory}
        class="gradient-primary text-white"
        disabled={loading.createCategory}
      >
        {#if loading.createCategory}
          <span class="mr-2 animate-spin"
            ><svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              ><circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                opacity="0.25"
              /><path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
              /></svg
            ></span
          >
        {/if}
        Create Category
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- New Card Dialog -->
<Dialog.Root bind:open={showNewCardDialog}>
  <Dialog.Content class="glass dark:glass-dark">
    <Dialog.Header>
      <Dialog.Title>Create New Card</Dialog.Title>
      <Dialog.Description>Add a new card to track your work</Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4">
      <div>
        <Label for="card-title">Card Title</Label>
        <Input
          id="card-title"
          bind:value={newCardForm.title}
          placeholder="Enter card title"
          class="glass dark:glass-dark"
        />
      </div>
      <div>
        <Label for="card-description">Description (Optional)</Label>
        <Textarea
          id="card-description"
          bind:value={newCardForm.description}
          placeholder="Enter card description"
          class="glass dark:glass-dark"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label for="card-priority">Priority (Optional)</Label>
          <select
            id="card-priority"
            bind:value={newCardForm.priority}
            class="glass dark:glass-dark w-full rounded-md border border-white/30 bg-transparent px-3 py-2 dark:border-gray-700/50"
          >
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <Label for="card-due-date">Due Date (Optional)</Label>
          <Input
            id="card-due-date"
            type="date"
            bind:value={newCardForm.dueDate}
            class="glass dark:glass-dark"
          />
        </div>
      </div>
      <div>
        <Label for="card-tags">Tags (Optional)</Label>
        <Input
          id="card-tags"
          bind:value={newCardForm.tags}
          placeholder="Enter tags separated by commas"
          class="glass dark:glass-dark"
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        on:click={() => (showNewCardDialog = false)}
        disabled={loading.createCard}
      >
        Cancel
      </Button>
      <Button
        on:click={createCard}
        class="gradient-primary text-white"
        disabled={loading.createCard}
      >
        {#if loading.createCard}
          <span class="mr-2 animate-spin"
            ><svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              ><circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                opacity="0.25"
              /><path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
              /></svg
            ></span
          >
        {/if}
        Create Card
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Card Detail Dialog -->
<Dialog.Root bind:open={showCardDetailDialog}>
  <Dialog.Content class="glass dark:glass-dark max-w-2xl">
    <Dialog.Header>
      <Dialog.Title>Edit Card</Dialog.Title>
      <Dialog.Description>Update card details and description</Dialog.Description>
    </Dialog.Header>

    {#if selectedCard}
      <div class="space-y-4">
        <div>
          <Label for="edit-card-title">Card Title</Label>
          <Input
            id="edit-card-title"
            bind:value={selectedCard.title}
            class="glass dark:glass-dark"
          />
        </div>
        <div>
          <Label for="edit-card-description">Description</Label>
          <Textarea
            id="edit-card-description"
            bind:value={selectedCard.description}
            rows={6}
            class="glass dark:glass-dark"
            placeholder="Write your description in Markdown..."
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="edit-card-priority">Priority (optional)</Label>
            <select
              id="edit-card-priority"
              bind:value={selectedCard.priority}
              class="glass dark:glass-dark w-full rounded-md border border-white/30 bg-transparent px-3 py-2 dark:border-gray-700/50"
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <Label for="edit-card-due-date">Due Date</Label>
            <Input
              id="edit-card-due-date"
              type="date"
              bind:value={selectedCard.due_date}
              class="glass dark:glass-dark"
            />
          </div>
        </div>
        <div>
          <Label for="edit-card-tags">Tags</Label>
          <Input
            id="edit-card-tags"
            bind:value={selectedCard.tags}
            class="glass dark:glass-dark"
            placeholder="Enter tags separated by commas"
          />
        </div>
      </div>
    {/if}

    <Dialog.Footer class="gap-y-2">
      {#if selectedCard}
        {@const member = $kanban.boards[activeBoard].members.find(
          i => i.id === selectedCard?.created_by
        )}
        {#if member && member.id !== data.auth.user.id}
          <p
            class="flex items-center justify-center gap-2 md:mr-auto md:justify-start"
          >
            Created by:
            <img
              src={member.avatar_url}
              alt={member.name}
              class="h-6 w-6 rounded-full"
            />
            <span class="truncate font-medium text-gray-900 dark:text-white">
              {member.name}
            </span>
          </p>
        {/if}
      {/if}
      <Button
        variant="outline"
        on:click={() => (showCardDetailDialog = false)}
        disabled={loading.updateCard}
      >
        Cancel
      </Button>
      <Button
        on:click={saveCardDetail}
        class="gradient-primary text-white"
        disabled={loading.updateCard}
      >
        {#if loading.updateCard}
          <span class="mr-2 animate-spin"
            ><svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              ><circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                opacity="0.25"
              /><path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
              /></svg
            ></span
          >
        {/if}
        Save Changes
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Board Settings Dialog -->
<Dialog.Root bind:open={showBoardSettingsDialog}>
  <Dialog.Content class="glass dark:glass-dark">
    <Dialog.Header>
      <Dialog.Title>Board Settings</Dialog.Title>
    </Dialog.Header>

    {#if currentBoard}
      <div class="space-y-8">
        <!-- Board Settings Section -->
        <div class="space-y-2">
          <Label for="settings-board-name">Board Name</Label>
          <Input
            id="settings-board-name"
            bind:value={currentBoard.name}
            class="glass dark:glass-dark"
          />
        </div>
        <!-- Members Section -->
        <div class="space-y-2">
          <div class="font-semibold text-gray-900 dark:text-white">Members</div>
          <div class="space-y-2">
            {#each currentBoard.members as member (member.id)}
              <div
                class="flex items-center justify-between rounded-lg bg-white/60 p-3 dark:bg-gray-800/60"
              >
                <div class="flex items-center space-x-3">
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    class="h-8 w-8 rounded-full"
                  />
                  <span class="font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </span>
                </div>
                {#if member.id !== data.auth.user.id}
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                    on:click={() => handleRemoveBoardMember(member.id)}
                    disabled={loading.removeMember || loading.addMember}
                    title="Remove member"
                  >
                    <UserMinus class="h-4 w-4" />
                  </Button>
                {:else}
                  <span class="text-sm text-gray-500">(You)</span>
                {/if}
              </div>
            {/each}
          </div>
          <div class="mt-4 space-y-2">
            <div class="relative">
              <Input
                bind:value={memberSearchQuery}
                placeholder="Search users to add..."
                class="glass dark:glass-dark border-white/30 pl-10 dark:border-gray-700/50"
              />
              <UserPlus
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
            </div>
            {#if allOrgUsers.length === 0}
              <div class="space-y-2">
                {#each Array(2) as _}
                  <div class="flex items-center space-x-3 rounded-lg p-2">
                    <Skeleton.Skeleton class="h-8 w-8 rounded-full" />
                    <div class="flex-1">
                      <Skeleton.Skeleton class="h-4 w-20" />
                      <Skeleton.Skeleton class="h-3 w-16" />
                    </div>
                  </div>
                {/each}
              </div>
            {:else if memberSearchResults.length > 0}
              <div class="max-h-40 space-y-1 overflow-y-auto">
                {#each memberSearchResults as user (user.id)}
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
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
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
                      on:click={() => handleAddBoardMember(user.id)}
                      disabled={loading.addMember || loading.removeMember}
                      title="Add member"
                    >
                      <UserPlus class="h-4 w-4" />
                    </Button>
                  </div>
                {/each}
              </div>
            {:else if memberSearchQuery.trim()}
              <p class="text-sm text-gray-500 dark:text-gray-400">
                No users found matching "{memberSearchQuery}"
              </p>
            {/if}
            {#if allOrgUsersError}
              <div class="text-sm text-red-500">
                Could not load members: {allOrgUsersError}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
