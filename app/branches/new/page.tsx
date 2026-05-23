import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAnyRole } from "@/lib/auth/current-user";
import { BranchForm } from "@/components/branches/branch-form";

export default async function NewBranchPage() {
  await requireAnyRole(["super_admin", "head_office_admin"]);
  const t = await getTranslations("branches");
  const supabase = await createSupabaseServerClient();

  const { data: franchisors } = await supabase.from("franchisors").select("id, name").order("name");

  if (!franchisors || franchisors.length === 0) {
    // No franchisor exists yet → can't create a branch. Redirect with notice.
    redirect("/dashboard?notice=no_franchisor");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("newTitle")}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{t("newSubtitle")}</p>
      <div className="mt-6">
        <BranchForm mode="create" franchisors={franchisors} />
      </div>
    </main>
  );
}
