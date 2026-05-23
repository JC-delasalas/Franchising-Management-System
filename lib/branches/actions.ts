"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAnyRole } from "@/lib/auth/current-user";
import { branchCreateSchema, branchUpdateSchema } from "@/lib/branches/schemas";

export type BranchActionResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Normalise optional form strings to null so empty inputs don't become
 * empty strings in the DB. Zod accepts "" via or(literal("")) above.
 */
function nullify<T extends string | undefined | null>(value: T): string | null {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

export async function createBranchAction(formData: FormData): Promise<BranchActionResult> {
  // Gate: only head_office_admin or super_admin may create branches.
  // RLS would reject anyway, but failing fast here gives a useful error.
  await requireAnyRole(["super_admin", "head_office_admin"]);

  const parsed = branchCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("branches")
    .insert({
      franchisor_id: parsed.data.franchisor_id,
      name: parsed.data.name,
      code: parsed.data.code.toUpperCase(),
      address: nullify(parsed.data.address),
      region: nullify(parsed.data.region),
      province: nullify(parsed.data.province),
      city: nullify(parsed.data.city),
      opening_date: nullify(parsed.data.opening_date),
      status: parsed.data.status,
      contact_person: nullify(parsed.data.contact_person),
      contact_phone: nullify(parsed.data.contact_phone),
      notes: nullify(parsed.data.notes),
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error:
        error?.code === "23505"
          ? "A branch with this code already exists in the franchisor."
          : "Could not create the branch. Please try again.",
    };
  }

  revalidatePath("/branches");
  return { ok: true, id: data.id };
}

export async function updateBranchAction(formData: FormData): Promise<BranchActionResult> {
  await requireAnyRole(["super_admin", "head_office_admin"]);

  const parsed = branchUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("branches")
    .update({
      name: parsed.data.name,
      code: parsed.data.code.toUpperCase(),
      address: nullify(parsed.data.address),
      region: nullify(parsed.data.region),
      province: nullify(parsed.data.province),
      city: nullify(parsed.data.city),
      opening_date: nullify(parsed.data.opening_date),
      status: parsed.data.status,
      contact_person: nullify(parsed.data.contact_person),
      contact_phone: nullify(parsed.data.contact_phone),
      notes: nullify(parsed.data.notes),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { ok: false, error: "Could not update the branch. Please try again." };
  }

  revalidatePath("/branches");
  revalidatePath(`/branches/${parsed.data.id}`);
  return { ok: true, id: parsed.data.id };
}

/**
 * Soft-archive (constitutional rule: no hard deletes on CBEs — audit
 * retention). Sets archived_at; RLS still filters on status separately.
 */
export async function archiveBranchAction(id: string): Promise<BranchActionResult> {
  await requireAnyRole(["super_admin", "head_office_admin"]);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("branches")
    .update({ archived_at: new Date().toISOString(), status: "inactive" })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Could not archive the branch." };
  }

  revalidatePath("/branches");
  redirect("/branches");
}
