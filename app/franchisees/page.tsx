import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser, hasAnyRole, ADMIN_ROLES } from "@/lib/auth/current-user";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { RenewalStatus } from "@/lib/franchisees/schemas";

function renewalVariant(status: RenewalStatus) {
  switch (status) {
    case "current":
      return "success" as const;
    case "expiring_soon":
    case "in_renewal":
      return "warning" as const;
    case "expired":
    case "terminated":
      return "outline" as const;
  }
}

export default async function FranchiseesPage() {
  const user = await requireUser();
  const canCreate = hasAnyRole(user, ["super_admin", "head_office_admin"]);
  const t = await getTranslations("franchisees");

  const supabase = await createSupabaseServerClient();
  const { data: franchisees } = await supabase
    .from("franchisees")
    .select("id, legal_name, business_entity_name, territory, renewal_status, contract_end_date")
    .is("archived_at", null)
    .order("legal_name");

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
        </div>
        {canCreate ? (
          <Link href="/franchisees/new" className={buttonVariants()}>
            {t("addFranchisee")}
          </Link>
        ) : null}
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {!franchisees || franchisees.length === 0 ? (
            <EmptyState
              title={t("emptyTitle")}
              description={
                canCreate
                  ? t("emptyDescriptionAdmin")
                  : hasAnyRole(user, ADMIN_ROLES)
                    ? t("emptyDescriptionViewer")
                    : t("emptyDescriptionOwner")
              }
              action={
                canCreate ? (
                  <Link href="/franchisees/new" className={buttonVariants()}>
                    {t("addFranchisee")}
                  </Link>
                ) : null
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("legalName")}</TableHead>
                  <TableHead>{t("businessEntityName")}</TableHead>
                  <TableHead>{t("territory")}</TableHead>
                  <TableHead>{t("renewalStatus")}</TableHead>
                  <TableHead>{t("contractEnd")}</TableHead>
                  <TableHead aria-label={t("actions")} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {franchisees.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.legal_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {f.business_entity_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{f.territory ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={renewalVariant(f.renewal_status as RenewalStatus)}>
                        {t(`renewalValue.${f.renewal_status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {f.contract_end_date ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/franchisees/${f.id}`}
                        className="text-foreground text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {t("view")}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
