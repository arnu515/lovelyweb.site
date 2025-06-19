import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ parent }) => {
  const data = await parent();
  if (!data.auth.session || !data.auth.user) redirect(303, '/auth');
  // doing this destructuring to ensure that typescript infers that
  // data.auth.(session|user) are not null.
  return {
    supabase: data.supabase,
    auth: data.auth
  };
};
