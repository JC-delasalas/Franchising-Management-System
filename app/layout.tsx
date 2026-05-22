import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FranchiseHub",
    template: "%s — FranchiseHub",
  },
  description:
    "Franchise control tower for Philippine franchisors. Manage branches, sales reports, royalties, compliance, documents, and support requests in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
