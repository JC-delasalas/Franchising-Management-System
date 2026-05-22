import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Phase 2.1 dashboard placeholder. Confirms session is live and shows the
 * current user. Real role-scoped dashboards arrive in Phase 2.10 once the
 * full schema seed + role assignment flow lands.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const t = await getTranslations("dashboard");

  // Fetch the matching profile row (auto-created by handle_new_user trigger).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, locale")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("welcome")}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("signedInAs")}{" "}
        <span className="text-foreground font-medium">{profile?.full_name ?? user.email}</span>
      </p>
      <p className="text-muted-foreground mt-6 text-sm">{t("phase2Note")}</p>
    </main>
  );
}
