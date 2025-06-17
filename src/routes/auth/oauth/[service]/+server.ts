import { error, redirect,  } from "@sveltejs/kit"
import type {RequestHandler} from "./$types"
import type { Provider } from "@supabase/supabase-js"

const PROVIDERS: Provider[] = [ 'github' ]

export const GET: RequestHandler = async ({ params: { service }, url, locals: { supabase }}) => {
  if (!PROVIDERS.includes(service as Provider)) error(404, "Not Found")
  const next = url.searchParams.get('next')
  const nextUrl = new URL(next || '/', url.origin)
  const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
    provider: service as Provider,
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
