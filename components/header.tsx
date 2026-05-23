import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { getCurrentUser, hasAnyRole, ADMIN_ROLES, BRANCH_ROLES } from "@/lib/auth/current-user";

/**
 * Site header. Server component — re-renders with auth state on each request.
 *
 * Nav links are role-aware so franchisees don't see admin links and vice versa.
 * Phase 2.10 may move full nav to a sidebar; for MVP the header is enough.
 */
export async function Header() {
  const t = await getTranslations("app");
  const navT = await getTranslations("nav");
  const user = await getCurrentUser();

  const showAdminNav = hasAnyRole(user, ADMIN_ROLES);
  const showBranchNav = hasAnyRole(user, BRANCH_ROLES);
  const showAnyNav = Boolean(user && (showAdminNav || showBranchNav));

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link
            href={user ? "/dashboard" : "/"}
            className="focus-visible:ring-ring rounded text-base font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {t("name")}
          </Link>

          {user ? (
            <nav aria-label={navT("primary")} className="hidden items-center gap-1 sm:flex">
              <HeaderLink href="/dashboard">{navT("dashboard")}</HeaderLink>
              {showAnyNav ? <HeaderLink href="/branches">{navT("branches")}</HeaderLink> : null}
              {showAdminNav ? (
                <HeaderLink href="/franchisees">{navT("franchisees")}</HeaderLink>
              ) : null}
            </nav>
          ) : null}
        </div>

        <nav aria-label={navT("account")} className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}
