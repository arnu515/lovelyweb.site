import { get, readable, writable, type Readable, type Writable } from 'svelte/store';
import { page } from '$app/stores';
import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';
import { toast } from 'svelte-sonner';

const supabase = createBrowserClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

type ChatOverview = Database['public']['Functions']['get_chat_overview']['Returns'][number]
export const chatOverview = (() => {
  let dataMap: Record<string, ChatOverview> = {}
  let data: ChatOverview[] = []
  let orgId: string | null = null;

  const { set, subscribe, update } = writable<
    { data: typeof data, dataMap: typeof dataMap } | null
  >(null, () => {
    page.subscribe(page => {
      if (!isBrowser()) return
      if (orgId === page.params.orgId) set({ data, dataMap })
      else {
        orgId = page.params.orgId
    supabase.rpc('get_chat_overview', { org_id: orgId }).then(({ data: overview, error }) => {
      if (error) {
        captureException(error, { tags: { supabase: 'get_chat_overview' } });
        toast.error('Could not get chat overview', { description: error.message });
      } else {
        data = overview
        dataMap = Object.fromEntries(data.map((i) =>
          ([i.slug, i])
        ))
        set({ data, dataMap });
      }
    });
      }
    })
  })
  return { subscribe }
})()

