/**
 * Sentry server-side init. Runs in the Node runtime.
 *
 * Loaded from instrumentation.ts only when NEXT_PUBLIC_SENTRY_DSN is set,
 * so this module's side effect (Sentry.init) doesn't run without a DSN.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  sendDefaultPii: false,
  // Server errors only — we don't want Sentry to see Supabase service-role
  // keys or franchisee PII in breadcrumbs.
  beforeSend(event) {
    // Strip request headers that might contain Authorization / cookies.
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }
    return event;
  },
});
