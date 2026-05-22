# Royalty & Billing Rules

> Authority: `Franchise.md §Core Modules > 5. Royalty Computation` + `§Invoicing Policy`.
> This is the single highest-risk area of the product. Get it wrong and you ship either a dispute generator or a BIR violation.

---

## Royalty model (MVP)

Supported computation modes — chosen per franchisor or per brand:

- **Percentage of gross sales** — `royalty = gross_sales × rate`
- **Percentage of net sales** — `royalty = (gross_sales − discounts − refunds) × rate`
- **Fixed royalty fee** — `royalty = fixed_amount` (monthly)
- **Marketing fee** — `marketing = either_percentage_or_fixed`, computed separately and itemized separately on the invoice

Multiple modes can apply to the same franchisee — e.g. fixed monthly base + percentage transactional. They **stack additively**.

---

## Stacking rule (critical)

Transaction-based royalties are **additive on top of** monthly tier minimums.

Schema implication — `royalties` table:

```
royalties
├── id
├── franchisee_id
├── branch_id
├── period_start
├── period_end
├── base_royalty           numeric(14,2)   -- monthly fixed/minimum
├── transaction_royalty    numeric(14,2)   -- sum of percentage-based
├── marketing_fee          numeric(14,2)
├── penalties              numeric(14,2)
├── adjustments            numeric(14,2)   -- can be negative
├── previous_balance       numeric(14,2)
├── total_due              numeric(14,2)   -- generated column: sum of above
├── status                 enum            -- draft, computed, reviewed, invoiced
├── computed_at
├── computed_by            -- user_id or 'system'
├── reviewed_by
└── reviewed_at
```

**Never** collapse `base_royalty` and `transaction_royalty` into one column. They're audit-relevant separately.

---

## Itemization rule (the dispute killer)

Every invoice rendered to a franchisee shows **separate lines**:

```
Royalty fee (base)          ₱ X
Royalty fee (transactional) ₱ X
Marketing fee               ₱ X
Penalties                   ₱ X
Adjustments                 ₱ X
Previous balance            ₱ X
─────────────────────────────────
Total due                   ₱ X
```

Zero lines are shown as `₱ 0.00`, not omitted. Franchisees calling Finance about "what's this charge" is a leading cause of relationship damage.

For percentage-based lines, show the calculation:

```
Royalty fee (transactional)
  5.0% of ₱ 1,234,567 net sales = ₱ 61,728.35
```

---

## Reviewability rule

A computed royalty is **never** legally final automatically. The flow:

```
sales_report.status = Approved
       │
       ▼
royalty.status = computed   (system-generated)
       │
       ▼ (Finance reviews)
royalty.status = reviewed   (Finance user)
       │
       ▼ (Finance generates invoice)
invoice.status = issued
       │
       ▼ (Franchisee uploads proof)
payment.status = pending_review
       │
       ▼ (Finance reviews proof)
payment.status = confirmed
```

At every transition there's an audit log row. Computation is never trusted as final — Finance signs off.

---

## Invoice generation policy

### What we generate

- **Internal royalty invoices** — franchisor → franchisee for monthly royalty
- **Internal marketing fee invoices** — franchisor → franchisee for marketing fund
- **Adjustments / credit memos** — franchisor → franchisee for corrections (only via Finance, always logged)

These are B2B billing documents. They are commercial records between two business entities. They are *not* customer-facing tax documents.

### What we never generate

- **Official Receipts (OR)** — issued by the franchisee's POS to a customer at point-of-sale
- **Sales Invoices** — BIR-regulated transactional documents
- **POS receipts** of any kind
- **VAT-formatted documents** that look like tax receipts

The franchisee uses their BIR-accredited POS or accounting system for those. We never substitute for that.

### Mandatory footer

Every internal invoice PDF/email/UI rendering must carry:

> **Internal billing document — for franchisor/franchisee royalty reconciliation. Not a BIR Official Receipt or Sales Invoice.**

This is non-negotiable. If a layout change drops it, that's a blocker for merge.

### Numbering convention

Internal invoice IDs must be visually distinct from BIR series. Recommended format:

```
INT-YYYY-NNNNNN
e.g. INT-2026-000142
```

Do not use formats like `OR-`, `SI-`, `INV-` that could be confused with regulated documents.

### Language hygiene

When describing what we do/don't do:

- ✅ "Internal billing document"
- ✅ "Royalty invoice between franchisor and franchisee"
- ✅ "Not subject to BIR OR/Sales Invoice issuance rules"
- ❌ "Not BIR-regulated" (too casual — implies we made the determination)
- ❌ "Tax invoice"
- ❌ "Official receipt"
- ❌ "Sales invoice"

---

## Payment proof handling

Franchisees pay via bank transfer, GCash, Maya, OTC deposits, sometimes cash. The system must capture:

| Field | Notes |
|---|---|
| `amount` | Numeric, currency PHP for MVP |
| `payment_method` | enum: bank_transfer, gcash, maya, otc_deposit, cash, other |
| `reference_number` | Free text — bank ref / GCash txn ID |
| `paid_at` | Date payment was made (not when uploaded) |
| `proof_file` | Image or PDF — required if non-cash |
| `submitted_by` | Franchisee user id |
| `submitted_at` | Auto |
| `reviewed_by` | Finance user id, nullable |
| `reviewed_at` | Auto on review |
| `status` | enum: pending_review, confirmed, rejected, requires_clarification |
| `reviewer_notes` | Free text from Finance |

Finance review is required for confirmation. No auto-confirmation in MVP.

---

## Currency

MVP is **PHP only**. All numeric royalty/payment fields are `numeric(14,2)` representing PHP. Currency column exists on entities but defaults to `'PHP'` and is not user-selectable in MVP.

Multi-currency support is Phase 4+. If asked for it before then, push back.

---

## Compliance check on every royalty/billing change

Before any PR touching this area merges:

- [ ] Schema preserves itemized columns (no collapse)
- [ ] Invoice rendering includes mandatory footer
- [ ] Invoice numbering follows `INT-YYYY-NNNNNN` convention
- [ ] No BIR-regulated terminology used outside of "we don't generate these" context
- [ ] Audit log triggered on every status transition
- [ ] Finance approval required at the marked steps
- [ ] No auto-finality (no auto-confirm payment, no auto-mark royalty as final)
- [ ] Tests cover: stacking math, zero-line rendering, footer presence, audit row creation
