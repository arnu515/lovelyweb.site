import { createSupabaseLoadClient } from '$lib/supabase'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = createSupabaseLoadClient(fetch)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return {
    supabase,
    session,
  }
}