import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type AppRole = Database["public"]["Enums"]["app_role"];

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: { full_name: string | null; locale: string | null } | null;
  roles: { role: AppRole; franchisor_id: string | null }[];
  franchisorIds: string[];
};

/**
 * Resolve the current user + profile + role assignments in one call.
 *
 * Cached per request via React's `cache()` so multiple Server Components
 * in the same render don't trigger extra Supabase round-trips.
 *
 * Returns null when no session exists. Use `requireUser()` when a route
 * must redirect to /sign-in for anonymous visitors.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Parallel reads — profile + roles share the user_id.
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("full_name, locale").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role, franchisor_id").eq("user_id", user.id),
  ]);

  const franchisorIds = Array.from(
    new Set(
      (roles ?? [])
        .map((r) => r.franchisor_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  );

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
    roles: roles ?? [],
    franchisorIds,
  };
});

/**
 * Server-side gate: returns the current user, or redirects to /sign-in.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/**
 * Server-side gate: requires the current user to hold ANY of the given roles
 * within ANY franchisor. Redirects to /dashboard with a flag for unauthorised.
 *
 * Use sparingly — RLS at the database is the real gate. This is a UX shortcut
 * to avoid rendering empty pages for users who'd see nothing anyway.
 */
export async function requireAnyRole(roles: AppRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  const hasRole = user.roles.some((r) => roles.includes(r.role));
  if (!hasRole) redirect("/dashboard?notice=forbidden");
  return user;
}

export function hasRole(user: CurrentUser | null, role: AppRole): boolean {
  return Boolean(user?.roles.some((r) => r.role === role));
}

export function hasAnyRole(user: CurrentUser | null, roles: AppRole[]): boolean {
  return Boolean(user?.roles.some((r) => roles.includes(r.role)));
}

export const ADMIN_ROLES: AppRole[] = [
  "super_admin",
  "head_office_admin",
  "finance",
  "operations",
  "trainer",
];

export const BRANCH_ROLES: AppRole[] = ["franchisee_owner", "branch_manager"];
