import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();
  if (!data.auth.session) redirect(303, '/');
  await data.supabase.auth.signOut();
  redirect(303, '/');
};
