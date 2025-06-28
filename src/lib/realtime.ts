import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { kanban } from './stores/kanban';

const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export function kanbanBoardMemberships(orgId: string, userId: string) {
  if (!isBrowser()) return;
  const memberships = supabase
    .channel(`kanban-board-membership:${orgId}:${userId}`, {
      config: { private: true }
    })
    .on('broadcast', { event: '*' }, console.log)
    .subscribe();
  return () => supabase.removeChannel(memberships);
}

export function kanbanBoard(boardId: string, userId: string) {
  if (!isBrowser()) return;
  const cat = supabase
    .channel(`kanban-cat:${boardId}`, {
      config: { private: true }
    })
    .on('broadcast', { event: '*' }, console.log)
    .subscribe();
  const cards = supabase
    .channel(`kanban-cards:${boardId}`, {
      config: { private: true }
    })
    .on('broadcast', { event: '*' }, e =>
      kanban.realtime.card(e.event, e.payload, userId)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(cat);
    supabase.removeChannel(cards);
  };
}
