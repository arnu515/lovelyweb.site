import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {global: {fetch}})
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {global: {fetch}, cookies: { getAll: () => data.cookies}})

  // TODO: Are we making two duplicate network requests here?
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let profile = null;
  if (user) {
    const { data }= await supabase.from("users").select("*").eq("id", user.id).single()
    profile = data
  }

  return {
    supabase,
    auth: session && user && profile ? { session, user: {...user, ...profile} } : { session: null, user: null },
  }
}
