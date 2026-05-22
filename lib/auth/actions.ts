"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/auth/schemas";

/**
 * Result type for auth actions. Returns plain serialisable shape so it can
 * cross the RSC boundary back to client forms.
 */
export type AuthActionResult = { ok: true } | { ok: false; error: string };

/**
 * Sign in with email + password. Re-validates with zod server-side.
 *
 * Per CLAUDE.md "no overcollection" + supportive tone rules: error
 * messages never reveal whether the email exists.
 */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please check your email and password and try again." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Generic — don't leak account existence.
    return { ok: false, error: "Sign-in failed. Please check your credentials." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Sign up with email + password + full name.
 *
 * Supabase sends a confirmation email; until they click the link, the
 * session is not active. handle_new_user() trigger auto-creates the
 * `public.profiles` row on auth.users insert.
 *
 * Note: this just creates the user. Role assignment (linking to a
 * franchisor, granting Branch Manager / Franchisee Owner / etc.) is a
 * separate admin action — see Phase 2.4+.
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    // First validation error wins for the user-facing message.
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const origin = (await headers()).get("origin") ?? "";

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: "Sign-up could not be completed. Please try again." };
  }

  return { ok: true };
}

/**
 * Sign out and clear the session cookie. Redirects to the home page.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
