import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { captureException } from "@sentry/sveltekit";

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();

  const {data: org, error: orgError} = await data.supabase.from("organisations_users").select("organisation_id", { count: 'exact', head: true }).eq("user_id", data.auth.user.id).limit(1).maybeSingle()
  if (orgError) {
    captureException(orgError, { tags: { supabase: 'organisations' }})
    error(500, { message: orgError.message });
  }
  if (org) redirect(303, '/app/' + org.organisation_id)
  else redirect(303, '/app/inv')
}
