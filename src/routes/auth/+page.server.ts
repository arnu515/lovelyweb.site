import type { Actions } from "./$types";
import { z } from "zod/v4";
import { redirect, fail } from "@sveltejs/kit";
import { md5 } from "$lib/utils";

function getSafeNext(url: URL, fallback = "/app") {
  const next = url.searchParams.get("next");
  if (!next) return fallback;
  try {
    // If new URL(next, url.origin) has the same origin, it's safe
    const dest = new URL(next, url.origin);
    if (dest.origin === url.origin && dest.pathname.startsWith("/")) {
      return dest.pathname + dest.search + dest.hash;
    }
  } catch {
    // Ignore invalid URLs
  }
  return fallback;
}

const steps = ["email", "password", "otp", "profile"] as const;
export type Step = (typeof steps)[number];

const emailSchema = z.email().min(8).max(255).trim();
const passwordSchema = z.string().min(8).max(255);
const otpSchema = z
  .string()
  .regex(/^\d{8}$/, { error: "OTP is an 8-digit number" })
  .length(8, { error: "OTP is 8 characters long" })
  .trim();
const onboardingSchema = z.object({
  name: z.string().min(2).max(255),
  username: z.string().min(4).max(255),
  password: passwordSchema.clone(),
});

export const actions: Actions = {
  default: async ({ request, locals: { supabase }, url }) => {
    const form = await request.formData();
    const step = (form.get("step") || "email") as Step;
    if (!steps.includes(step))
      return fail(400, { step: "email", email: null, error: "Invalid form" });

    const rawEmail = form.get("email")?.toString() || "";
    const emailRes = emailSchema.safeParse(rawEmail);
    if (!emailRes.success)
      return fail(400, {
        step: "email",
        email: rawEmail,
        error: emailRes.error.issues[0]?.message || "Invalid email",
      });
    const email = emailRes.data;
    if (email.endsWith("organised.today"))
      return fail(400, {
        step: "email",
        email,
        error: "Use another email domain!",
      });

    if (step === "email") {
      const { error: existsErr, data: userProvider } = await supabase.rpc(
        "get_user_provider",
        { email },
      );

      if (existsErr)
        return fail(400, { step: "email", email, error: existsErr.message });
      if (userProvider && userProvider !== "password")
        redirect(303, "/auth/oauth/" + userProvider);

      return {
        step: userProvider ? "password" : "profile",
        email,
        error: null,
      };
    } else if (step === "password") {
      const passwordRes = passwordSchema.safeParse(form.get("password"));
      if (!passwordRes.success) {
        return fail(400, {
          step: "password",
          email,
          error:
            passwordRes.error.issues[0]?.message ||
            "Please enter a password (8–255 chars)",
        });
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordRes.data,
      });

      if (signInError)
        if (signInError.code === "email_not_confirmed") {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false,
            },
          });
          if (error)
            return fail(400, {
              step: "password",
              email,
              error: error.message,
            });
          return { step: "otp", email, error: null };
        } else
          return fail(400, {
            step: "password",
            email,
            error: signInError.message,
          });
      redirect(303, getSafeNext(url));
    } else if (step === "otp") {
      const parsed = otpSchema.safeParse(form.get("otp"));
      if (!parsed.success) {
        return fail(400, {
          step: "otp",
          email,
          error: "Please enter a valid OTP code.",
        });
      }
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: parsed.data,
        type: "email",
      });

      if (verifyError) {
        return fail(400, {
          step: "otp",
          email,
          error: verifyError.message,
        });
      }

      redirect(303, getSafeNext(url));
    } else if (step === "profile") {
      const parsed = onboardingSchema.safeParse({
        name: form.get("name"),
        username: form.get("username"),
        password: form.get("password"),
      });

      if (!parsed.success) {
        return fail(400, {
          step: "profile",
          email,
          error: "Please fill in all fields.",
        });
      }

      const avatar_url = `https://www.gravatar.com/avatar/${md5(email)}?s=64&d=identicon`;

      const { error } = await supabase.auth.signUp({
        email,
        password: parsed.data.password,
        options: {
          data: {
            avatar_url,
            name: parsed.data.name,
            username: parsed.data.username,
          },
        },
      });

      if (error) {
        console.log(error);
        return fail(400, {
          step: "profile",
          email,
          error: error.message,
        });
      }

      return { step: "otp", email, error: null };
    }

    // Fallback: show email step
    return {
      step: "email",
      email,
    };
  },
};