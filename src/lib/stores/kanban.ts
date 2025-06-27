import {
  get,
  writable,
  type Writable,
  type Updater,
  type Readable
} from 'svelte/store';
import { page } from '$app/stores';
import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';
import { toast } from 'svelte-sonner';
import { nanoid } from 'nanoid';
import type { lv } from 'date-fns/locale';

const supabase = createBrowserClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

export type Board = Database['public']['Tables']['kanban_boards']['Row'] & {
  description?: string | null; // for UI, not in schema
  categories: Category[];
  members: Member[];
};
export type Category = Database['public']['Tables']['kanban_categories']['Row'] & {
  cards: Card[];
};
export type Card = Database['public']['Tables']['kanban_cards']['Row'];
export type Member = {
  id: string;
  name: string;
  avatar_url: string;
};

type KanbanStoreData = {
  boards: Record<string, Board>;
  error: string | null;
};

function emptyData(): KanbanStoreData {
  return {
    boards: {},
    error: null
  };
}

function createKanbanStore() {
  let orgId: string | null = null;

  const { set, subscribe, update } = writable<KanbanStoreData>(emptyData());

  async function fetchBoard(
    boardId: string,
    refetch: boolean = false
  ): Promise<Board | undefined> {
    const data = get({ subscribe });
    if (!refetch && data.boards[boardId]) return data.boards[boardId];
    if (!isBrowser()) return;
    try {
      const { data: rawBoard, error: boardErr } = await supabase
        .from('kanban_boards')
        .select('*')
        .eq('id', boardId)
        .order('created_at', { ascending: true })
        .maybeSingle();
      if (boardErr) throw boardErr;
      if (!rawBoard) return undefined;
      const { data: categories, error: catErr } = await supabase
        .from('kanban_categories')
        .select('*')
        .eq('board_id', rawBoard.id)
        .order('position', { ascending: true });
      if (catErr) throw catErr;
      const { data: cards, error: cardErr } = await supabase
        .from('kanban_cards')
        .select('*')
        .eq('board_id', rawBoard.id)
        .order('position', { ascending: true });
      if (cardErr) throw cardErr;
      const { data: members, error: memErr } = await supabase
        .from('kanban_board_members')
        .select('users (id, name, avatar_url)')
        .eq('board_id', rawBoard.id);
      if (memErr) throw memErr;

      const board: Board = {
        ...rawBoard,
        categories: categories.map(c => {
          (c as Category).cards = [];
          return c as Category;
        }),
        members: members.map(i => i.users)
      };
      for (const card of cards) {
        // TODO: use positions
        const cat = board.categories.find(c => c.id === card.category_id);
        if (cat) cat.cards.push(card);
      }
      update(d => {
        d.boards[board.id] = board;
        return d;
      });
      return board;
    } catch (err: any) {
      captureException(err, { tags: { supabase: 'kanban_fetch_board', boardId } });
      update(d => {
        d.error = err.message || String(err);
        return d;
      });
      toast.error('Could not load kanban data', { description: err.message });
    }
  }
  async function fetchCategory(
    boardId: string,
    categoryId: string
  ): Promise<Category | undefined> {
    return (await fetchBoard(boardId))?.categories.find(c => c.id === categoryId);
  }

  // --- Initial load (one-time, not refetched) ---
  async function fetchAll(orgId: string) {
    if (!isBrowser()) return;
    try {
      // Boards
      const { data: boards, error: boardErr } = await supabase
        .from('kanban_boards')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: true });
      if (boardErr) throw boardErr;
      const { data: categories, error: catErr } = await supabase
        .from('kanban_categories')
        .select('*')
        .in(
          'board_id',
          boards.map(b => b.id)
        )
        .order('position', { ascending: true });
      if (catErr) throw catErr;
      const { data: cards, error: cardErr } = await supabase
        .from('kanban_cards')
        .select('*')
        .in(
          'board_id',
          boards.map(b => b.id)
        )
        .order('position', { ascending: true });
      if (cardErr) throw cardErr;
      const { data: members, error: memErr } = await supabase
        .from('kanban_board_members')
        .select('board_id, user_id, users (id, name, avatar_url)')
        .in(
          'board_id',
          boards.map(b => b.id)
        );
      if (memErr) throw memErr;

      const boardsMap: Record<string, Board> = {};
      for (const b of boards) {
        boardsMap[b.id] = {
          ...b,
          categories: [],
          members: []
        };
      }
      for (const c of categories) {
        const cat: Category = { ...c, cards: [] };
        boardsMap[c.board_id]?.categories.push(cat);
      }
      for (const card of cards) {
        const cat = boardsMap[card.board_id]?.categories.find(
          c => c.id === card.category_id
        );
        if (cat) cat.cards.push(card);
      }
      for (const m of members) {
        if (m.users) {
          boardsMap[m.board_id]?.members.push({
            id: m.users.id,
            name: m.users.name,
            avatar_url: m.users.avatar_url
          });
        }
      }
      set({ ...emptyData(), boards: boardsMap });
    } catch (err: any) {
      captureException(err, { tags: { supabase: 'kanban_fetch_all' } });
      set({ ...emptyData(), error: err.message || String(err) });
      toast.error('Could not load kanban data', { description: err.message });
    }
  }

  async function createBoard({
    name,
    owner_id,
    useOnboardingTemplate
  }: {
    name: string;
    owner_id: string;
    useOnboardingTemplate: boolean;
  }) {
    if (!orgId) return;
    const boardId = nanoid();
    const { error } = await (useOnboardingTemplate
      ? supabase.rpc('create_board', {
          id: boardId,
          board_name: name,
          org_id: orgId
        })
      : supabase.from('kanban_boards').insert({
          id: boardId,
          name,
          org_id: orgId,
          owner_id
        }));
    if (error) {
      captureException(error, {
        tags: { supabase: useOnboardingTemplate ? 'create_board' : 'kanban_boards' }
      });
      toast.error('Could not create board', { description: error.message });
      return;
    }
    await fetchBoard(boardId);
    toast.success(`Created board "${name}"`);
  }

  async function updateBoard(
    boardId: string,
    updates: Partial<Database['public']['Tables']['kanban_boards']['Update']>
  ) {
    const { error } = await supabase
      .from('kanban_boards')
      .update(updates)
      .eq('id', boardId);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_boards' } });
      toast.error('Could not update board', { description: error.message });
      return;
    }
    update(d => {
      d.boards[boardId] = {
        ...d.boards[boardId],
        ...updates
      };
      return d;
    });
    toast.success('Board updated');
  }

  async function deleteBoard(boardId: string) {
    const { error } = await supabase
      .from('kanban_boards')
      .delete()
      .eq('id', boardId);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_boards' } });
      toast.error('Could not delete board', { description: error.message });
      return;
    }
    update(d => {
      delete d.boards[boardId];
      return d;
    });
    toast.success('Board deleted');
  }

  async function createCategory({
    board_id,
    name,
    color
  }: {
    board_id: string;
    name: string;
    color: string;
  }) {
    const categoryId = crypto.randomUUID();
    const board = await fetchBoard(board_id);
    if (!board) {
      toast.error('Could not create category', { description: 'Board not found' });
      return;
    }
    let maxPos = -1;
    for (const c of board.categories) if (c.position > maxPos) maxPos = c.position;
    const { error } = await supabase.from('kanban_categories').insert({
      id: categoryId,
      board_id,
      name,
      color,
      position: maxPos + 1
    });
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_categories' } });
      toast.error('Could not create category', { description: error.message });
      return;
    }
    update(d => {
      d.boards[board.id].categories = [
        ...board.categories,
        {
          id: categoryId,
          board_id,
          name,
          color,
          position: maxPos + 1,
          created_at: new Date().toISOString(),
          cards: []
        }
      ];
      return d;
    });
    toast.success(`Created category "${name}"`);
  }

  /**
   * If the updates.board_id is not the same as oldBoardId, then the cards under this category are also moved.
   */
  async function updateCategory(
    categoryId: string,
    oldBoardId: string,
    updates: Partial<Database['public']['Tables']['kanban_categories']['Update']>
  ) {
    const { error } = await supabase
      .from('kanban_categories')
      .update(updates)
      .eq('id', categoryId);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_categories' } });
      toast.error('Could not update category', { description: error.message });
      return;
    }
    if (updates.board_id && updates.board_id !== oldBoardId) {
      const { error } = await supabase
        .from('kanban_cards')
        .update({ board_id: updates.board_id })
        .eq('category_id', categoryId);
      if (error) {
        captureException(error, { tags: { supabase: 'kanban_cards' } });
        await supabase
          .from('kanban_categories')
          .update({ board_id: oldBoardId })
          .eq('id', categoryId);
        toast.error('Could not move category', { description: error.message });
        return;
      }
    }
    update(d => {
      const oldBoard = d.boards[oldBoardId];
      if (!oldBoard) return d;
      const oldCategoryIndex = oldBoard.categories.findIndex(
        c => c.id === categoryId
      );
      const oldCat = oldBoard.categories[oldCategoryIndex];
      if (updates.board_id && updates.board_id !== oldBoardId) {
        oldBoard.categories.splice(oldCategoryIndex, 1);
        const newBoard = d.boards[updates.board_id];
        if (newBoard) {
          newBoard.categories.push({
            ...oldCat,
            ...updates
          });
        }
      } else {
        oldBoard.categories[oldCategoryIndex] = {
          ...oldCat,
          ...updates
        };
      }
      return d;
    });
    toast.success('Category updated');
  }

  async function deleteCategory(categoryId: string, boardId: string) {
    const { error } = await supabase
      .from('kanban_categories')
      .delete()
      .eq('id', categoryId);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_categories' } });
      toast.error('Could not delete category', { description: error.message });
      return;
    }
    update(d => {
      d.boards[boardId].categories.splice(
        d.boards[boardId].categories.findIndex(c => c.id === categoryId),
        1
      );
      return d;
    });
    toast.success('Category deleted');
  }

  async function createCard({
    board_id,
    category_id,
    title,
    description,
    priority,
    due_date,
    tags,
    created_by
  }: {
    board_id: string;
    category_id: string;
    title: string;
    description?: string;
    priority?: Database['public']['Enums']['kanban_priority'];
    due_date?: string;
    tags?: string[];
    created_by: string;
  }) {
    const cardId = crypto.randomUUID();
    const board = await fetchBoard(board_id);
    if (!board) {
      toast.error('Could not create card', {
        description:
          "Board does not exist, or you don't have permission to access it."
      });
      return;
    }
    const category = board.categories.find(c => c.id === category_id);
    const maxPos =
      category?.cards.reduce((max, c) => Math.max(max, c.position), 0) ?? 0;
    const newCard: Card = {
      id: cardId,
      board_id,
      category_id,
      title,
      description: description ?? '',
      priority: priority ?? 'medium',
      due_date: due_date ?? null,
      tags: tags ?? [],
      created_by,
      created_at: new Date().toISOString(),
      updated_at: null,
      position: maxPos + 1
    };
    const { error } = await supabase.from('kanban_cards').insert(newCard);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_create_card' } });
      toast.error('Could not create card', { description: error.message });
      return;
    }
    update(d => {
      d.boards[board.id].categories
        .find(i => i.id === category_id)
        ?.cards.push(newCard);
      return d;
    });
    toast.success(`Created card "${title}"`);
  }

  async function updateCard(
    cardId: string,
    categoryId: string,
    boardId: string,
    updates: Partial<Database['public']['Tables']['kanban_cards']['Update']>
  ): Promise<boolean> {
    let oldCard: Card | undefined = undefined;
    let oldCardIdx: number = -1,
      newCardIdx: number = -1;
    let oldCategory: Category | undefined = undefined,
      newCategory: Category | undefined = undefined;

    update(d => {
      const oldBoard = d.boards[boardId];
      if (!oldBoard) return d;
      oldCategory = oldBoard.categories.find(i => i.id === categoryId);
      if (!oldCategory) return d;
      oldCardIdx = oldCategory.cards.findIndex(c => c.id === cardId);
      oldCard = { ...oldCategory.cards[oldCardIdx] };

      console.log(d);
      if (
        ((updates.category_id && updates.category_id !== categoryId) ||
          (updates.board_id && updates.board_id !== boardId)) &&
        oldCategory
      ) {
        const newBoardId = updates.board_id ?? boardId;
        const newCategoryId = updates.category_id ?? categoryId;
        newCategory = d.boards[newBoardId]?.categories.find(
          i => i.id === newCategoryId
        );
        if (newCategory) {
          newCategory.cards.push({
            ...oldCard,
            ...updates
          });
          newCardIdx = newCategory.cards.length - 1;
        }
        oldCategory.cards.splice(oldCardIdx, 1);
      } else if (oldCardIdx !== -1) {
        Object.assign(oldCategory.cards[oldCardIdx], updates);
      }
      console.log(d);
      return d;
    });

    const { error } = await supabase
      .from('kanban_cards')
      .update(updates)
      .eq('id', cardId);

    if (error) {
      update(d => {
        if (newCategory !== undefined && newCardIdx) {
          newCategory.cards.splice(newCardIdx, 1);
          if (oldCategory && oldCard)
            oldCategory.cards.splice(oldCardIdx, 0, oldCard);
        } else if (oldCategory && oldCard) {
          Object.assign(oldCategory.cards[oldCardIdx], oldCard);
        }
        return d;
      });
      captureException(error, { tags: { supabase: 'kanban_update_card' } });
      toast.error('Could not update card', { description: error.message });
      return false;
    }

    toast.success('Card updated');
    return true;
  }

  async function deleteCard(cardId: string, categoryId: string, boardId: string) {
    const { error } = await supabase.from('kanban_cards').delete().eq('id', cardId);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_delete_card' } });
      toast.error('Could not delete card', { description: error.message });
    }
    update(d => {
      const cat = d.boards[boardId].categories.find(c => c.id === categoryId);
      if (!cat) return d;
      const cardIndex = cat.cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return d;
      cat.cards.splice(cardIndex, 1);
      return d;
    });
    toast.success('Card deleted');
  }

  // --- Members ---
  async function addMember(boardId: string, userId: string) {
    const { data, error } = await supabase
      .from('kanban_board_members')
      .insert([{ board_id: boardId, user_id: userId }])
      .select('users (id, name, avatar_url)')
      .single();
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_add_member' } });
      toast.error('Could not add member', { description: error.message });
      return;
    }
    update(d => {
      d.boards[boardId].members.push(data.users);
      return d;
    });
    toast.success('Member added');
  }

  async function removeMember(boardId: string, userId: string) {
    const { error } = await supabase
      .from('kanban_board_members')
      .delete()
      .eq('board_id', boardId)
      .eq('user_id', userId);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_add_member' } });
      toast.error('Could not add member', { description: error.message });
      return;
    }
    update(d => {
      d.boards[boardId].members = d.boards[boardId].members.filter(
        member => member.id !== userId
      );
      return d;
    });
    toast.success('Member added');
  }

  // --- Expose store API ---
  return {
    subscribe,
    fetchBoard,
    fetchCategory,
    fetchAll,
    createBoard,
    updateBoard,
    deleteBoard,
    createCategory,
    updateCategory,
    deleteCategory,
    createCard,
    updateCard,
    deleteCard,
    addMember,
    removeMember
  };
}

export const kanban = createKanbanStore();
