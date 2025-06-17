import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Database } from './database.types'

export const createSupabaseLoadClient = (fetch: typeof globalThis.fetch) => {
  return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch,
    },
    cookies: {
      get(key) {
        if (!isBrowser()) {
          return undefined
        }
        return document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1]
      },
      set(key, value, options) {
        if (!isBrowser()) {
          return
        }
        document.cookie = `${key}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge}` : ''}`
      },
      remove(key, options) {
        if (!isBrowser()) {
          return
        }
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      },
    },
  })
}

export const createSupabaseClient = () => {
  return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
}