import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAnyRole } from "@/lib/auth/current-user";
import { FranchiseeForm } from "@/components/franchisees/franchisee-form";
import type { RenewalStatus } from "@/lib/franchisees/schemas";

export default async function EditFranchiseePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAnyRole(["super_admin", "head_office_admin"]);
  const t = await getTranslations("franchisees");

  const supabase = await createSupabaseServerClient();
  const [{ data: franchisee }, { data: franchisors }] = await Promise.all([
    supabase.from("franchisees").select("*").eq("id", id).maybeSingle(),
    supabase.from("franchisors").select("id, name").order("name"),
  ]);

  if (!franchisee) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("editTitle")}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{franchisee.legal_name}</p>
      <div className="mt-6">
        <FranchiseeForm
          mode="edit"
          franchisors={franchisors ?? []}
          initial={{
            id: franchisee.id,
            franchisor_id: franchisee.franchisor_id,
            legal_name: franchisee.legal_name,
            business_entity_name: franchisee.business_entity_name,
            contact_number: franchisee.contact_number,
            email: franchisee.email,
            territory: franchisee.territory,
            contract_start_date: franchisee.contract_start_date,
            contract_end_date: franchisee.contract_end_date,
            renewal_status: franchisee.renewal_status as RenewalStatus,
            notes: franchisee.notes,
          }}
        />
      </div>
    </main>
  );
}
