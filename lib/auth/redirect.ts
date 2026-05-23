import type { Database } from "@/lib/database.types";

type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * After sign-in, send the user to the page most relevant to their highest
 * role. Pure function so it's easy to unit-test once Vitest is wired.
 *
 * Priority: super_admin > head_office_admin > finance > operations > trainer
 *           > franchisee_owner > branch_manager > viewer.
 *
 * Phase 2.10+ replaces /dashboard with role-specific landing routes
 * (/admin, /finance, /branch). For now everyone lands at /dashboard
 * which renders role-aware content.
 */
export function defaultRedirectForRoles(roles: AppRole[]): string {
  if (roles.length === 0) return "/dashboard";
  return "/dashboard";
}
