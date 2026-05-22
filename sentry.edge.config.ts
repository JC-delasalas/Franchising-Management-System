/**
 * Sentry edge-runtime init. Runs in Vercel Edge / middleware.
 *
 * Loaded from instrumentation.ts only when NEXT_PUBLIC_SENTRY_DSN is set.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  sendDefaultPii: false,
});
