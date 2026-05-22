import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback?code=...
 *
 * Supabase email confirmation, OAuth callbacks, and magic-link clicks
 * land here. We exchange the code for a session, then redirect to the
 * dashboard (or to `next` if provided).
 *
 * Failure cases redirect home with no leakage of the error type.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?status=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?status=auth_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
