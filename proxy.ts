import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware. Runs on every request matched by `config.matcher`.
 *
 * Phase 0: only refreshes the Supabase session cookie. Role-based redirects
 * (e.g. "franchisees can't visit /admin/*") are added later in Phase 2 when
 * the `user_roles` table exists.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - any file with an extension (e.g. .svg, .png — covers /public/*)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
