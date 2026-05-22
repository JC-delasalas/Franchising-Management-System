import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "FranchiseHub",
    template: "%s — FranchiseHub",
  },
  description:
    "Franchise control tower for Philippine franchisors. Manage branches, sales reports, royalties, compliance, documents, and support requests in one place.",
  applicationName: "FranchiseHub",
  authors: [{ name: "FranchiseHub" }],
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-background text-foreground min-h-screen antialiased")}>
        {/* Skip-to-content for keyboard / screen-reader users.
            Hidden until focused, then appears at top-left. WCAG 2.4.1. */}
        <a
          href="#main"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to main content
        </a>
        <div id="main">{children}</div>
        {/* Vercel Analytics + Speed Insights — no-op outside Vercel deployments
            and configurable via the Vercel dashboard. No env vars needed. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
