import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { captureException } from '@sentry/sveltekit';

export const load: PageLoad = async ({ parent, params: { orgId } }) => {
  const { supabase, auth } = await parent();
  
  if (!auth.user) {
    throw error(401, 'Unauthorized');
  }

  // Fetch kanban boards
  const kanbanBoardsPromise = supabase
    .from('kanban_boards')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .then(({ data: boards, error: boardsError }) => {
      if (boardsError) {
        captureException(boardsError, { tags: { supabase: 'kanban_boards' } });
        console.error('Error fetching kanban boards:', boardsError);
        return [];
      }
      return boards || [];
    });

  // Fetch notebooks
  const notebooksPromise = supabase
    .from('notebooks')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .then(({ data: notebooks, error: notebooksError }) => {
      if (notebooksError) {
        captureException(notebooksError, { tags: { supabase: 'notebooks' } });
        console.error('Error fetching notebooks:', notebooksError);
        return [];
      }
      return notebooks || [];
    });

  return {
    kanbanBoards: kanbanBoardsPromise,
    notebooks: notebooksPromise
  };
};