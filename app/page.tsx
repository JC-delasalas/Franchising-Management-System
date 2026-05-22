/**
 * Phase 0 placeholder home page.
 *
 * Real landing UI lands in Phase 2 once auth + RBAC ship. For now this just
 * confirms the scaffold renders and styling is wired.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-4 px-6 py-16">
      <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
        Phase 0 — Foundation
      </p>
      <h1 className="text-4xl font-bold tracking-tight">FranchiseHub</h1>
      <p className="text-muted-foreground text-lg">
        Franchise control tower for Philippine franchisors. Branches, sales reports, royalties,
        compliance, documents, and support — in one place.
      </p>
      <p className="text-muted-foreground text-sm">
        Scaffold live. App, auth, and dashboards arrive in Phase 1–2 per{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">PLAN.md</code>.
      </p>
    </main>
  );
}
