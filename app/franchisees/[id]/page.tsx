import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser, hasAnyRole } from "@/lib/auth/current-user";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default async function FranchiseeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getTranslations("franchisees");

  const supabase = await createSupabaseServerClient();
  const { data: franchisee } = await supabase
    .from("franchisees")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!franchisee) notFound();

  const canEdit = hasAnyRole(user, ["super_admin", "head_office_admin"]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/franchisees" className="text-muted-foreground text-sm hover:underline">
        ← {t("backToList")}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{franchisee.legal_name}</h1>
          {franchisee.business_entity_name ? (
            <p className="text-muted-foreground mt-1 text-sm">{franchisee.business_entity_name}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={renewalVariant(franchisee.renewal_status as RenewalStatus)}>
            {t(`renewalValue.${franchisee.renewal_status}`)}
          </Badge>
          {canEdit ? (
            <Link
              href={`/franchisees/${id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              {t("edit")}
            </Link>
          ) : null}
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label={t("territory")} value={franchisee.territory} />
          <Field label={t("contactNumber")} value={franchisee.contact_number} />
          <Field label={t("email")} value={franchisee.email} />
          <Field label={t("contractStart")} value={franchisee.contract_start_date} />
          <Field label={t("contractEnd")} value={franchisee.contract_end_date} />
        </CardContent>
      </Card>

      {franchisee.notes ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{franchisee.notes}</p>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs tracking-wide uppercase">{label}</p>
      <p className="mt-0.5 text-sm">{value ? value : "—"}</p>
    </div>
  );
}
