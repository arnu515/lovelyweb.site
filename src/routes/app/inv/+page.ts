import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { captureException } from "@sentry/sveltekit";

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();

  const {count, error: orgError} = await data.supabase.from("organisations_users").select("*", { count: 'exact', head: true }).eq("user_id", data.auth.user.id).limit(1)
  if (orgError) {
    captureException(orgError, { tags: { supabase: 'organisations' }})
    error(500, { message: orgError.message });
  }

  const invitesPromise = data.supabase.from("org_invites")
    .select("message, org_id, invitee, created_at, organisations ( name, description, link, users!organisations_owner_id_fkey ( name, avatar_url ) )")
    .eq("invitee", data.auth.user.id)
    .then(({data: invites, error: invErr}) => {
      if (invErr) {
        captureException(invErr, { tags: { supabase: 'org_invites' }})
        error(500, { message: invErr.message });
      }
      return invites
    })

  return {
    noOrgs: count === 0,
    invites: invitesPromise
  }
}
