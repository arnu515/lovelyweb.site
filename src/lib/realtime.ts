import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { kanban } from './stores/kanban';
import type { Database } from './database.types';

const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export function kanbanBoardMemberships(orgId: string, userId: string) {
  if (!isBrowser()) return;
  const memberships = supabase
    .channel(`kanban-board-membership:${userId}`, {
      config: { private: true }
    })
    .on('broadcast', { event: 'INSERT' }, e => {
      if (
        e.payload.operation !== 'INSERT' ||
        typeof e.payload.record !== 'object' ||
        e.payload.record === null ||
        e.payload.table !== 'kanban_board_members'
      )
        return;
      const mem = e.payload.record as Database['public']['Tables']['kanban_board_members']['Row']
      if (mem.user_id !== userId) return;
      kanban.realtime.handleMembershipGranted(mem.board_id)
    })
    .on('broadcast', { event: 'DELETE' }, e => {
      if (
        e.payload.operation !== 'DELETE' ||
        typeof e.payload.old_record !== 'object' ||
        e.payload.old_record === null ||
        e.payload.table !== 'kanban_board_members'
      )
        return;
      const mem = e.payload.old_record as Database['public']['Tables']['kanban_board_members']['Row']
      if (mem.user_id !== userId) return;
      kanban.realtime.handleMembershipRevoked(mem.board_id)
    })
    .subscribe();
  return () => supabase.removeChannel(memberships);
}

export function kanbanBoard(boardId: string) {
  if (!isBrowser()) return;
  const cat = supabase
    .channel(`kanban-cat:${boardId}`, {
      config: { private: true }
    })
    .on('broadcast', { event: '*' }, e =>
      kanban.realtime.category(e.event, e.payload)
    )
    .subscribe();
  const cards = supabase
    .channel(`kanban-cards:${boardId}`, {
      config: { private: true }
    })
    .on('broadcast', { event: '*' }, e =>
      kanban.realtime.card(e.event, e.payload)
    )
    .subscribe();

  return () => {
    cat.unsubscribe().then(d => console.log('cat channel unsub', d));
    cards.unsubscribe().then(d => console.log('cards channel unsub', d));
  };
}
