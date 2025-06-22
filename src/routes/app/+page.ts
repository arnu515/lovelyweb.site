import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { captureException } from "@sentry/sveltekit";

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();

  const {data: org, error: orgError} = await data.supabase.from("organisations").select("id").limit(1).maybeSingle()
  if (orgError) {
    captureException(orgError, { tags: { supabase: 'organisations' }})
    error(500, { message: orgError.message });
  }
  if (org) redirect(303, '/app/' + org.id)
}
