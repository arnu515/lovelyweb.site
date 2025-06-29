import { captureException } from '@sentry/sveltekit';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { invalidate } from '$app/navigation';

export const load: PageLoad = async ({ parent, params: { orgId }, depends }) => {
  depends(`org:${orgId}:members`);
  const {
    supabase,
    auth: { user }
  } = await parent();
  if (!user) redirect(303, '/auth');

  const users = supabase
    .from('organisations_users')
    .select('users ( id, name, avatar_url, username )')
    .eq('organisation_id', orgId)
    .neq('user_id', user.id)
    .then(({ data: users, error: usersErr }) => {
      if (usersErr) {
        captureException(usersErr, { tags: { supabase: 'org_invites' } });
        throw usersErr;
      }
      return users.map(i => i.users);
    });

  // Invalidate chat overview when new chat page loads to ensure fresh data
  invalidate('chat:overview');

  return { users };
};
