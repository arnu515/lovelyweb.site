import { captureException } from '@sentry/sveltekit';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ parent, params: { orgId } }) => {
  const data = await parent();
  const { supabase } = data;
  const orgListPromise = supabase
    .from('organisations')
    .select('id, name, plan')
    .then(({ data: orgList, error: orgError }) => {
      if (orgError) {
        captureException(orgError, { tags: { supabase: 'organisations' } });
        error(500, { message: orgError.message });
      }
      return orgList;
    });
  const { data: org, error: orgError } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', orgId)
    .maybeSingle();
  if (orgError) {
    captureException(orgError, { tags: { supabase: 'organisations' } });
    error(500, { message: orgError.message });
  }
  if (!org) error(404, "Organisation not found, or your don't have access to it.");

  return { org, orgList: orgListPromise };
};
