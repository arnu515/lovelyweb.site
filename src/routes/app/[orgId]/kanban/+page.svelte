<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as ContextMenu from '$lib/components/ui/context-menu';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Badge } from '$lib/components/ui/badge';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Plus, MoreVertical, Users, Settings, Trash2, Move, Sparkles, FileEdit as Edit, X, UserPlus, UserMinus, Calendar, Tag } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  export let data;

  // Mock data
  let boards = [
    {
      id: '1',
      name: 'Product Development',
      description: 'Main product development board',
      members: [
        { id: '1', name: 'John Doe', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
        { id: '2', name: 'Jane Smith', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' }
      ],
      categories: [
        {
          id: '1',
          name: 'To Do',
          color: 'bg-gray-500',
          cards: [
            {
              id: '1',
              title: 'Design new landing page',
              description: 'Create a modern, responsive landing page with improved UX',
              assignees: ['1'],
              tags: ['design', 'frontend'],
              dueDate: '2024-02-15',
              priority: 'high'
            },
            {
              id: '2',
              title: 'Set up CI/CD pipeline',
              description: 'Configure automated testing and deployment',
              assignees: ['2'],
              tags: ['devops', 'backend'],
              dueDate: '2024-02-20',
              priority: 'medium'
            }
          ]
        },
        {
          id: '2',
          name: 'In Progress',
          color: 'bg-blue-500',
          cards: [
            {
              id: '3',
              title: 'Implement user authentication',
              description: 'Add OAuth and email/password authentication',
              assignees: ['1', '2'],
              tags: ['backend', 'security'],
              dueDate: '2024-02-10',
              priority: 'high'
            }
          ]
        },
        {
          id: '3',
          name: 'Review',
          color: 'bg-yellow-500',
          cards: []
        },
        {
          id: '4',
          name: 'Done',
          color: 'bg-green-500',
          cards: [
            {
              id: '4',
              title: 'Project setup',
              description: 'Initial project structure and dependencies',
              assignees: ['1'],
              tags: ['setup'],
              dueDate: '2024-01-30',
              priority: 'low'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      description: 'Q1 marketing initiatives',
      members: [
        { id: '3', name: 'Alice Johnson', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' }
      ],
      categories: [
        {
          id: '5',
          name: 'Planning',
          color: 'bg-purple-500',
          cards: [
            {
              id: '5',
              title: 'Content strategy',
              description: 'Develop content calendar and strategy',
              assignees: ['3'],
              tags: ['content', 'strategy'],
              dueDate: '2024-02-25',
              priority: 'medium'
            }
          ]
        },
        {
          id: '6',
          name: 'Execution',
          color: 'bg-orange-500',
          cards: []
        }
      ]
    }
  ];

  let activeBoard = '1';
  let draggedCard: any = null;
  let draggedFromCategory: string | null = null;

  // Dialog states
  let showNewBoardDialog = false;
  let showNewCategoryDialog = false;
  let showNewCardDialog = false;
  let showCardDetailDialog = false;
  let showBoardSettingsDialog = false;
  let showMembersDialog = false;

  // Form states
  let newBoardForm = { name: '', description: '' };
  let newCategoryForm = { name: '', color: 'bg-blue-500' };
  let newCardForm = { title: '', description: '', categoryId: '', priority: 'medium', dueDate: '', tags: '' };
  let selectedCard: any = null;
  let selectedCategoryForNewCard = '';

  // Available colors for categories
  const categoryColors = [
    'bg-gray-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500',
    'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
  ];

  $: currentBoard = boards.find(b => b.id === activeBoard);

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
    if (draggedCard && draggedFromCategory && draggedFromCategory !== targetCategoryId) {
      moveCard(draggedCard.id, draggedFromCategory, targetCategoryId);
    }
    draggedCard = null;
    draggedFromCategory = null;
  }

  function moveCard(cardId: string, fromCategoryId: string, toCategoryId: string) {
    const board = boards.find(b => b.id === activeBoard);
    if (!board) return;

    const fromCategory = board.categories.find(c => c.id === fromCategoryId);
    const toCategory = board.categories.find(c => c.id === toCategoryId);
    
    if (!fromCategory || !toCategory) return;

    const cardIndex = fromCategory.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = fromCategory.cards.splice(cardIndex, 1)[0];
    toCategory.cards.push(card);
    
    boards = [...boards];
    toast.success(`Moved "${card.title}" to ${toCategory.name}`);
    console.log('Card moved:', { cardId, fromCategoryId, toCategoryId });
  }

  function createBoard() {
    if (!newBoardForm.name.trim()) return;
    
    const newBoard = {
      id: Date.now().toString(),
      name: newBoardForm.name,
      description: newBoardForm.description,
      members: [],
      categories: []
    };
    
    boards = [...boards, newBoard];
    activeBoard = newBoard.id;
    newBoardForm = { name: '', description: '' };
    showNewBoardDialog = false;
    toast.success(`Created board "${newBoard.name}"`);
    console.log('Board created:', newBoard);
  }

  function createCategory() {
    if (!newCategoryForm.name.trim() || !currentBoard) return;
    
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryForm.name,
      color: newCategoryForm.color,
      cards: []
    };
    
    currentBoard.categories.push(newCategory);
    boards = [...boards];
    newCategoryForm = { name: '', color: 'bg-blue-500' };
    showNewCategoryDialog = false;
    toast.success(`Created category "${newCategory.name}"`);
    console.log('Category created:', newCategory);
  }

  function createCard() {
    if (!newCardForm.title.trim() || !selectedCategoryForNewCard || !currentBoard) return;
    
    const category = currentBoard.categories.find(c => c.id === selectedCategoryForNewCard);
    if (!category) return;
    
    const newCard = {
      id: Date.now().toString(),
      title: newCardForm.title,
      description: newCardForm.description,
      assignees: [],
      tags: newCardForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      dueDate: newCardForm.dueDate,
      priority: newCardForm.priority
    };
    
    category.cards.push(newCard);
    boards = [...boards];
    newCardForm = { title: '', description: '', categoryId: '', priority: 'medium', dueDate: '', tags: '' };
    selectedCategoryForNewCard = '';
    showNewCardDialog = false;
    toast.success(`Created card "${newCard.title}"`);
    console.log('Card created:', newCard);
  }

  function deleteCard(cardId: string, categoryId: string) {
    const board = boards.find(b => b.id === activeBoard);
    if (!board) return;

    const category = board.categories.find(c => c.id === categoryId);
    if (!category) return;

    const cardIndex = category.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = category.cards[cardIndex];
    category.cards.splice(cardIndex, 1);
    boards = [...boards];
    toast.success(`Deleted card "${card.title}"`);
    console.log('Card deleted:', { cardId, categoryId });
  }

  function deleteCategory(categoryId: string) {
    if (!currentBoard) return;
    
    const categoryIndex = currentBoard.categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) return;
    
    const category = currentBoard.categories[categoryIndex];
    currentBoard.categories.splice(categoryIndex, 1);
    boards = [...boards];
    toast.success(`Deleted category "${category.name}"`);
    console.log('Category deleted:', categoryId);
  }

  function deleteBoard(boardId: string) {
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) return;
    
    const board = boards[boardIndex];
    boards.splice(boardIndex, 1);
    
    if (activeBoard === boardId && boards.length > 0) {
      activeBoard = boards[0].id;
    }
    
    boards = [...boards];
    toast.success(`Deleted board "${board.name}"`);
    console.log('Board deleted:', boardId);
  }

  function openCardDetail(card: any) {
    selectedCard = { ...card };
    showCardDetailDialog = true;
  }

  function saveCardDetail() {
    if (!selectedCard || !currentBoard) return;
    
    const category = currentBoard.categories.find(c => 
      c.cards.some(card => card.id === selectedCard.id)
    );
    
    if (!category) return;
    
    const cardIndex = category.cards.findIndex(c => c.id === selectedCard.id);
    if (cardIndex === -1) return;
    
    category.cards[cardIndex] = { ...selectedCard };
    boards = [...boards];
    showCardDetailDialog = false;
    toast.success(`Updated card "${selectedCard.title}"`);
    console.log('Card updated:', selectedCard);
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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

  function moveCardToBoard(card: any, targetBoardId: string) {
    toast.info(`Moving "${card.title}" to another board - Feature coming soon!`);
    console.log('Move card to board:', { card, targetBoardId });
  }
</script>

<svelte:head>
  <title>Kanban Board - lovelyweb.site</title>
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden">
  <!-- Header -->
  <div class="glass dark:glass-dark border-b border-white/20 p-4 dark:border-gray-700/50">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        {#if currentBoard}
          <Badge variant="outline" class="glass dark:glass-dark">
            {currentBoard.categories.reduce((sum, cat) => sum + cat.cards.length, 0)} cards
          </Badge>
        {/if}
      </div>
      
      <div class="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          on:click={() => showMembersDialog = true}
          class="h-9 w-9"
        >
          <Users class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          on:click={() => showBoardSettingsDialog = true}
          class="h-9 w-9"
        >
          <Settings class="h-4 w-4" />
        </Button>
        <Button
          on:click={() => showNewBoardDialog = true}
          class="gradient-primary gap-2 text-white"
        >
          <Plus class="h-4 w-4" />
          New Board
        </Button>
      </div>
    </div>
  </div>

  <!-- Board Tabs -->
  <div class="glass dark:glass-dark border-b border-white/20 dark:border-gray-700/50">
    <Tabs.Root bind:value={activeBoard} class="w-full">
      <div class="flex items-center justify-between px-4 py-2">
        <Tabs.List class="glass dark:glass-dark">
          {#each boards as board (board.id)}
            <Tabs.Trigger value={board.id} class="relative">
              {board.name}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    builders={[builder]}
                    variant="ghost"
                    size="icon"
                    class="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100"
                    on:click|stopPropagation
                  >
                    <MoreVertical class="h-3 w-3" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="glass dark:glass-dark">
                  <DropdownMenu.Item on:click={() => showBoardSettingsDialog = true}>
                    <Settings class="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    class="text-red-600 dark:text-red-400"
                    on:click={() => deleteBoard(board.id)}
                  >
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete Board
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Tabs.Trigger>
          {/each}
        </Tabs.List>
        
        <Button
          variant="ghost"
          size="sm"
          on:click={() => showNewCategoryDialog = true}
          class="gap-2"
        >
          <Plus class="h-4 w-4" />
          Add Category
        </Button>
      </div>
    </Tabs.Root>
  </div>

  <!-- Board Content -->
  <div class="flex-1 overflow-hidden">
    {#if currentBoard}
      <div class="flex h-full space-x-4 overflow-x-auto p-4">
        {#each currentBoard.categories as category (category.id)}
          <div class="flex min-w-80 flex-col">
            <!-- Category Header -->
            <div class="glass dark:glass-dark mb-4 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="h-3 w-3 rounded-full {category.color}"></div>
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
                      class="h-6 w-6"
                    >
                      <MoreVertical class="h-3 w-3" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content class="glass dark:glass-dark">
                    <DropdownMenu.Item 
                      on:click={() => {
                        selectedCategoryForNewCard = category.id;
                        showNewCardDialog = true;
                      }}
                    >
                      <Plus class="mr-2 h-4 w-4" />
                      Add Card
                    </DropdownMenu.Item>
                    <DropdownMenu.Item 
                      class="text-red-600 dark:text-red-400"
                      on:click={() => deleteCategory(category.id)}
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete Category
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            </div>

            <!-- Cards Container -->
            <div 
              class="flex-1 space-y-3 rounded-lg bg-gray-100/50 p-3 dark:bg-gray-800/50"
              on:dragover={handleDragOver}
              on:drop={e => handleDrop(e, category.id)}
            >
              {#each category.cards as card (card.id)}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <div
                      class="glass dark:glass-dark group cursor-pointer rounded-lg p-4 transition-all duration-200 hover:scale-105"
                      draggable="true"
                      on:dragstart={e => handleDragStart(e, card, category.id)}
                      on:click={() => openCardDetail(card)}
                      role="button"
                      tabindex="0"
                      on:keydown={e => e.key === 'Enter' && openCardDetail(card)}
                    >
                      <!-- Card Header -->
                      <div class="mb-2 flex items-start justify-between">
                        <h4 class="font-medium text-gray-900 dark:text-white">
                          {card.title}
                        </h4>
                        <div class="h-2 w-2 rounded-full {getPriorityColor(card.priority)}"></div>
                      </div>

                      <!-- Card Description -->
                      {#if card.description}
                        <p class="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
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
                      <div class="flex items-center justify-between">
                        <!-- Assignees -->
                        <div class="flex -space-x-2">
                          {#each card.assignees.slice(0, 3) as assigneeId}
                            {@const member = currentBoard.members.find(m => m.id === assigneeId)}
                            {#if member}
                              <img
                                src={member.avatar}
                                alt={member.name}
                                class="h-6 w-6 rounded-full border-2 border-white dark:border-gray-800"
                                title={member.name}
                              />
                            {/if}
                          {/each}
                          {#if card.assignees.length > 3}
                            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                              +{card.assignees.length - 3}
                            </div>
                          {/if}
                        </div>

                        <!-- Due Date -->
                        {#if card.dueDate}
                          <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar class="mr-1 h-3 w-3" />
                            {formatDate(card.dueDate)}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </ContextMenu.Trigger>
                  
                  <ContextMenu.Content class="glass dark:glass-dark">
                    <ContextMenu.Item on:click={() => openCardDetail(card)}>
                      <Edit class="mr-2 h-4 w-4" />
                      Edit Card
                    </ContextMenu.Item>
                    <ContextMenu.Item on:click={() => refineCardWithAI(card)}>
                      <Sparkles class="mr-2 h-4 w-4" />
                      Refine with AI
                    </ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Sub>
                      <ContextMenu.SubTrigger>
                        <Move class="mr-2 h-4 w-4" />
                        Move to Board
                      </ContextMenu.SubTrigger>
                      <ContextMenu.SubContent class="glass dark:glass-dark">
                        {#each boards.filter(b => b.id !== activeBoard) as board}
                          <ContextMenu.Item on:click={() => moveCardToBoard(card, board.id)}>
                            {board.name}
                          </ContextMenu.Item>
                        {/each}
                      </ContextMenu.SubContent>
                    </ContextMenu.Sub>
                    <ContextMenu.Separator />
                    <ContextMenu.Item 
                      class="text-red-600 dark:text-red-400"
                      on:click={() => deleteCard(card.id, category.id)}
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete Card
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              {/each}

              <!-- Add Card Button -->
              <Button
                variant="ghost"
                class="w-full border-2 border-dashed border-gray-300 py-8 dark:border-gray-600"
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

        <!-- Add Category Button -->
        <div class="flex min-w-80 flex-col">
          <Button
            variant="ghost"
            class="h-full border-2 border-dashed border-gray-300 dark:border-gray-600"
            on:click={() => showNewCategoryDialog = true}
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
            No boards yet
          </h2>
          <p class="mb-6 text-gray-600 dark:text-gray-300">
            Create your first board to get started
          </p>
          <Button
            on:click={() => showNewBoardDialog = true}
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
      <div>
        <Label for="board-description">Description (Optional)</Label>
        <Textarea
          id="board-description"
          bind:value={newBoardForm.description}
          placeholder="Enter board description"
          class="glass dark:glass-dark"
        />
      </div>
    </div>
    
    <Dialog.Footer>
      <Button variant="outline" on:click={() => showNewBoardDialog = false}>
        Cancel
      </Button>
      <Button on:click={createBoard} class="gradient-primary text-white">
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
      <div>
        <Label for="category-name">Category Name</Label>
        <Input
          id="category-name"
          bind:value={newCategoryForm.name}
          placeholder="Enter category name"
          class="glass dark:glass-dark"
        />
      </div>
      <div>
        <Label>Category Color</Label>
        <div class="flex flex-wrap gap-2">
          {#each categoryColors as color}
            <button
              type="button"
              class="h-8 w-8 rounded-full {color} {newCategoryForm.color === color ? 'ring-2 ring-purple-500 ring-offset-2' : ''}"
              on:click={() => newCategoryForm.color = color}
            ></button>
          {/each}
        </div>
      </div>
    </div>
    
    <Dialog.Footer>
      <Button variant="outline" on:click={() => showNewCategoryDialog = false}>
        Cancel
      </Button>
      <Button on:click={createCategory} class="gradient-primary text-white">
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
      <Dialog.Description>
        Add a new card to track your work
      </Dialog.Description>
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
          <Label for="card-priority">Priority</Label>
          <select
            id="card-priority"
            bind:value={newCardForm.priority}
            class="glass dark:glass-dark w-full rounded-md border border-white/30 bg-transparent px-3 py-2 dark:border-gray-700/50"
          >
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
      <Button variant="outline" on:click={() => showNewCardDialog = false}>
        Cancel
      </Button>
      <Button on:click={createCard} class="gradient-primary text-white">
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
      <Dialog.Description>
        Update card details and description
      </Dialog.Description>
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
            <Label for="edit-card-priority">Priority</Label>
            <select
              id="edit-card-priority"
              bind:value={selectedCard.priority}
              class="glass dark:glass-dark w-full rounded-md border border-white/30 bg-transparent px-3 py-2 dark:border-gray-700/50"
            >
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
              bind:value={selectedCard.dueDate}
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
    
    <Dialog.Footer>
      <Button variant="outline" on:click={() => showCardDetailDialog = false}>
        Cancel
      </Button>
      <Button on:click={saveCardDetail} class="gradient-primary text-white">
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
      <Dialog.Description>
        Manage board settings and preferences
      </Dialog.Description>
    </Dialog.Header>
    
    {#if currentBoard}
      <div class="space-y-4">
        <div>
          <Label for="settings-board-name">Board Name</Label>
          <Input
            id="settings-board-name"
            bind:value={currentBoard.name}
            class="glass dark:glass-dark"
          />
        </div>
        <div>
          <Label for="settings-board-description">Description</Label>
          <Textarea
            id="settings-board-description"
            bind:value={currentBoard.description}
            class="glass dark:glass-dark"
          />
        </div>
      </div>
    {/if}
    
    <Dialog.Footer>
      <Button variant="outline" on:click={() => showBoardSettingsDialog = false}>
        Cancel
      </Button>
      <Button 
        on:click={() => {
          showBoardSettingsDialog = false;
          boards = [...boards];
          toast.success('Board settings updated');
        }}
        class="gradient-primary text-white"
      >
        Save Changes
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Members Dialog -->
<Dialog.Root bind:open={showMembersDialog}>
  <Dialog.Content class="glass dark:glass-dark">
    <Dialog.Header>
      <Dialog.Title>Board Members</Dialog.Title>
      <Dialog.Description>
        Manage who has access to this board
      </Dialog.Description>
    </Dialog.Header>
    
    {#if currentBoard}
      <div class="space-y-4">
        <div class="space-y-2">
          {#each currentBoard.members as member (member.id)}
            <div class="flex items-center justify-between rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
              <div class="flex items-center space-x-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  class="h-8 w-8 rounded-full"
                />
                <span class="font-medium text-gray-900 dark:text-white">
                  {member.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <UserMinus class="h-4 w-4" />
              </Button>
            </div>
          {/each}
        </div>
        
        <Button variant="outline" class="w-full gap-2">
          <UserPlus class="h-4 w-4" />
          Add Member
        </Button>
      </div>
    {/if}
    
    <Dialog.Footer>
      <Button on:click={() => showMembersDialog = false}>
        Close
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>