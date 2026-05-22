# Anti-patterns — reject on sight

When you see these, push back. Don't just note them — actively recommend the better path and explain the trade-off in one or two lines.

---

## Scope creep

### "Let's add basic inventory while we're at it"

**Why bad**: Inventory is Phase 4+. Adds entities, RBAC complexity, RLS surface area, audit overhead. Drags MVP launch.
**Better**: Defer. Sales reports can capture aggregate inventory adjustments as a single line item if absolutely needed for royalty math. Full inventory waits.

### "Let's score franchise applications now — we already have the rubric"

**Why bad**: Application scoring is Phase 4+. MVP assumes franchisees already onboarded manually. Adding scoring means an applications module, document workflows, scoring engine, decision routing. Massive scope.
**Better**: Manual onboarding by Head Office Admin. Add scoring later.

### "Just a small POS webhook"

**Why bad**: One webhook becomes one integration becomes five. Each POS has its own schema, auth, retry semantics. MVP commitment is manual entry.
**Better**: Phase 4+. If pressure is real, expose a simple `/api/sales-reports/import` JSON endpoint and let the franchisor build their own integration externally.

### "We need a quick payroll module for franchisee staff"

**Why bad**: Payroll has tax implications, contributions (SSS, PhilHealth, Pag-IBIG), pay periods, holiday pay. It's its own product.
**Better**: Out of scope. Forever — or at minimum, never in MVP.

### "Multi-brand support — it's just a brand_id column"

**Why bad**: It's not. Multi-brand means brand-scoped RBAC, brand-scoped RLS on every table, brand-scoped reporting, brand theming, brand-scoped royalty policies. Touches every module.
**Better**: Single brand per franchisor in MVP. Multi-brand is Phase 4+ with a real plan.

---

## Weak RBAC

### "Just use a `role` text column on `users` and check it in app code"

**Why bad**: App code is bypassable. RLS in the database is the only guarantee. Text roles can't represent location scoping. Future role changes mean code changes.
**Better**: `user_roles` table + helper SQL function + RLS policies. Per the 8-role canonical model.

### "Franchisees can see each other's anonymized data for benchmarking"

**Why bad**: Anonymized → re-identifiable in small franchise networks (small N). Cross-franchisee exposure is a constitutional violation regardless of intent.
**Better**: Benchmarking is franchisor-only feature, Phase 4+. Franchisees see only their own data.

### "Branch Manager needs access to franchisee financial data — they ask for it"

**Why bad**: Blurs Finance scope into branch operations. Branch Manager is operational, not financial.
**Better**: Franchisee Owner sees financials of their branches. Branch Manager sees operations. If the user is _both_ (small operation), assign both roles.

### "We can skip RLS on this small lookup table"

**Why bad**: "Lookup table" today, joined to franchisee data tomorrow. Anon access leaks structure even if not data.
**Better**: RLS on everything. Public-read is a policy, not the absence of one.

---

## Poor audit logging

### "We don't need an audit entry for this update — it's just a UI tweak"

**Why bad**: If it changes a Critical Business Entity, it's audit-worthy. "Just a tweak" is how the audit trail develops gaps that come back during disputes.
**Better**: Trigger-based audit on every CBE mutation. No exceptions in code paths.

### "We'll backfill audit logs later"

**Why bad**: Backfills are inferences, not facts. Audit gaps for a period are auditable themselves and erode trust.
**Better**: Audit triggers from the migration that creates the table. Day one.

### "Delete the old audit rows — they're noisy"

**Why bad**: Audit rows are immutable for 30 days minimum. Delete = breach of the constitutional rule.
**Better**: Partition by month, archive cold partitions to cheap storage, but never delete.

### "Soft delete by setting `deleted_at` — no audit row needed"

**Why bad**: Soft delete on a CBE is a state change. State changes are audit-worthy.
**Better**: Soft delete + audit row. Two writes, one trigger.

---

## Vague royalty logic

### "Royalty is gross sales × rate, done"

**Why bad**: Misses marketing fee, adjustments, prior balance, penalties, the multi-mode reality. Will need rewriting in Phase 2.
**Better**: Use the full itemized model from day one — even if some fields are usually zero. See `references/royalty-and-billing.md`.

### "Show the invoice total only — itemization clutters the UI"

**Why bad**: Opaque totals are the #1 cause of royalty disputes. Franchisees call asking "what's this for", Finance loses time.
**Better**: Always itemize. Render zero lines as `₱ 0.00`. Save support tickets.

### "Just collapse `base_royalty` and `transaction_royalty` into one column — it's the same math"

**Why bad**: Audit-relevant separately. A change from base $500 + tx $200 → base $700 + tx $0 has very different meaning even if total is identical.
**Better**: Keep them separate. `total_due` can be a generated column.

### "Round to whole pesos for simplicity"

**Why bad**: Cumulative rounding errors over months become disputes.
**Better**: `numeric(14,2)` throughout. Round only on display.

### "Automatically mark the royalty as final after Finance reviews"

**Why bad**: "Final" implies legal finality. Constitutional rule: no automatic legal/financial finality.
**Better**: Status flow is `computed → reviewed → invoiced`. Even "invoiced" doesn't mean "legally final" — the contract does.

---

## BIR / invoice confusion

### "Let's call our internal royalty document an Official Receipt for the franchisee's accounting"

**Why bad**: OR is BIR-regulated. Calling it OR when it's not is misrepresentation.
**Better**: "Internal billing document". The franchisee uses their own BIR-compliant tools for OR/SI.

### "We'll generate VAT-style invoices since most franchisees are VAT-registered"

**Why bad**: VAT invoice format is regulated. Even formatting-mimicry causes confusion.
**Better**: Internal billing document with clearly different formatting. Mandatory footer reinforces the distinction.

### "Use sequential numbers like `OR-2026-001` for our internal invoices"

**Why bad**: Number format mimics BIR-regulated OR series.
**Better**: `INT-YYYY-NNNNNN`. Visually distinct.

### "We can let franchisees download a 'tax-ready' version of the royalty invoice"

**Why bad**: "Tax-ready" implies regulatory status. Their accountant should classify, not us.
**Better**: Provide the data. Let their accounting system classify.

### "Skip the footer on the PDF — it looks unprofessional"

**Why bad**: Mandatory footer is constitutional. Aesthetics don't override compliance.
**Better**: Design the footer to look intentional and clean — small, gray, bottom-of-page — but always present.

---

## Compliance language

### "System auto-emails: 'Branch [X] is non-compliant'"

**Why bad**: Shaming language, especially in writing, especially copyable to chat — damages relationships.
**Better**: "Reminder: [requirement] is overdue for [branch]. Please submit or contact head office if you need help."

### "Auto-suspend the franchisee account after 3 missed reports"

**Why bad**: Automatic legal/financial finality.
**Better**: Flag for Head Office Admin review. Admin makes the call with full context.

### "Show a red 'VIOLATOR' badge on non-compliant branches in the dashboard"

**Why bad**: Pakikisama violation, even in admin UI (screenshots travel).
**Better**: Neutral status indicator. "Needs follow-up" with a count of open items.

---

## Architectural sloppiness

### "We can hard-code Manila document checklist — most are there"

**Why bad**: LGU rules vary. Hard-coding means rebuild for every new region.
**Better**: Configurable checklist per brand/branch/city/region from day one.

### "Skip i18n for MVP — we're English-only"

**Why bad**: Retro-fitting i18n is painful. Franchisee-facing strings need Filipino at launch.
**Better**: `next-intl` from day one. Ship EN-only initially, but the wiring is there.

### "Let's just use Supabase from the client — it has RLS"

**Why bad**: Mutations from the client are harder to audit, harder to validate, harder to add server-side cross-cutting concerns to.
**Better**: Server Actions for mutations. Client-side Supabase only for read subscriptions if needed.

### "We'll add CLAUDE.md guidance only when we have time"

**Why bad**: CLAUDE.md is the antidote to the next AI assistant repeating mistakes already made.
**Better**: Update CLAUDE.md the same PR that introduces a new constraint or rule.
