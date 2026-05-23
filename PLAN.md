# PLAN.md — Implementation Roadmap

> Status: **Pre-flight (not started)**. Last updated after the scoping interview.
> Spec: [`Franchise.md`](./Franchise.md) — source of truth.
> AI guide: [`CLAUDE.md`](./CLAUDE.md) — rules every session must follow.

---

## Working assumptions

- **Developer capacity**: solo, full-time (revise if not — halve all estimates for part-time)
- **MVP target**: 16 weeks from end of Phase 0
- **Backend**: Supabase project `egucihmwendiaaoskpno` (currently empty)
- **Frontend stack**: Next.js 15 App Router (per user decision)
- **Old codebase**: `src/` will be archived to `src.legacy/` on a new branch; selective port of shadcn customizations and Tailwind theme only

---

## Pre-flight checklist

Security hygiene:

- [x] Add `.env` to `.gitignore` (commit `7ad9e4e`)
- [x] `git rm --cached .env` (commit `7ad9e4e`)
- [x] `git rm --cached supabase.exe supabase.tar.gz` (commit `7ad9e4e`)
- [ ] **DEFERRED**: Rotate `ktugncuiwjoatopnialp` keys — superseded by user decision to abandon the project entirely. If the old project still exists in the Supabase dashboard, delete it there to invalidate keys.
- [ ] **DEFERRED**: `git filter-repo --path .env --invert-paths` (purge `.env` from history). Only meaningful after the old keys are invalidated.
- [ ] Remove user-scope Supabase MCP authenticated to `stephen@sigmarpa.com`: `claude mcp remove supabase --scope user` (after confirming with `claude mcp list`)
- [ ] Fix the existing security advisor on `egucihmwendiaaoskpno`: revoke EXECUTE on `public.rls_auto_enable()` from `anon` and `authenticated`, or drop the function entirely if unused

Repo cleanup:

- [x] Create branch `rebuild/next` (currently on it)
- [x] Archive entire pre-rebuild codebase to `legacy/` (commits `8c1f869`, `06aaf19`) — UI/UX design tokens ported before deletion
- [x] **Delete `legacy/` entirely** once design tokens were ported into `app/globals.css`. Repo now contains only the new Next.js codebase + planning docs.

---

## Phase 0 — Foundation (Week 1–2)

**Deliverable**: an empty but production-grade Next.js shell that boots, deploys, and authenticates.

> **Actual stack landed**: Next.js **16.2.6** (newer than originally planned), React **19.2.4**, Tailwind **v4** (CSS-first config via `@theme` in globals.css, no `tailwind.config.ts`), Turbopack dev. Package name `franchisehub`.

- [x] `npx create-next-app@latest` in repo root — TypeScript, Tailwind v4, ESLint, App Router, no src/, `@/*` alias, Turbopack, `--empty` (commit `7b486fe`)
- [x] `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`
- [x] ESLint: `next/core-web-vitals` + `next/typescript` + stricter jsx-a11y rules (no-autofocus, click-events-have-key-events, etc.)
- [x] Design tokens ported into Tailwind v4 `@theme` directive in `app/globals.css` (shadcn-style HSL palette + radius scale + dark mode). **Note**: `#FF6B6B` brand color still needs a contrast review before being adopted as `--primary`; currently the palette uses the neutral shadcn default.
- [x] Full stack installed: `@supabase/ssr`, `@supabase/supabase-js`, `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `next-intl`, `next-themes`, `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@sentry/nextjs`, `resend`, `@react-email/{components,render}`, `serwist`, `@serwist/next`
- [x] Prettier + `prettier-plugin-tailwindcss` (Husky + lint-staged + commitlint still TODO)
- [x] `.github/workflows/ci.yml`: typecheck → lint → format → build
- [x] Supabase server/client/middleware helpers (`lib/supabase/{server,client,middleware}.ts`)
- [x] Root `proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`) — refreshes Supabase session every request
- [x] `/api/health` route
- [x] App layout shell: skip-to-content link (WCAG 2.4.1), real metadata, dark-mode-ready body
- [x] Husky + lint-staged + commitlint (commit `ce97e37`)
- [x] Sentry init (`instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) — lazy, no-op without `NEXT_PUBLIC_SENTRY_DSN` (commit `4353d95`)
- [x] Vercel Analytics + Speed Insights wired into root layout (commit `4353d95`)
- [x] `next-intl` scaffold with `messages/en.json`, `i18n/request.ts`, `NextIntlClientProvider` in layout (commit `1383695`)
- [x] App layout: skip-to-content link, sticky `Header` component, dark-mode `ThemeProvider`, theme toggle. Collapsible sidebar deferred to Phase 2 (waits for role-based nav).
- [ ] Vercel project linked, env vars configured, first preview deploy green — **requires user to run `vercel login` and `vercel link`**

---

## Phase 1 — Schema & RLS (Week 2–3)

**Deliverable**: Supabase schema applied via versioned migrations, RLS on every table, typed client.

> **Status**: ✅ **Schema complete.** 30 tables live on Supabase project `egucihmwendiaaoskpno`, RLS enabled on every one, audit triggers on every Critical Business Entity, search-path-hardened helpers, TypeScript types generated and wired into all three Supabase clients.

Migrations applied (`supabase/migrations/`):

- [x] `20260523000001_foundation` — extensions, audit_log, audit_trigger()
- [x] `20260523000002_tenancy_and_rbac` — franchisors, profiles (auto-create trigger), app_role enum, user_roles, helpers (has_role / current_user_franchisor_ids / is_super_admin)
- [x] `20260523000003_harden_function_search_paths` — closes search_path security warnings
- [x] `20260523000004_franchise_structure` — branches, franchisees, branch_franchisees, contracts, location_assignments, franchisee_owners, current_user_branch_ids() + current_user_franchisee_ids()
- [x] `20260523000005_sales_royalty_billing` — sales_reports + attachments, royalty_policies, royalties (base + transaction split, generated total_due), invoices (INT-YYYY-NNNNNN numbering + mandatory footer), invoice_line_items (itemized), payments (PH methods incl GCash/Maya/OTC), payment_attachments
- [x] `20260523000006_compliance_docs_operations` — compliance_requirements (LGU-configurable), compliance_records, document_types, documents, support_tickets + messages + attachments, announcements, sop_articles, training_modules, training_completions, notifications

RLS pattern verified across all tables:

- [x] `SELECT`: scoped via franchisor_id / branch_id / franchisee_id helpers
- [x] `INSERT/UPDATE/DELETE`: role-gated via `has_role()` + `is_super_admin()`
- [x] No `SECURITY DEFINER` functions exposed to `anon`/`authenticated` (only `handle_new_user`, locked down)
- [x] Audit triggers on franchisors, user_roles, branches, franchisees, branch_franchisees, contracts, location_assignments, franchisee_owners, sales_reports, royalty_policies, royalties, invoices, invoice_line_items, payments, compliance_requirements, compliance_records, documents, support_tickets, announcements, sop_articles, training_modules

Deliverables:

- [x] Migrations versioned in `supabase/migrations/` with descriptive names
- [x] `lib/database.types.ts` generated and committed (56 KB, 1894 lines)
- [ ] Seed script: 1 franchisor, 2 franchisees, 4 branches — deferred to Phase 2.1 commit when we wire it to the auth flow
- [ ] RLS test suite: Vitest / `supabase test db` covering "franchisee A cannot see franchisee B's data" — deferred to Phase 3 polish

---

## Phase 2 — MVP modules (Week 4–14, ~1 week per module)

Built in the priority order from `Franchise.md` § Build Recommendation.

### 2.1 Auth + 8-role RBAC (Week 4)

- [x] Email/password sign-in with zod-validated Server Actions
- [x] Password policy enforced: 12+ chars, mixed case + number + symbol
- [x] Sign-up with email confirmation (Supabase verification email)
- [x] Auth callback route `/auth/callback` exchanging code for session
- [x] Protected `/dashboard` placeholder (server-side `auth.getUser()` gate)
- [x] `UserMenu` in header showing email + sign-out form, or Sign-in link
- [ ] Magic link option (deferred — email/password is enough for MVP)
- [ ] Role assignment UI (Super Admin only) — Phase 2.1b
- [ ] Location assignment UI (Head Office Admin) — Phase 2.1b
- [ ] E2E: each of 8 roles can/cannot do their expected actions — Phase 3 polish

### 2.2 Branch directory (Week 5)

- [x] List branches at `/branches` — server-rendered, RLS-scoped via `branches read scope` policy
- [x] Create branch at `/branches/new` — zod-validated form, head_office_admin or super_admin only
- [x] View branch detail at `/branches/[id]` — full fields, edit link for admins
- [x] Edit branch at `/branches/[id]/edit` — zod-validated update
- [x] Archive (soft-delete) — `archived_at` timestamp, hidden from active lists; CBE audit row preserved
- [x] Status badges (pending_opening / active / inactive / closed) — neutral language per Franchise.md voice rule
- [ ] Filtering by region/province/city/status (basic list works; filters are Phase 3 polish)
- [ ] CSV export (Phase 2.12)

### 2.3 Franchisee profiles (Week 5–6, partial overlap)

- [x] List franchisees at `/franchisees` with renewal status badges
- [x] Create / view / edit / archive — same RLS gate as branches
- [x] Contract start/end dates captured; renewal_status enum (current / expiring_soon / expired / in_renewal / terminated)
- [ ] Assign to branches (many-to-many) — `branch_franchisees` table exists in schema; UI deferred to next module commit
- [ ] Contract renewal warning automation (90/60/30 days out) — Phase 2.5 or 3

### 2.4 Sales reports (Week 6–7)

- Franchisee submission form (simple UI per CLAUDE.md)
- Attach proof images/PDFs (Supabase Storage)
- Status workflow: Draft → Submitted → Under Review → Approved/Rejected
- "Edited After Submission" status preserves prior version (audit)
- Admin review queue with bulk approve
- Daily/weekly/monthly cadence configurable per franchisor

### 2.5 Royalty computation (Week 8)

- Royalty policy configuration (per franchisor or per brand)
- Compute job: on sales-report approval, generate `royalty` record
- Itemized invoice generation (Resend email + downloadable PDF)
- **Footer marker** on every invoice: _"Internal billing document — not a BIR Official Receipt or Sales Invoice"_
- Finance dashboard: pending/paid/overdue by branch
- Payment proof upload + Finance approval
- **No automatic legal finality** — every royalty is reviewable

### 2.6 Compliance checklist (Week 9–10)

- Configurable requirement templates per brand/city/region (no hard-coded list)
- Annual renewal logic (e.g. Mayor's Permit → January reminders)
- Per-branch checklist instance with status workflow
- Email + in-app reminders at 30/14/7/1 days before expiry
- Attachment upload per requirement
- Operations review queue

### 2.7 Document upload (Week 10, overlap with 2.6)

- File upload to Supabase Storage with virus scan (Supabase has built-in)
- Document type taxonomy from `Franchise.md`
- Expiry tracking + reminders
- Soft-delete only (audit)

### 2.8 Support ticketing (Week 11)

- Franchisee submission form (categories from `Franchise.md`)
- Admin queue with assignment, priority, status workflow
- Threaded messages with attachments
- Email notifications to assigned admin and ticket submitter
- SLA tracker (response time targets configurable)

### 2.9 SOP library / knowledge base (Week 12)

- Markdown-authored articles by Head Office Admin or Trainer
- Read access for all roles; edit access for Head Office Admin + Trainer
- Categorization + search
- Announcements feed (homepage of franchisee dashboard)

### 2.10 Admin dashboard (Week 13)

- Role-scoped landing page per role
- Franchisor: portfolio KPIs (reports submitted on time, compliance health, royalties YTD, overdue items)
- Franchisee: my branch status, pending tasks, recent announcements
- Finance: invoices due, payments received, overdue royalties
- Operations: compliance status across branches, open corrective actions

### 2.11 Audit logs (Week 13–14, integrated continuously)

- Triggered automatically from Phase 1 (every CBE mutation logs)
- Admin viewer with filters (user, entity, date range, action type)
- 30-day immutability enforced via row policy

### 2.12 Reports & exports (Week 14)

- CSV export per module (Finance, Operations, Admin)
- PDF royalty statements per franchisee per period
- Monthly summary email to franchisor (Resend scheduled function)

---

## Phase 3 — MVP polish & launch (Week 15–16)

- [ ] **PWA**: Serwist install, manifest with maskable PNG icons (not SVG — Android requirement), offline shell for read-only views, `beforeinstallprompt` custom install button
- [ ] **WCAG 2.1 AA pass**: axe-core in every Playwright test, manual NVDA + VoiceOver test of submit-sales-report and submit-ticket flows, color contrast audit
- [ ] **i18n**: Filipino (Tagalog) translation pass for franchisee-facing screens (admin can stay EN for MVP)
- [ ] **Performance budget**: LCP < 2s, INP < 200ms, TBT < 200ms; route-level bundle audit with `@next/bundle-analyzer`
- [ ] **E2E test suite**: Playwright suite covering each MVP user story from `Franchise.md`
- [ ] **Security review**:
  - [ ] `get_advisors` security + performance scans clean
  - [ ] Manual RLS audit (one test per table verifying cross-tenant isolation)
  - [ ] `npm audit` clean
  - [ ] Sentry error rate < 0.1% in pre-prod load test
- [ ] **Operational docs**: README, ARCHITECTURE.md, RUNBOOK.md (deploy, rollback, oncall), CONTRIBUTING.md
- [ ] **Launch checklist**:
  - [ ] Monitoring dashboards configured (Vercel + Sentry + Supabase)
  - [ ] On-call rotation defined
  - [ ] Rollback plan documented
  - [ ] Smoke test in prod after first deploy

---

## Post-MVP — deferred to Phase 4+ (do not build during MVP)

Pulled from old `business-documentation/` and `Franchise.md` § Future Features. Listed here so they don't disappear:

- POS integration (Square, Toast, Lightspeed, Shopify, Clover)
- Accounting integration (QuickBooks, Xero, FreshBooks)
- Automated royalty billing
- Supplier ordering portal
- Inventory monitoring (with ABC classification — per-franchisor scope)
- Branch audit mobile app (Expo + same Supabase backend)
- Training quizzes
- AI anomaly detection
- Sales forecasting
- Benchmarking dashboards across franchisees
- Automated reminders engine (richer than MVP cron)
- Franchise renewal workflow
- Multi-brand support (consolidated view across brands per franchisor)
- Multi-location analytics
- MFA enforcement for privileged roles
- Approval timeout escalation engine
- Perishable inventory cap (block-then-warn UX, already specced)
- Multi-currency + regional payment processors (PayMongo for GCash/Maya, OVO for ID)
- White-label / multi-tenant for franchise consultants
- AI demand forecasting
- SOC 2 Type II preparation
- Franchise application scoring (100-pt system from old docs — only if explicitly requested)

---

## Risks & mitigations

| Risk                                                        | Mitigation                                                                                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Franchisee adoption resistance (system feels punitive)      | Voice rules in CLAUDE.md; usability test with 2 real franchisees before launch                                                |
| Manual sales entry disputes                                 | Itemized royalty breakdown; proof-of-payment uploads required; full audit trail                                               |
| Role permissions blur (Finance vs Operations vs Franchisee) | 8-role canonical, RLS tested per table, separate dashboards per role                                                          |
| Scope creep toward ERP                                      | This PLAN.md as gate; every new feature must trace to `Franchise.md`; reject otherwise                                        |
| Compliance features confused with legal/tax compliance      | Disclaimer copy on every compliance UI: "tracks operational compliance; not a substitute for legal counsel or BIR compliance" |
| Hard-coded royalty rules                                    | Royalty _policies_ are configurable per franchisor/brand from day one                                                         |
| Weak audit logs eroding trust                               | Audit trigger on every CBE in Phase 1; 30-day immutability; user-visible audit log in admin                                   |
| Pakikisama violations in copy                               | All user-facing strings reviewed against voice rule; lint check (planned Phase 3) flags blacklisted words                     |
| Old `business-documentation/` reintroducing complexity      | Moved to `docs/archive/legacy-business-docs/` in pre-flight; CLAUDE.md instructs to escalate, not import                      |

---

## Definition of Done (MVP)

The 10 six-month success criteria from `Franchise.md` § Six-Month Success Criteria:

- [ ] All active branches listed in the system
- [ ] Franchisees submit sales reports through the platform
- [ ] Royalty computation is visible and reviewable
- [ ] Compliance requirements tracked per branch
- [ ] Expiring permits and documents trigger reminders
- [ ] Support requests tracked with statuses
- [ ] SOPs and announcements centralized
- [ ] Admins can export branch-level reports
- [ ] Franchisees use the system weekly (instrumented via Vercel Analytics)
- [ ] Head office reduces dependence on spreadsheets and chat threads (interview-based metric)

---

## What I do not do without explicit approval

- Run any destructive SQL (`DROP`, `TRUNCATE`, `DELETE` without WHERE) against the Supabase project
- Apply migrations to the remote project without showing the SQL first
- Commit code that disables RLS on any table
- Add features beyond what's in `Franchise.md`
- Modify `Franchise.md` itself
- Push to `main` (only PRs)
- Use `--no-verify` on commits
