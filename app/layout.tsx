import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("nav");

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn("bg-background text-foreground min-h-screen antialiased")}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Skip-to-content for keyboard / screen-reader users.
                Hidden until focused, then appears at top-left. WCAG 2.4.1. */}
            <a
              href="#main"
              className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg"
            >
              {t("skipToContent")}
            </a>
            <Header />
            <div id="main">{children}</div>
          </ThemeProvider>
        </NextIntlClientProvider>
        {/* Vercel Analytics + Speed Insights — no-op outside Vercel deployments. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
