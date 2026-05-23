"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAnyRole } from "@/lib/auth/current-user";
import { franchiseeCreateSchema, franchiseeUpdateSchema } from "@/lib/franchisees/schemas";

export type FranchiseeActionResult = { ok: true; id: string } | { ok: false; error: string };

function nullify<T extends string | undefined | null>(value: T): string | null {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

export async function createFranchiseeAction(formData: FormData): Promise<FranchiseeActionResult> {
  await requireAnyRole(["super_admin", "head_office_admin"]);

  const parsed = franchiseeCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("franchisees")
    .insert({
      franchisor_id: parsed.data.franchisor_id,
      legal_name: parsed.data.legal_name,
      business_entity_name: nullify(parsed.data.business_entity_name),
      contact_number: nullify(parsed.data.contact_number),
      email: nullify(parsed.data.email),
      territory: nullify(parsed.data.territory),
      contract_start_date: nullify(parsed.data.contract_start_date),
      contract_end_date: nullify(parsed.data.contract_end_date),
      renewal_status: parsed.data.renewal_status,
      notes: nullify(parsed.data.notes),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not create the franchisee. Please try again." };
  }

  revalidatePath("/franchisees");
  return { ok: true, id: data.id };
}

export async function updateFranchiseeAction(formData: FormData): Promise<FranchiseeActionResult> {
  await requireAnyRole(["super_admin", "head_office_admin"]);

  const parsed = franchiseeUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("franchisees")
    .update({
      legal_name: parsed.data.legal_name,
      business_entity_name: nullify(parsed.data.business_entity_name),
      contact_number: nullify(parsed.data.contact_number),
      email: nullify(parsed.data.email),
      territory: nullify(parsed.data.territory),
      contract_start_date: nullify(parsed.data.contract_start_date),
      contract_end_date: nullify(parsed.data.contract_end_date),
      renewal_status: parsed.data.renewal_status,
      notes: nullify(parsed.data.notes),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: "Could not update the franchisee." };

  revalidatePath("/franchisees");
  revalidatePath(`/franchisees/${parsed.data.id}`);
  return { ok: true, id: parsed.data.id };
}

export async function archiveFranchiseeAction(id: string): Promise<FranchiseeActionResult> {
  await requireAnyRole(["super_admin", "head_office_admin"]);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("franchisees")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: "Could not archive the franchisee." };

  revalidatePath("/franchisees");
  redirect("/franchisees");
}
