import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Refresh the Supabase auth session on every request and attach updated
 * cookies to the response. Called from the root `middleware.ts`.
 *
 * This keeps the session alive without requiring a full sign-in on every
 * page load. Returns the (possibly modified) NextResponse so the caller
 * can layer additional checks (e.g. role-based redirects) on top.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the session — this refreshes the JWT if it's about to expire and
  // writes new cookies to `supabaseResponse` via the setAll handler above.
  await supabase.auth.getUser();

  return supabaseResponse;
}
