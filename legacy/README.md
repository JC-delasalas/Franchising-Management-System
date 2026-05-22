# `legacy/` — Archived Pre-Rebuild Codebase

This directory holds the entire previous Vite/React/Supabase codebase, archived during the May 2026 rebuild to Next.js + Supabase.

**Nothing in here is active code.** It's preserved as reference material — visual designs, prior business logic, schema patterns we want to remember, and historical context. The active codebase lives at the repo root (Next.js App Router structure, created in PLAN.md Phase 0).

---

## Authority

When `legacy/` and the active spec disagree, the spec wins. Always:

1. [`/Franchise.md`](../Franchise.md) — canonical product spec
2. [`/CLAUDE.md`](../CLAUDE.md) — AI assistant operating rules
3. [`/PLAN.md`](../PLAN.md) — rebuild roadmap

If a feature exists in `legacy/` but is not in `Franchise.md`, **it is not part of the MVP**. Either ignore it, or open a scope-change discussion to promote it.

---

## What lives where

### `legacy/business-documentation/`
The original business-rules / business-scenarios / executive-business-plan tree. **Superseded by `Franchise.md`**. Useful only as inspiration for future-phase features. Do not treat as requirements.

### `legacy/src/`
The previous React app — full of pages, components, hooks, services, contexts.

**Useful for**:
- Visual design reference (port shadcn customizations from `legacy/src/components/ui/`)
- Tailwind theme tokens (work alongside `legacy/configs/tailwind.config.ts` and `legacy/src/index.css`)
- Layout patterns (header, sidebar, dashboard shells)
- Brand language, copy patterns, error messages

**Do NOT port wholesale**:
- API layer (`legacy/src/api/`) — tied to old Supabase project, wrong RBAC model
- Services (`legacy/src/services/`) — out-of-scope features (POS, suppliers, IAM)
- Pages for non-MVP modules: shopping cart, checkout, supplier portals, POS-integrated order flow, IAM management UI, product catalog, payment methods, brand microsite

### `legacy/supabase/`, `legacy/database/`
Migrations, schema dumps, and RLS policies for the **abandoned** Supabase project `ktugncuiwjoatopnialp`. The schema reflects a much larger feature set than `Franchise.md` allows (application scoring, ABC inventory, multi-tier order approvals, etc.).

**Do not** apply these to the new project `egucihmwendiaaoskpno`. The new schema is written fresh per `PLAN.md` Phase 1.

### `legacy/docs/`
~40 historical docs covering the prior codebase's architecture, audits, and fix logs. Reference for "how was this thought about before". Not authoritative.

### `legacy/reports/`
~26 root-level `*.md` files from the prior project: audit summaries, deployment verifications, fix logs, logo verification checklists, phase completion notes. Pure history.

### `legacy/scripts/`
Data-seeding and repair scripts. Most reference the abandoned project `ktugncuiwjoatopnialp` directly. Do not run.

### `legacy/configs/`
The previous Vite-era build configuration:
- `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `eslint.config.js`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `components.json` (shadcn config), `index.html`
- `package.json`, `package-lock.json`, `bun.lockb`
- `vercel.json`

Useful for stealing specific config snippets (Tailwind colors, shadcn aliases). The Next.js scaffold (Phase 0) creates fresh equivalents.

### `legacy/misc/`
`terminal`, `test-franchisor-apis.js`, `database_critical_fixes.sql` — odd one-off files that don't belong in any other category.

---

## Quick rule

> If you're about to copy code from `legacy/`, ask: *"Does this map to a section of `Franchise.md`?"* If no — don't copy.
