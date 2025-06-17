import { error, redirect } from "@sveltejs/kit"
import type {RequestHandler} from "./$types"

export const GET: RequestHandler = async ({ params: { service }, url, locals: { supabase }}) => {
  const next = url.searchParams.get('next')
  const nextUrl = new URL(next || '/', url.origin)
  const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
    provider: service,
    options: {
      queryParams: {
        next: url.origin === nextUrl.origin ? nextUrl.pathname : '/'
      },
      redirectTo: `${url.origin}/auth/callback`
    }
  })
  if (oauthErr) 
    error(500, oauthErr.message)
  redirect(303, data.url)
}
