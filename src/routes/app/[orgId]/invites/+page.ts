import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { captureException } from '@sentry/sveltekit';

export const load: PageLoad = async ({ parent, depends }) => {
  const {
    supabase,
    auth: { user },
    org
  } = await parent();
  depends(`org:${org.id}:invites`);
  if (org.owner_id !== user.id) error(404, { message: 'Page not found' });

  const invitesPromise = supabase
    .from('org_invites')
    .select(
      'message, org_id, invitee, created_at, users!org_invites_invitee_fkey(name, avatar_url)'
    )
    .eq('org_id', org.id)
    .then(({ data: invites, error: invErr }) => {
      if (invErr) {
        captureException(invErr, { tags: { supabase: 'org_invites' } });
        error(500, { message: invErr.message });
      }
      return invites;
    });

  return { invites: invitesPromise };
};
