import { getTranslations } from "next-intl/server";

/**
 * Phase 0 placeholder home page.
 *
 * Real landing UI lands in Phase 2 once auth + RBAC ship. For now this
 * confirms the scaffold renders, styling is wired, and next-intl is
 * resolving translations server-side.
 */
export default async function Home() {
  const app = await getTranslations("app");
  const phase0 = await getTranslations("phase0");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl flex-col items-start justify-center gap-4 px-6 py-16">
      <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
        {phase0("label")}
      </p>
      <h1 className="text-4xl font-bold tracking-tight">{app("name")}</h1>
      <p className="text-muted-foreground text-lg">
        {app("tagline")} {app("shortDescription")}
      </p>
      <p className="text-muted-foreground text-sm">{phase0("description")}</p>
    </main>
  );
}
