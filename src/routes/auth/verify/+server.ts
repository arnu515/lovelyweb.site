import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const typ = url.searchParams.get('type');
  const token_hash = url.searchParams.get('token_hash');
  const next = url.searchParams.get('next') || '/';
  if (token_hash && typ) {
    const { error } = await supabase.auth.verifyOtp({
      type: typ as EmailOtpType,
      token_hash
    });
    if (!error) {
      const nextUrl = new URL(next, url.origin);
      throw redirect(303, url.origin === nextUrl.origin ? nextUrl.pathname : '/');
    }
    return new Response(
      '<h1>An error occured</h1><p>Could not sign you in</p><p><a href="/auth">Back</a></p>'
    );
  }
  throw redirect(303, '/auth');
};
