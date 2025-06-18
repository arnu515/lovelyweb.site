import { createServerClient } from '@supabase/ssr'
import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"

const supabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (c) => {
        c.forEach(({name, value, options}) => event.cookies.set(name, value, { ...options, path: '/' }))
      }
    }
  });

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    if (!session) return { session: null, user: null }
    const { data: { user } } = await event.locals.supabase.auth.getUser()
    if (!user) return { session: null, user: null }
    const { data: profile }= await event.locals.supabase.from("users").select("*").eq("id", user.id).single()
    if (!profile) return { session: null, user: null }
    return { session, user: { ...user, ...profile } }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}

const authGuard: Handle = async ({ event, resolve }) => {
  const session = await event.locals.getSession()
  event.locals.auth = session
  
  // TODO: use a separate subdomain?
  if (event.url.pathname.startsWith('/app') && !session)
    throw redirect(303, '/auth')

  return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard)
