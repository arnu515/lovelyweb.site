import { get, writable } from 'svelte/store';
import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';
import { toast } from 'svelte-sonner';
import { nanoid } from 'nanoid';

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
  const { set, subscribe, update } = writable<KanbanStoreData>(emptyData());

  let addedToBoardHandler: ((b: string) => void) | null = null;
  function setAddedToBoardHandler(h: typeof addedToBoardHandler) {
    addedToBoardHandler = h;
  }

  let removedFromBoardHandler: ((b: string) => void) | null = null;
  function setRemovedFromBoardHandler(h: typeof removedFromBoardHandler) {
    removedFromBoardHandler = h;
  }

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

  async function createBoard(
    orgId: string,
    {
      name,
      owner_id,
      useOnboardingTemplate
    }: {
      name: string;
      owner_id: string;
      useOnboardingTemplate: boolean;
    }
  ) {
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
    return boardId;
  }

  async function updateBoardName(board_id: string, new_name: string) {
    const { error } = await supabase.rpc('update_board_name', {
      board_id,
      new_name
    });
    if (error) {
      captureException(error, { tags: { supabase: 'update_board_name' } });
      toast.error('Could not update board', { description: error.message });
      return;
    }
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
      return false;
    }
    update(d => {
      delete d.boards[boardId];
      return d;
    });
    toast.success('Board deleted');
    return true;
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
    const t = toast.loading('Creating category');
    const categoryId = crypto.randomUUID();
    const board = await fetchBoard(board_id);
    if (!board) {
      toast.dismiss(t);
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
    toast.dismiss(t);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_categories' } });
      toast.error('Could not create category', { description: error.message });
      return;
    }
    toast.success(`Created category "${name}"`);
  }

  /**
   * If the updates.board_id is not the same as oldBoardId, then the cards under this category are also moved.
   */
  /*async function updateCategory(
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
  }*/

  async function deleteCategory(categoryId: string) {
    const t = toast.loading('Deleting category');
    const { error } = await supabase
      .from('kanban_categories')
      .delete()
      .eq('id', categoryId);
    toast.dismiss(t);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_categories' } });
      toast.error('Could not delete category', { description: error.message });
      return;
    }
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
    const t = toast.loading('Creating card', { dismissable: false });
    const cardId = nanoid();
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
    toast.dismiss(t);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_create_card' } });
      toast.error('Could not create card', { description: error.message });
      return;
    }
    toast.success(`Created card "${title}"`);
  }

  const cardsOptimisticallyUpdated: Set<string> = new Set();

  async function updateCard(
    cardId: string,
    categoryId: string,
    boardId: string,
    userId: string,
    updates: Partial<Database['public']['Tables']['kanban_cards']['Update']>
  ): Promise<boolean> {
    let oldCard: Card | undefined = undefined;
    let oldCardIdx: number = -1,
      newCardIdx: number = -1;
    let oldCategory: Category | undefined = undefined,
      newCategory: Category | undefined = undefined;

    const updated_at = new Date().toISOString();

    cardsOptimisticallyUpdated.add(cardId);
    update(d => {
      const oldBoard = d.boards[boardId];
      if (!oldBoard) return d;
      oldCategory = oldBoard.categories.find(i => i.id === categoryId);
      if (!oldCategory) return d;
      oldCardIdx = oldCategory.cards.findIndex(c => c.id === cardId);
      oldCard = { ...oldCategory.cards[oldCardIdx] };

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
            ...updates,
            created_by: userId,
            updated_at
          });
          newCardIdx = newCategory.cards.length - 1;
        }
        oldCategory.cards.splice(oldCardIdx, 1);
      } else if (oldCardIdx !== -1) {
        Object.assign(oldCategory.cards[oldCardIdx], updates);
        oldCategory.cards[oldCardIdx].created_by = userId;
        oldCategory.cards[oldCardIdx].updated_at = updated_at;
      }
      return d;
    });

    const { error } = await supabase
      .from('kanban_cards')
      .update({
        ...updates,
        created_by: userId,
        updated_at
      })
      .eq('id', cardId);

    if (error) {
      cardsOptimisticallyUpdated.delete(cardId);
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

  async function deleteCard(cardId: string) {
    const t = toast.loading('Deleting card', { dismissable: false });
    const { error } = await supabase.from('kanban_cards').delete().eq('id', cardId);
    toast.dismiss(t);
    if (error) {
      captureException(error, { tags: { supabase: 'kanban_delete_card' } });
      toast.error('Could not delete card', { description: error.message });
    }
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
      return false;
    }
    update(d => {
      d.boards[boardId].members.push(data.users);
      return d;
    });
    toast.success('Member added');
    return true;
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
      return false;
    }
    update(d => {
      d.boards[boardId].members = d.boards[boardId].members.filter(
        member => member.id !== userId
      );
      return d;
    });
    toast.success('Member Removed');
    return true;
  }

  function boardUpdateRealtime(evt: string, payload: any) {
    type Board = Database['public']['Tables']['kanban_boards']['Row'];
    if (
      typeof payload !== 'object' ||
      payload === null ||
      evt !== 'UPDATE' ||
      payload.operation !== 'UPDATE' ||
      typeof payload.old_record !== 'object' ||
      payload.old_record === null ||
      typeof payload.record !== 'object' ||
      payload.record === null ||
      payload.table !== 'kanban_boards'
    )
      return;
    const board = payload.record as Board;
    update(d => {
      const b = d.boards[board.id];
      if (b) Object.assign(b, board);
      return d;
    });
  }

  function categoryUpdateRealtime(evt: string, payload: any) {
    type Cat = Database['public']['Tables']['kanban_categories']['Row'];
    if (typeof payload !== 'object' || payload === null) return;
    switch (evt) {
      case 'INSERT':
        {
          if (
            payload.operation !== 'INSERT' ||
            typeof payload.record !== 'object' ||
            payload.record === null ||
            payload.table !== 'kanban_categories'
          )
            return;
          const cat = payload.record as Cat;
          update(d => {
            const b = d.boards[cat.board_id];
            const newCat: Category = {
              ...cat,
              cards: []
            };
            if (b && b.categories.length > newCat.position)
              b.categories.splice(newCat.position, 0, { ...newCat });
            else b?.categories.push(newCat);
            return d;
          });
        }
        break;
      case 'DELETE':
        {
          if (
            payload.operation !== 'DELETE' ||
            typeof payload.old_record !== 'object' ||
            payload.old_record === null ||
            payload.table !== 'kanban_categories'
          )
            return;
          const cat = payload.old_record as Category;
          update(d => {
            const b = d.boards[cat.board_id];
            if (!b) return d;
            const ci = b.categories.findIndex(c => c.id === cat.id);
            if (ci !== -1) b.categories.splice(ci, 1);
            return d;
          });
        }
        break;
      default:
        break;
    }
  }

  function cardUpdateRealtime(evt: string, payload: any) {
    if (typeof payload !== 'object' || payload === null) return;
    switch (evt) {
      case 'INSERT':
        {
          if (
            payload.operation !== 'INSERT' ||
            typeof payload.record !== 'object' ||
            payload.record === null ||
            payload.table !== 'kanban_cards'
          )
            return;
          const newCard = payload.record as Card;
          update(d => {
            const cat = d.boards[newCard.board_id].categories.find(
              i => i.id === newCard.category_id
            );
            if (cat && cat.cards.length > newCard.position)
              cat.cards.splice(newCard.position, 0, { ...newCard });
            else cat?.cards.push({ ...newCard });
            return d;
          });
        }
        break;
      case 'UPDATE':
        {
          if (
            payload.operation !== 'UPDATE' ||
            typeof payload.old_record !== 'object' ||
            payload.old_record === null ||
            typeof payload.record !== 'object' ||
            payload.record === null ||
            payload.table !== 'kanban_cards'
          )
            return;
          const oldCard = payload.old_record as Card;
          const newCard = payload.record as Card;
          if (cardsOptimisticallyUpdated.has(oldCard.id)) {
            cardsOptimisticallyUpdated.delete(oldCard.id);
            return;
          }
          update(d => {
            if (
              oldCard.category_id === newCard.category_id &&
              oldCard.position === newCard.position
            ) {
              const cat = d.boards[oldCard.board_id].categories.find(
                i => i.id === oldCard.category_id
              );
              if (!cat) return d;
              const cI = cat.cards.findIndex(c => c.id === oldCard.id);
              if (cI !== -1) Object.assign(cat.cards[cI], newCard);
            } else {
              const oldCat = d.boards[oldCard.board_id].categories.find(
                i => i.id === oldCard.category_id
              );
              if (oldCat) {
                const ci = oldCat.cards.findIndex(c => c.id === oldCard.id);
                if (ci !== -1) oldCat.cards.splice(ci, 1);
              }
              const newCat = d.boards[newCard.board_id].categories.find(
                i => i.id === newCard.category_id
              );
              if (newCat && newCat.cards.length > newCard.position)
                newCat.cards.splice(newCard.position, 0, { ...newCard });
              else newCat?.cards.push({ ...newCard });
            }
            return d;
          });
        }
        break;
      case 'DELETE':
        {
          if (
            payload.operation !== 'DELETE' ||
            typeof payload.old_record !== 'object' ||
            payload.old_record === null ||
            payload.table !== 'kanban_cards'
          )
            return;
          const oldCard = payload.old_record as Card;
          update(d => {
            const cat = d.boards[oldCard.board_id]?.categories.find(
              i => i.id === oldCard.category_id
            );
            if (!cat) return d;
            const cI = cat.cards.findIndex(c => c.id === oldCard.id);
            if (cI !== -1) cat.cards.splice(cI, 1);
            return d;
          });
        }
        break;
      default:
        break;
    }
  }

  function handleMembershipRevoked(boardId: string) {
    removedFromBoardHandler?.(boardId);
    update(d => {
      delete d.boards[boardId];
      return d;
    });
  }

  function handleMembershipGranted(boardId: string) {
    fetchBoard(boardId).then(() => addedToBoardHandler?.(boardId));
  }

  // --- Expose store API ---
  return {
    subscribe,
    fetchBoard,
    fetchCategory,
    fetchAll,
    createBoard,
    updateBoardName,
    deleteBoard,
    createCategory,
    // updateCategory,
    deleteCategory,
    createCard,
    updateCard,
    deleteCard,
    addMember,
    removeMember,
    realtime: {
      board: boardUpdateRealtime,
      category: categoryUpdateRealtime,
      card: cardUpdateRealtime,
      handleMembershipRevoked,
      handleMembershipGranted
    },
    setAddedToBoardHandler,
    setRemovedFromBoardHandler
  };
}

export const kanban = createKanbanStore();
