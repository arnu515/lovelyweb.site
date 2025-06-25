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

type Message = Database['public']['Tables']['messages']['Row'][]
export const messages = {
  _data: new Map<string, Writable<Message | undefined | string>>(),
  _orgId: null as (string | null),
  _alwaysUndefinedStore: readable(undefined),
  removeItem(slug: string) {
    const store = this._data.get(slug)
    store?.set(undefined)
    this._data.delete(slug)
  },
  removeAllData() {
    for (const [_, store] of this._data)
      store.set(undefined);
    this._data.clear()
  },
  fetch(slug: string) {
    const delim = slug.charCodeAt(0)
    if (delim === 64 /* @ */) return this.fetchUser(slug.substring(1))
    if (delim === 45 /* - */) return this.fetchGroup(slug.substring(1))
    else return undefined
  },
  fetchUser(oid: string): Readable<Message | undefined | string> {
    if (!isBrowser()) return this._alwaysUndefinedStore
    const newOrgId = get(page).params.orgId
    if (this._orgId !== newOrgId) {
      this._orgId = newOrgId
      this.removeAllData()
    }
    const slug = '@'+oid
    const store = this._data.get(slug) ?? writable<Message | undefined | string>(undefined)
    const val = get(store)
    if (typeof val !== 'undefined' && typeof val !== 'string') return { subscribe: store.subscribe }
    store.set(undefined)
    supabase.from("messages")
      .select("*")
      .or(`from_id.eq.'${oid}',to_id.eq.'${oid}'`)
      .eq('org_id', newOrgId)
      .then(({ data, error }) => {
        if (error) {
          captureException(error, { tags: { supabase: 'messages' } })
          store.set(error.message)
        } else {
          this._data.set(slug, store)
          store.set(data)
        }
      })
    return { subscribe: store.subscribe }
  },
  fetchGroup(gid: string): Readable<Message | undefined | string> {
    if (!isBrowser()) return this._alwaysUndefinedStore
    const newOrgId = get(page).params.orgId
    if (this._orgId !== newOrgId) {
      this._orgId = newOrgId
      this.removeAllData()
    }
    const slug = '-'+gid
    const store = this._data.get(slug) ?? writable<Message | undefined | string>(undefined)
    const val = get(store)
    if (typeof val !== 'undefined' && typeof val !== 'string') return { subscribe: store.subscribe }
    store.set(undefined)
    supabase.from("group_messages")
      .select("*")
      .eq('group_id', gid)
      .eq('org_id', newOrgId)
      .then(({ data, error }) => {
        if (error) {
          captureException(error, { tags: { supabase: 'messages' } })
          store.set(error.message)
        } else {
          this._data.set(slug, store)
          store.set(data.map(i => ({
            created_at: i.created_at,
            data: i.data,
            edited_at: i.edited_at,
            from_id: i.by_id,
            to_id: i.group_id,
            id: i.id,
            org_id: i.org_id,
            typ: i.typ
          })))
        }
      })
    return { subscribe: store.subscribe }
  },
}
