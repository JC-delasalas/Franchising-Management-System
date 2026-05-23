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
import type { BranchStatus } from "@/lib/branches/schemas";

function statusVariant(status: BranchStatus) {
  switch (status) {
    case "active":
      return "success" as const;
    case "pending_opening":
      return "warning" as const;
    case "inactive":
    case "closed":
      return "outline" as const;
  }
}

export default async function BranchesPage() {
  const user = await requireUser();
  const canCreate = hasAnyRole(user, ["super_admin", "head_office_admin"]);

  const t = await getTranslations("branches");
  const supabase = await createSupabaseServerClient();
  const { data: branches } = await supabase
    .from("branches")
    .select("id, name, code, city, province, status, archived_at")
    .is("archived_at", null)
    .order("name", { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
        </div>
        {canCreate ? (
          <Link href="/branches/new" className={buttonVariants()}>
            {t("addBranch")}
          </Link>
        ) : null}
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {!branches || branches.length === 0 ? (
            <EmptyState
              title={t("emptyTitle")}
              description={
                canCreate
                  ? t("emptyDescriptionAdmin")
                  : hasAnyRole(user, ADMIN_ROLES)
                    ? t("emptyDescriptionViewer")
                    : t("emptyDescriptionBranch")
              }
              action={
                canCreate ? (
                  <Link href="/branches/new" className={buttonVariants()}>
                    {t("addBranch")}
                  </Link>
                ) : null
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("code")}</TableHead>
                  <TableHead>{t("location")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead aria-label={t("actions")} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="font-mono text-xs">{b.code}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {[b.city, b.province].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(b.status as BranchStatus)}>
                        {t(`statusValue.${b.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/branches/${b.id}`}
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
