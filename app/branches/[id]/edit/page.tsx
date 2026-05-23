import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAnyRole } from "@/lib/auth/current-user";
import { BranchForm } from "@/components/branches/branch-form";
import type { BranchStatus } from "@/lib/branches/schemas";

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAnyRole(["super_admin", "head_office_admin"]);
  const t = await getTranslations("branches");

  const supabase = await createSupabaseServerClient();
  const [{ data: branch }, { data: franchisors }] = await Promise.all([
    supabase.from("branches").select("*").eq("id", id).maybeSingle(),
    supabase.from("franchisors").select("id, name").order("name"),
  ]);

  if (!branch) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("editTitle")}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{branch.name}</p>
      <div className="mt-6">
        <BranchForm
          mode="edit"
          franchisors={franchisors ?? []}
          initial={{
            id: branch.id,
            franchisor_id: branch.franchisor_id,
            name: branch.name,
            code: branch.code,
            address: branch.address,
            region: branch.region,
            province: branch.province,
            city: branch.city,
            opening_date: branch.opening_date,
            status: branch.status as BranchStatus,
            contact_person: branch.contact_person,
            contact_phone: branch.contact_phone,
            notes: branch.notes,
          }}
        />
      </div>
    </main>
  );
}
