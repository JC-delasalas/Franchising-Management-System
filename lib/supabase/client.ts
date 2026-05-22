import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Supabase browser client — for Client Components.
 *
 * Only use this for read subscriptions (realtime channels) or auth UI flows.
 * Mutations should go through Server Actions calling `createSupabaseServerClient`.
 *
 * NEVER expose the SERVICE_ROLE key here. This client uses the public ANON key,
 * which is safe to ship to the browser (RLS enforces row-level access).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
