import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";

/**
 * Site header. Server component — fetches translations on the server.
 *
 * Phase 0: brand + theme toggle. Authenticated nav (role-scoped sidebar,
 * user menu, notifications) arrives in Phase 2 once auth + RBAC ship.
 */
export async function Header() {
  const t = await getTranslations("app");

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="focus-visible:ring-ring rounded text-base font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {t("name")}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
