import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { captureException } from '@sentry/sveltekit';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

const createOrgSchema = z.object({
  plan: z.enum(['free', 'basic', 'pro'], { error: 'Please select a plan' }),
  id: z
    .string()
    .min(4, 'Name must be at least 4 characters')
    .max(255, 'Name must be less than 256 characters')
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9\-]+$/)
    .optional()
    .or(z.literal('')),
  name: z
    .string()
    .min(4, 'Name must be at least 4 characters')
    .max(36, 'Name must be at most 36 characters')
    .trim(),
  link: z.string().url('Must be a valid URL').trim().optional().or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal(''))
});

function generateOrgId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const load: PageServerLoad = async ({ locals: { auth, supabase } }) => {
  if (!auth.session || !auth.user) redirect(303, '/auth');
  // TODO: Prevent creation of organisation any other paid org has no active auto-renewing subscription
  const { count, error: countErr } = await supabase
    .from('organisations')
    .select('id', { count: 'exact', head: true })
    .eq('plan', 'free');
  if (countErr) {
    captureException(countErr, { tags: { supabase: 'organisations' } });
    error(500, { message: countErr.message });
  }
  return { canCreateFreeOrg: count === 0 };
};

export const actions = {
  default: async ({ request, locals: { supabase } }) => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) redirect(303, '/auth');
    const form = await request.formData();
    const parseRes = createOrgSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parseRes.success)
      return fail(400, { error: parseRes.error.issues[0].message });
    const { data: body } = parseRes;

    if (body.plan !== 'free' && !body.id)
      return fail(400, { error: 'Please provide an organisation ID' });

    if (body.plan === 'free') {
      // TODO: Prevent creation of organisation any other paid org has no active auto-renewing subscription
      const { count, error } = await supabase
        .from('organisations')
        .select('id', { count: 'exact', head: true })
        .eq('plan', 'free');
      if (error) {
        captureException(error, { tags: { supabase: 'organisations' } });
        return fail(500, { error: error.message });
      }
      if (count !== 0)
        return fail(400, { error: 'You already have a free organisation.' });
    }

    const supabaseAdmin = createClient(
      PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    const orgId = body.plan === 'free' ? generateOrgId() : body.id;
    const { error } = await supabaseAdmin.from('organisations').insert({
      id: orgId,
      name: body.name,
      owner_id: user.id,
      plan: body.plan,
      description: body.description || null,
      link: body.link || null
    });

    if (error) return fail(500, { error: error.message });
    redirect(303, '/app/' + orgId);
  }
} satisfies Actions;
