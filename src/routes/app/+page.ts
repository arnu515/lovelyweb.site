import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { captureException } from "@sentry/sveltekit";

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();

  const {count: orgCount, error: orgError} = await data.supabase.from("organisations").select("id", { count: "exact", head: true })
  if (orgError) {
    captureException(orgError, { tags: { supabase: 'organisations' }})
    error(500, { message: orgError.message });
  }
  if (orgCount !== 0) redirect(303, '/app/0')
}
