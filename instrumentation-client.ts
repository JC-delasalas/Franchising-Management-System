/**
 * Sentry client-side init. Runs in the browser.
 *
 * Skipped entirely if NEXT_PUBLIC_SENTRY_DSN is unset — app keeps working,
 * just without Sentry's error capture.
 */
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Adjust before launch: 1.0 captures every transaction (good for low
    // traffic / pre-launch); lower to 0.1 once we have real volume.
    tracesSampleRate: 1.0,
    // PII off by default per CLAUDE.md "no overcollection" rule.
    sendDefaultPii: false,
    // Session replay disabled for MVP — adds bundle weight and privacy
    // surface area. Revisit when we have real users to debug.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

// Next.js 15+ hook for capturing client-side router transitions.
export const onRouterTransitionStart = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? Sentry.captureRouterTransitionStart
  : undefined;
