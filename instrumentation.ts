/**
 * Next.js instrumentation — runs once per server runtime.
 *
 * Used to bootstrap Sentry. We initialise it lazily so the app boots
 * fine without a DSN configured; once `NEXT_PUBLIC_SENTRY_DSN` is set,
 * Sentry takes over error reporting automatically.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Sentry captures errors from React Server Components in App Router. This
// export is the supported hook (added in Next.js 15).
export { captureRequestError as onRequestError } from "@sentry/nextjs";
