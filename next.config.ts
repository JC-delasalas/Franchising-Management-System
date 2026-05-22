import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Strict mode catches React anti-patterns in dev. Off in production by
  // default (Next disables React.StrictMode for prod builds automatically).
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
