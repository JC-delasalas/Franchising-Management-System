import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/**
 * Supabase server client — for Server Components, Server Actions, and Route Handlers.
 *
 * Reads/writes auth cookies via Next.js cookies(). Per Franchise.md, all mutations
 * go through server-side code; this is the only Supabase client that should run
 * writes in normal app paths.
 *
 * Uses ANON key only. The SERVICE_ROLE key must never reach a client bundle —
 * if you need elevated access, create a separate admin client in an Edge Function
 * with its own env var, never exposed via NEXT_PUBLIC_*.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — Next.js disallows cookie writes
            // there. Safe to ignore; the middleware refreshes the session.
          }
        },
      },
    },
  );
}
