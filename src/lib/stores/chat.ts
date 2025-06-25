import { readable } from 'svelte/store';
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

export const chatOverview = readable<
  Database['public']['Functions']['get_chat_overview']['Returns'] | null
>(null, set =>
  page.subscribe(page => {
    if (!isBrowser()) return
    const orgId = page.params.orgId;
    supabase.rpc('get_chat_overview', { org_id: orgId }).then(({ data, error }) => {
      if (error) {
        captureException(error, { tags: { supabase: 'get_chat_overview' } });
        toast.error('Could not get chat overview', { description: error.message });
      } else {
        set(data);
      }
    });
  })
);
