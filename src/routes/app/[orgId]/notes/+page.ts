import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { captureException } from '@sentry/sveltekit';

export const load: PageLoad = async ({ parent, params: { orgId } }) => {
  const { supabase, auth } = await parent();
  
  if (!auth.user) {
    throw error(401, 'Unauthorized');
  }

  const notebooksPromise = supabase
    .from('notebooks')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .then(({ data: notebooks, error: notebooksError }) => {
      if (notebooksError) {
        captureException(notebooksError, { tags: { supabase: 'notebooks' } });
        throw error(500, { message: notebooksError.message });
      }
      return notebooks || [];
    });

  return {
    notebooks: notebooksPromise
  };
};