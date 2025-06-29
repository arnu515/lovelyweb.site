import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { captureException } from '@sentry/sveltekit';

export const load: PageLoad = async ({ parent, params: { orgId, notebookId }, depends }) => {
  const { supabase, auth } = await parent();
  
  if (!auth.user) {
    throw error(401, 'Unauthorized');
  }

  depends(`app:notebook-${notebookId}`)

  // Fetch notebook details
  const notebookPromise = supabase
    .from('notebooks')
    .select('*')
    .eq('id', notebookId)
    .eq('org_id', orgId)
    .single()
    .then(({ data: notebook, error: notebookError }) => {
      if (notebookError) {
        if (notebookError.code === 'PGRST116') {
          throw error(404, 'Notebook not found');
        }
        captureException(notebookError, { tags: { supabase: 'notebooks' } });
        throw error(500, { message: notebookError.message });
      }
      return notebook;
    });

  // Fetch notebook pages
  const pagesPromise = supabase
    .from('notebook_pages')
    .select('*, users!notebook_pages_created_by_fkey(name, avatar_url)')
    .eq('notebook_id', notebookId)
    .order('position', { ascending: true })
    .then(({ data: pages, error: pagesError }) => {
      if (pagesError) {
        captureException(pagesError, { tags: { supabase: 'notebook_pages' } });
        throw error(500, { message: pagesError.message });
      }
      return pages || [];
    });

  return {
    notebook: notebookPromise,
    pages: pagesPromise
  };
};
