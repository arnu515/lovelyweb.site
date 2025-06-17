import { createSupabaseLoadClient } from '$lib/supabase'
import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const supabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseLoadClient(event.fetch)

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    },
  })
}

const authGuard: Handle = async ({ event, resolve }) => {
  const session = await event.locals.getSession()
  
  if (event.url.pathname.startsWith('/app')) {
    if (!session) {
      throw redirect(303, '/auth')
    }
  }

  if (event.url.pathname === '/auth') {
    if (session) {
      throw redirect(303, '/app')
    }
  }

  return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard)