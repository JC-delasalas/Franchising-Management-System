import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser, hasAnyRole } from "@/lib/auth/current-user";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default async function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getTranslations("branches");

  const supabase = await createSupabaseServerClient();
  const { data: branch } = await supabase.from("branches").select("*").eq("id", id).maybeSingle();

  if (!branch) notFound();

  const canEdit = hasAnyRole(user, ["super_admin", "head_office_admin"]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/branches" className="text-muted-foreground text-sm hover:underline">
        ← {t("backToList")}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{branch.name}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{branch.code}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(branch.status as BranchStatus)}>
            {t(`statusValue.${branch.status}`)}
          </Badge>
          {canEdit ? (
            <Link href={`/branches/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
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
          <Field label={t("address")} value={branch.address} />
          <Field label={t("city")} value={branch.city} />
          <Field label={t("province")} value={branch.province} />
          <Field label={t("region")} value={branch.region} />
          <Field label={t("openingDate")} value={branch.opening_date} />
          <Field label={t("contactPerson")} value={branch.contact_person} />
          <Field label={t("contactPhone")} value={branch.contact_phone} />
        </CardContent>
      </Card>

      {branch.notes ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{branch.notes}</p>
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
