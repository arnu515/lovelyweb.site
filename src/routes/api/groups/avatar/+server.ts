import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod/v4';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';

export const POST: RequestHandler = async ({ request, locals: { auth } }) => {
  try {
    const { groupId, imgType } = z
      .object({
        groupId: z.string().trim().min(16).max(16),
        imgType: z.enum(['svg', 'webp']).default('webp')
      })
      .parse(await request.json());
    const supabase = createClient<Database>(
      PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: group, error: gfError } = await supabase
      .from('chat_groups')
      .select('owner_id, org_id')
      .eq('id', groupId)
      .maybeSingle();
    if (gfError) {
      captureException(gfError);
      return json({ error: gfError.message }, { status: 500 });
    }
    if (!group || !auth.user || group.owner_id !== auth.user.id)
      return json({ error: 'Group not found' }, { status: 404 });
    const { data: su, error: suError } = await supabase.storage
      .from('avatars')
      .createSignedUploadUrl(`org/${group.org_id}/group/${groupId}.${imgType}`, {
        upsert: true
      });
    if (suError) {
      captureException(suError);
      return json({ error: suError.message }, { status: 500 });
    }
    return json(su, { status: 200 });
  } catch {
    return json({ error: 'Invalid body' }, { status: 422 });
  }
};
