# CLAUDE.md — Guidance for AI coding assistants on this repo

> Read this file first, every session. If it conflicts with anything else, escalate to the user — don't guess.

---

## What this project is

A franchise management system for Philippine franchisors. One platform to replace the chaos of Messenger + Excel + Google Drive for managing branches, sales reports, royalties, compliance, documents, support tickets, and training.

**It is not an ERP, POS, accounting system, or BIR-accredited invoicing platform.** It is the franchise control layer that sits between head office and franchisees.

## Source of truth, in order

1. **`Franchise.md`** — the product spec. This is canonical.
2. **`PLAN.md`** — the implementation roadmap and current phase.
3. **`legacy/`** — the entire previous Vite/React codebase, archived during the rebuild. Reference only. Subdirectories:
   - `legacy/business-documentation/` — old business docs (not requirements)
   - `legacy/src/` — old UI/UX, preserved for design reference (port shadcn customizations and Tailwind tokens from here)
   - `legacy/supabase/`, `legacy/database/`, `legacy/scripts/` — old project's schema and scripts (tied to abandoned project `ktugncuiwjoatopnialp` — do not reuse)
   - `legacy/docs/`, `legacy/reports/`, `legacy/configs/`, `legacy/misc/` — assorted historical artifacts
   
   If you find yourself building something from `legacy/` that isn't in `Franchise.md`, stop and ask.

## How to talk to the user

Style: **conversational-professional with direct pushback when something is wrong.** Specifically:

- Clear and practical
- Bullets and checklists over prose
- Decision + one-line why, not essays
- Challenge bad assumptions directly
- Don't over-explain obvious things
- Don't flatter weak ideas
- Flag risks early: scope creep, compliance ambiguity, overengineering

## Code comments

- Short
- Comment **business rules**, not syntax
- Comment anywhere a future dev could accidentally violate franchise, royalty, audit, or permission logic
- Skip the "increments counter by 1" type noise

## PR descriptions

Use this structure every time:

```
## Summary
## What changed
## Why
## Tests/checks
## Risks/notes
```

## Commit messages

**Conventional Commits.** Examples:

- `feat: add branch management module`
- `feat: implement royalty invoice generation`
- `fix: prevent franchisee access to other branch documents`
- `chore: archive legacy business documentation`
- `docs: add franchise MVP product spec`
- `refactor: separate finance and operations permissions`

---

## Constitutional rules (NEVER violate without explicit user approval)

These come from the user's explicit "NOT do" list. Treat each as a hard architectural constraint, not a preference.

1. **No silent edits to brand-critical data.** Branches must not freely edit product prices, recipes, approved suppliers, promo mechanics, discounts, brand assets, operating procedures, or customer-facing terms. Allow branch-level *requests* that require head office approval.

2. **No automatic legal/financial finality.** The system never auto-declares: final royalty liability, contract breach, tax payable, franchise termination, penalty imposition, or BIR compliance status. It **flags issues and creates review workflows** instead.
   - Bad: *"Branch is non-compliant. Auto-charge penalty."*
   - Good: *"Branch missed required report. Create notice for admin review."*

3. **Stay in MVP scope. Don't drift toward ERP.** No payroll, full accounting, CRM, HRIS, procurement, POS, LMS, legal-doc automation, advanced BI, or AI forecasting in MVP. Build the franchise control layer first.

4. **Never bypass BIR-accredited or compliant systems.** The system does not generate official tax invoices/ORs, modify transaction records without audit trail, delete sales records, backdate invoices, allow unlogged voids, hide discounts/refunds, or produce "clean" reports for audits. Talk about BIR carefully — invoice/OR/sales-invoice/POS-receipt are not interchangeable terms and have specific tax meanings.

5. **No overcollection of personal data.** Collect only what the business case requires. Default to less.

6. **No cross-franchisee data exposure.** RLS at the database is mandatory on every table that touches franchisee data. Test it.

7. **Don't rely only on manual reporting forever.** MVP accepts manual sales entry, but the architecture must leave room for POS integration. Manual entry needs proof uploads, approval, and audit logs.

8. **Don't punish without context.** Detection without support is hostile. Every non-compliance UI should show the path to resolution, not just the violation.

9. **Manual overrides exist, but never silently.** Allow admin overrides with a required reason field and full audit trail.

---

## Philippine domain context (the bits a generic franchise template would miss)

### Words carry tax weight
"Invoice", "official receipt", "sales invoice", and "POS receipt" each have specific tax implications. Internal billing documents (royalty, marketing fee) are fine to generate. Customer-facing tax documents are not. Be careful with phrasing — avoid casual claims like "not BIR-regulated".

### Payment proof is operational, not just nice-to-have
Franchisees pay royalties via bank transfer, GCash, Maya, or over-the-counter deposits. The system must support: proof-of-payment upload, reference number capture, payment method tagging, finance review. Don't assume payment processor API integration on day one.

### Permits are annual and missing them hurts
Mayor's Permit / Business Permit renewal usually happens in January. Missed renewals cause penalties. Compliance module needs: annual renewal reminders, expiry dates, branch-level permit tracking.

### LGU rules vary. Don't hard-code one checklist.
Common documents: Mayor's Permit, Barangay Clearance, BIR 2303, Fire Safety Inspection Certificate, Sanitary Permit, lease contract. **But each LGU has variants.** Compliance checklists must be configurable per brand, branch, city, or region.

### Filipino business culture is relationship-sensitive
Pakikisama and face-saving are real. The system must not shame. Use: "overdue", "needs review", "please submit". Never: "violator", "non-compliant offender", "in violation".

### Manual exceptions are normal
Some approvals happen via call, chat, or in person. The system needs: admin notes, attachments on approvals, full approval history, "manual override with reason" — never silent overrides.

### Royalty disputes come from unclear sales basis
Always show explicitly: gross sales, net sales, less discounts, less refunds. Itemize every fee — royalty, marketing, penalties, adjustments, previous balance. One opaque "Total: ₱X" is a dispute generator.

### Franchisees may not be tech-savvy
Franchisee UI must stay simple: submit sales, upload proof, view royalty, complete checklist, open ticket, read announcements. No enterprise-style dashboards on franchisee side in MVP.

### Many franchisees still operate via Messenger/Viber/Sheets
The system must accept uploads of payment proof, sales proof, permit docs. Don't assume clean API integrations exist on day one.

### Data Privacy Act (RA 10173) applies
The franchisor is the Personal Information Controller. The platform is a Personal Information Processor. Reasonable protection is required, accountability stays with the controller. Design for this from day one — not a Phase 3 retrofit.

---

## Canonical roles (8, fixed)

| Role | Scope |
|---|---|
| Super Admin | Tenant + system-level config. Rare actual use. |
| Head Office Admin | Day-to-day franchisor operations across all branches |
| Finance | Royalties, payments, invoices, financial exports |
| Operations | Compliance, audits, branch performance, corrective actions |
| Trainer | Training materials, completion tracking, knowledge base authoring |
| Franchisee Owner | Owns one or more branches; sees only their branches |
| Branch Manager | Day-to-day branch ops; scoped to assigned branch(es) |
| Viewer | Read-only; used for accountants, area managers, auditors |

Permission separation matters. Don't blur Finance, Operations, and Franchisee access — that's a common foot-gun in franchise systems.

---

## Critical business rules (enforce in code)

- **Royalty stacking**: transaction-based fees are **additive** on top of monthly tier minimums. Royalty record stores `base_royalty` and `transaction_royalty` separately; invoice sums them.
- **Royalty itemization**: invoices show royalty fee, marketing fee, penalties, adjustments, previous balance as separate lines. Never one opaque total.
- **Invoice scope**: internal billing only. Every generated invoice has a footer marker: *"Internal billing document — for franchisor/franchisee royalty reconciliation. Not a BIR Official Receipt or Sales Invoice."* Internal invoice numbering must not mimic BIR series conventions.
- **Approval timeouts**: in MVP, missed approval windows leave the request **pending**. No auto-escalation. (Add an escalation engine in Phase 4 if needed.)
- **Audit logs**: applied to sales reports, royalty computations, payments, compliance records, documents, branch information, franchisee records, and user permissions. Immutable after 30 days.
- **RLS**: on every table touching franchisee data, without exception. New tables = new RLS policy in the same PR.
- **SECURITY DEFINER functions**: must explicitly revoke EXECUTE from `anon` and `authenticated`, unless the function is intentionally public. (One advisor warning already fires today on the empty project — fix it before populating.)

---

## Tech stack

| Concern | Tool |
|---|---|
| Framework | Next.js 15, App Router, React Server Components by default |
| Hosting | Vercel |
| DB & Auth | Supabase (project ref `egucihmwendiaaoskpno`) |
| DB client | `@supabase/ssr` server-side, typed via `generate_typescript_types` |
| UI | shadcn/ui + Radix + Tailwind |
| Forms | react-hook-form + zod |
| Server state | TanStack Query (client) + RSC fetch (server) |
| Email | Resend + React Email |
| Payments | Stripe; PayMongo for PHP (GCash/Maya) when added |
| Storage | Supabase Storage |
| PWA | Serwist |
| i18n | next-intl |
| Errors | Sentry |
| Testing | Vitest (unit) + Playwright (E2E) |
| A11y | eslint-plugin-jsx-a11y + axe-core in Playwright |
| CI | GitHub Actions: lint, typecheck, test, build, preview deploy |
| Pre-commit | husky + lint-staged |

## Always-on engineering rules

- TypeScript `strict: true`. No `any` without a comment explaining why.
- Every new table = RLS policy in the same migration.
- Every mutation that touches a Critical Business Entity (sales report, royalty, payment, compliance record, document, branch, franchisee, permissions) = audit log row.
- Every user-facing string is translatable (`next-intl`), even if only EN is shipped first.
- A11y: every interactive element has accessible name; every form input has associated label; color contrast meets WCAG AA.
- Server Actions for mutations; never call Supabase from client components for writes.
- Never commit `.env`. Use `.env.local` (already gitignored via `*.local`). Service role key stays server-side only — never in any `NEXT_PUBLIC_*` variable.
- Before any DDL or data-modifying SQL: run `list_tables` and `get_advisors` first. Confirm with user before applying.

## When in doubt

Ask. Don't infer requirements from old `business-documentation/`. Don't expand MVP scope. Don't ship without RLS. Don't generate copy that could shame a franchisee.
