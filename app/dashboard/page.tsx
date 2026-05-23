import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireUser, hasAnyRole, ADMIN_ROLES, BRANCH_ROLES } from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Role-aware dashboard. Phase 2.10 will split this into dedicated
 * /admin, /finance, /branch, /franchisee routes; for now everyone lands
 * here and sees the cards relevant to their roles.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const t = await getTranslations("dashboard");

  const isAdmin = hasAnyRole(user, ADMIN_ROLES);
  const isBranchUser = hasAnyRole(user, BRANCH_ROLES);

  // Quick counts for admins. Only one round-trip — counts use head: true.
  const supabase = await createSupabaseServerClient();
  const [branchCount, franchiseeCount] = isAdmin
    ? await Promise.all([
        supabase
          .from("branches")
          .select("id", { count: "exact", head: true })
          .is("archived_at", null),
        supabase
          .from("franchisees")
          .select("id", { count: "exact", head: true })
          .is("archived_at", null),
      ])
    : [{ count: null }, { count: null }];

  const displayName = user.profile?.full_name?.trim() || user.email || "";

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("welcome")}
          {displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          {user.roles.length === 0
            ? t("noRoleAssigned")
            : t("rolesSummary", { count: user.roles.length })}
        </p>
        {user.roles.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {user.roles.map((r, i) => (
              <Badge key={`${r.role}-${i}`} variant="secondary">
                {t(`role.${r.role}`)}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {sp.notice === "forbidden" ? (
        <p role="alert" className="bg-muted text-muted-foreground mt-6 rounded-md p-3 text-sm">
          {t("notice.forbidden")}
        </p>
      ) : null}
      {sp.notice === "no_franchisor" ? (
        <p role="alert" className="bg-muted text-muted-foreground mt-6 rounded-md p-3 text-sm">
          {t("notice.noFranchisor")}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin ? (
          <>
            <DashboardCard
              href="/branches"
              title={t("cards.branches.title")}
              description={t("cards.branches.description")}
              metric={branchCount.count ?? 0}
              metricLabel={t("cards.branches.metricLabel")}
            />
            <DashboardCard
              href="/franchisees"
              title={t("cards.franchisees.title")}
              description={t("cards.franchisees.description")}
              metric={franchiseeCount.count ?? 0}
              metricLabel={t("cards.franchisees.metricLabel")}
            />
          </>
        ) : null}

        {isBranchUser ? (
          <DashboardCard
            href="/branches"
            title={t("cards.myBranches.title")}
            description={t("cards.myBranches.description")}
          />
        ) : null}

        <DashboardCard
          href="#"
          title={t("cards.salesReports.title")}
          description={t("cards.salesReports.description")}
          comingSoon
        />
        <DashboardCard
          href="#"
          title={t("cards.royalties.title")}
          description={t("cards.royalties.description")}
          comingSoon
        />
        <DashboardCard
          href="#"
          title={t("cards.compliance.title")}
          description={t("cards.compliance.description")}
          comingSoon
        />
        <DashboardCard
          href="#"
          title={t("cards.tickets.title")}
          description={t("cards.tickets.description")}
          comingSoon
        />
      </div>

      <p className="text-muted-foreground mt-12 text-xs">{t("phase2Note")}</p>
    </main>
  );
}

function DashboardCard({
  href,
  title,
  description,
  metric,
  metricLabel,
  comingSoon,
}: {
  href: string;
  title: string;
  description: string;
  metric?: number;
  metricLabel?: string;
  comingSoon?: boolean;
}) {
  const inner = (
    <Card className={comingSoon ? "opacity-60" : "transition-shadow hover:shadow-md"}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          {comingSoon ? <Badge variant="outline">Coming soon</Badge> : null}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {metric !== undefined ? (
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">{metric}</p>
          {metricLabel ? <p className="text-muted-foreground mt-1 text-xs">{metricLabel}</p> : null}
        </CardContent>
      ) : null}
    </Card>
  );

  if (comingSoon) return inner;
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {inner}
    </Link>
  );
}
