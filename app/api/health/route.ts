import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Liveness probe. Returns 200 if the app process is alive. Does not check
 * downstream dependencies (Supabase, etc.) — keep it cheap.
 *
 * Use Vercel monitoring or Sentry cron checks to ping this. Real DB health
 * lives at /api/health/deep (Phase 2 — once we have meaningful queries).
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "unknown",
    },
    { status: 200 },
  );
}
