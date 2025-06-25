import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';
import { createClient } from '@supabase/supabase-js';
import { json, type RequestHandler } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { z } from 'zod/v4';

const addSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), content: z.string().trim().max(1000) })
]);

function parseChatSlug(
  chatSlug: string | undefined
): [boolean, string] | undefined {
  let isGroup = false;
  switch (chatSlug?.charAt(0)) {
    case '@':
      break;
    case '-':
      isGroup = true;
      break;
    default:
      return undefined;
  }
  return [isGroup, chatSlug.substring(1)];
}

const supabaseSR = createClient<Database>(
  PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

export const POST: RequestHandler = async ({
  request,
  locals: {
    supabase,
    auth: { user }
  },
  params: { orgId, chatId: chatSlug }
}) => {
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const chatSlugParsed = parseChatSlug(chatSlug);
  if (!orgId || !chatSlugParsed)
    return json({ error: 'Page not found' }, { status: 404 });
  let [isGroup, chatId] = chatSlugParsed;
  try {
    const data = addSchema.parse(await request.json());
    const { count: orgCount, error: orgErr } = await supabase
      .from('organisations_users')
      .select('user_id', { count: 'exact', head: true })
      .eq('organisation_id', orgId)
      .eq('user_id', user.id);
    if (orgErr) {
      captureException(orgErr, { tags: { supabase: 'organisations_users' } });
      return json({ error: orgErr.message }, { status: 500 });
    }
    if (orgCount !== 1) return json({ error: 'Forbidden' }, { status: 403 });
    if (isGroup) {
      const { count: grpCount, error: grpErr } = await supabase
        .from('chat_group_members')
        .select('user_id', { count: 'exact', head: true })
        .eq('group_id', chatId)
        .eq('user_id', user.id);
      if (grpErr) {
        captureException(grpErr, { tags: { supabase: 'chat_group_members' } });
        return json({ error: grpErr.message }, { status: 500 });
      }
      if (grpCount !== 1) return json({ error: 'Forbidden' }, { status: 403 });
    } else {
      const { data: user, error: usrErr } = await supabase
        .from('users')
        .select('id')
        .eq('username', chatId)
        .single();
      if (usrErr) {
        captureException(usrErr, { tags: { supabase: 'users' } });
        return json({ error: usrErr.message }, { status: 500 });
      }
      chatId = user.id;
    }
    if (data.type === 'text') {
      const id = nanoid();
      const { error } = await (isGroup
        ? supabaseSR.from('group_messages').insert({
            id,
            by_id: user.id,
            data: data.content,
            group_id: chatId,
            org_id: orgId,
            typ: 'text'
          })
        : supabaseSR.from('messages').insert({
            id,
            from_id: user.id,
            data: data.content,
            to_id: chatId,
            org_id: orgId,
            typ: 'text'
          }));
      if (error) {
        captureException(error, {
          tags: { supabase: isGroup ? 'group_messages' : 'messages' }
        });
        return json({ error: error.message }, { status: 500 });
      }
      return json({ id }, { status: 201 });
    }
    throw new Error('unreachable');
  } catch {
    return json({ error: 'Invalid request body' }, { status: 422 });
  }
};
