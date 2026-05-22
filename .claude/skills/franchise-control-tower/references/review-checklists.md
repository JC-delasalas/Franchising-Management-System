# Review Checklists

> Use the relevant checklist on every review. If a box can't be ticked, that's a blocker — explain why.

---

## 1. PR review (any code change)

### Scope
- [ ] Change traces to a section in `Franchise.md`
- [ ] If not in `Franchise.md`, the PR description explains why it's still in scope
- [ ] Not pulling in a deferred Phase 4+ feature (POS, inventory, ABC, application scoring, mobile, etc.)

### Schema & RLS
- [ ] Every new table has an RLS policy in the same migration
- [ ] Policies cover `SELECT`, `INSERT`, `UPDATE`, `DELETE` (or explicitly omit with a comment)
- [ ] `SECURITY DEFINER` functions explicitly revoke EXECUTE from `anon`/`authenticated` unless intentionally public
- [ ] No table is purely role-string-based — uses the `user_roles` model
- [ ] Cross-tenant test exists: Franchisee A cannot see Franchisee B's rows

### Audit
- [ ] Mutations on Critical Business Entities (sales reports, royalties, invoices, payments, compliance records, documents, branches, franchisees, user_roles) write to `audit_log`
- [ ] No silent updates — every status transition logged
- [ ] No hard deletes on CBEs — soft delete only

### Royalty & billing (if touched)
- [ ] `base_royalty` and `transaction_royalty` remain separate
- [ ] Invoice rendering itemizes all fee categories
- [ ] Zero-value lines still render
- [ ] Mandatory footer present on every invoice surface (PDF, email, UI)
- [ ] Invoice numbering follows `INT-YYYY-NNNNNN`
- [ ] No BIR-regulated terminology misused

### User-facing copy
- [ ] No shaming language (see `references/ph-domain-context.md`)
- [ ] Strings go through `next-intl`
- [ ] Error states tell the user how to resolve, not just what failed
- [ ] Hard news (suspension, contract issues) routed via human workflow, not system finality

### Engineering hygiene
- [ ] TypeScript strict — no `any` without a comment
- [ ] Forms validate via zod
- [ ] Server Actions used for mutations (no client-side writes to Supabase)
- [ ] Service role key not exposed to client (no `NEXT_PUBLIC_*` containing secrets)
- [ ] Accessible: form inputs labeled, interactive elements have names, focus order sensible
- [ ] Tests added for new business logic
- [ ] Conventional Commits used

### Performance
- [ ] No N+1 queries in list views (use joins or Supabase `select` with relations)
- [ ] Large lists paginated or virtualized
- [ ] Server Components used where possible; "use client" justified when present

---

## 2. Migration review (Supabase SQL)

- [ ] File named with timestamp prefix per `supabase/migrations/` convention
- [ ] Idempotent where possible (`create table if not exists`, `create policy if not exists`)
- [ ] Reversible (down migration or documented manual rollback)
- [ ] Run `list_tables` + `get_advisors` after applying — both clean
- [ ] No `drop table` on a populated CBE without explicit user approval
- [ ] All new tables: RLS enabled + policies defined in same migration
- [ ] All new functions: `security invoker` unless `security definer` is deliberate AND `execute` revoked from `anon`/`authenticated`
- [ ] Audit trigger attached if table is a CBE
- [ ] Indexes added for foreign keys and common query patterns
- [ ] Foreign keys use `on delete restrict` or `on delete set null`, not `cascade`, on CBEs (prevents accidental data loss)

---

## 3. Module design review (before code)

- [ ] Maps to a numbered section of `Franchise.md §Core Modules`
- [ ] Lists every entity it introduces or modifies
- [ ] States the RBAC per entity (which roles get C/R/U/D/A)
- [ ] States the audit-logged actions
- [ ] States the status workflow with explicit transitions
- [ ] States the manual override path (with reason field)
- [ ] Lists PH-specific considerations (permits, payment methods, language)
- [ ] Lists edge cases: bounced check, late submission, corrected report, lost document
- [ ] Defines exports (CSV/PDF) if applicable
- [ ] Defines reminders/notifications and their cadence

---

## 4. Copy / content review

- [ ] Tone is supportive, not punitive
- [ ] Status words from approved list ("overdue", "needs review", "please submit", "pending", "in progress", "completed")
- [ ] Avoids: "violator", "non-compliant offender", "failed", "rejected" (use "needs revision" or "needs follow-up" instead)
- [ ] BIR-regulated terminology only used in "we don't generate these" context
- [ ] Error messages explain *what to do next*
- [ ] Hard outcomes (suspension, account close) go through human approval workflow
- [ ] Filipino translation reviewed by a Filipino speaker before launch

---

## 5. RBAC change review

- [ ] Falls within the 8 canonical roles — no ad-hoc role added
- [ ] Doesn't blur Finance / Operations / Franchisee boundaries
- [ ] RLS policy updated alongside any new permission grant
- [ ] Tests cover: intended role can act, adjacent role cannot escalate, cross-tenant isolation holds
- [ ] If a role gains access to financial data, audit log access policy updated to match

---

## 6. Pre-Phase / pre-feature gate

Before starting work on any new module:

- [ ] User has approved the module is "next" per `PLAN.md`
- [ ] Module design doc passes checklist 3 above
- [ ] Open questions on the module are resolved or explicitly deferred
- [ ] Dependencies on earlier modules are done (e.g. Auth before Sales Reports)
- [ ] You have a rough estimate (days) and have flagged if it's > what `PLAN.md` allocated

---

## 7. Pre-launch gate (Phase 3 polish)

- [ ] All 10 MVP modules functional end-to-end
- [ ] Playwright suite covers each MVP user story
- [ ] axe-core in every E2E test, no critical violations
- [ ] `get_advisors` security + performance scans clean
- [ ] Cross-franchisee isolation tested on every CBE table
- [ ] Sentry error rate < 0.1% in pre-prod load test
- [ ] PWA installable, offline shell works for read paths
- [ ] Filipino translation complete for franchisee-facing UI
- [ ] PDF royalty statements render correctly with mandatory footer
- [ ] CSV exports work for Finance + Operations + Admin
- [ ] RUNBOOK.md covers deploy, rollback, on-call escalation
- [ ] At least 2 real franchisees have done a usability test (catch pakikisama violations early)
- [ ] LCP < 2s, INP < 200ms on representative slow connection
