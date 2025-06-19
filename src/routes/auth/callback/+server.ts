import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const nextUrl = new URL(next, url.origin);
      redirect(303, url.origin === nextUrl.origin ? nextUrl.pathname : '/');
    }
    return new Response(
      `An error occured\n\nCould not sign you in: ${error.message}`
    );
  }
  redirect(303, '/auth');
};
