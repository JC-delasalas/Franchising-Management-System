# RBAC Matrix — 8 Canonical Roles

> Authority: `Franchise.md §Core Modules > 1. Authentication and Roles`.
> Enforcement: Supabase RLS on every table touching franchise data. Helper SQL function `has_role(uuid, text)` for policy expressions.

---

## Role definitions

| Role                  | Primary purpose                                         | Default scope                                                  |
| --------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| **Super Admin**       | Tenant + system-level config; rarely used in day-to-day | Everything in tenant                                           |
| **Head Office Admin** | Day-to-day franchisor operations                        | All branches in franchisor                                     |
| **Finance**           | Royalties, payments, invoices, financial exports        | All branches, financial data                                   |
| **Operations**        | Compliance, audits, corrective actions                  | All branches, compliance/ops data                              |
| **Trainer**           | Training content, completion tracking, SOP authoring    | All branches, training/KB data only                            |
| **Franchisee Owner**  | Owns one or more branches                               | Only assigned branches                                         |
| **Branch Manager**    | Daily branch operations                                 | Only assigned branch(es), no franchisee-level financial detail |
| **Viewer**            | Read-only consumer (accountant, area manager, auditor)  | Configurable scope, read-only                                  |

---

## Permission matrix

Legend: `C`=create, `R`=read, `U`=update, `D`=delete (soft only), `A`=approve, `—`=no access.

| Entity                  | Super Admin | HO Admin     | Finance            | Operations          | Trainer            | Franchisee Owner | Branch Manager     | Viewer  |
| ----------------------- | ----------- | ------------ | ------------------ | ------------------- | ------------------ | ---------------- | ------------------ | ------- |
| Franchisors             | CRUD        | RU           | R                  | R                   | —                  | —                | —                  | R       |
| Branches                | CRUD        | CRUD         | R                  | R                   | R                  | R (own)          | R (own)            | R       |
| Franchisees             | CRUD        | CRUD         | R                  | R                   | R                  | R (own)          | R (own)            | R       |
| User roles              | CRUD        | CRU          | —                  | —                   | —                  | —                | —                  | —       |
| Location assignments    | CRUD        | CRU          | R                  | R                   | —                  | R (own)          | R (own)            | R       |
| Sales reports           | CRUD        | RUA          | RA                 | R                   | —                  | CRU (own branch) | CRU (own branch)   | R       |
| Royalty policies        | CRUD        | CRU          | RU                 | R                   | —                  | R (own)          | —                  | R       |
| Royalties (computed)    | CRUD        | RA           | RUA                | R                   | —                  | R (own)          | —                  | R       |
| Invoices (internal)     | CRUD        | RA           | CRUA               | R                   | —                  | R (own)          | —                  | R       |
| Payments + proofs       | CRUD        | RA           | CRUA               | R                   | —                  | C + R (own)      | C + R (own branch) | R       |
| Compliance requirements | CRUD        | CRU          | R                  | CRU                 | —                  | R (own)          | R (own)            | R       |
| Compliance records      | CRUD        | RUA          | R                  | CRUA                | —                  | CRU (own)        | CRU (own branch)   | R       |
| Documents               | CRUD        | CRUA         | RA                 | RUA                 | RU (training only) | CRU (own)        | CRU (own branch)   | R       |
| Document types          | CRUD        | CRU          | —                  | R                   | —                  | —                | —                  | R       |
| Support tickets         | CRUD        | CRUA         | R                  | CRUA                | RA (training cat)  | CRU (own)        | CRU (own branch)   | R       |
| Ticket messages         | CRUD        | CRU          | R                  | CRU                 | CRU (training cat) | CRU (own)        | CRU (own branch)   | R       |
| Announcements           | CRUD        | CRUD         | R                  | R                   | CRU                | R (own)          | R (own)            | R       |
| SOP articles            | CRUD        | CRUD         | R                  | R                   | CRUD               | R (own)          | R (own)            | R       |
| Training modules        | CRUD        | RU           | R                  | R                   | CRUD               | R (own)          | R (own)            | R       |
| Training completions    | CRUD        | R            | R                  | R                   | CRUA               | CRU (own)        | CRU (own)          | R       |
| Audit log               | R           | R (filtered) | R (financial only) | R (compliance only) | —                  | R (own actions)  | R (own actions)    | —       |
| Notifications           | CRUD        | R (own)      | R (own)            | R (own)             | R (own)            | R (own)          | R (own)            | R (own) |

Notes:

- "own" for Franchisee Owner = branches in `location_assignments` for that user
- "own" for Branch Manager = branches in `location_assignments` for that user
- Audit log is **never** updatable or deletable by any role after 30 days (constitutional rule)
- Soft delete only — no hard `DELETE` on entities listed above
- Approval (`A`) implies the role can transition status fields like `Submitted → Approved` and similar

---

## RLS policy patterns

Use these as the canonical templates. Helper functions assumed present:

- `auth.uid()` — current user
- `current_user_franchisor_id()` returns uuid — franchisor scope
- `current_user_branch_ids()` returns uuid[] — branches the user is assigned to
- `has_role(text)` returns bool — checks against `user_roles`

### Franchisor-scoped table (e.g. branches, royalty_policies)

```sql
-- SELECT
create policy "franchisor scope read"
on public.branches for select
using (franchisor_id = current_user_franchisor_id());

-- INSERT/UPDATE/DELETE: gated to admin/HO roles
create policy "ho admin write"
on public.branches for all
using (
  franchisor_id = current_user_franchisor_id()
  and has_role('head_office_admin')
)
with check (
  franchisor_id = current_user_franchisor_id()
  and has_role('head_office_admin')
);
```

### Branch-scoped table (e.g. sales_reports)

```sql
create policy "branch scope read"
on public.sales_reports for select
using (
  branch_id = any(current_user_branch_ids())
  or has_role('head_office_admin')
  or has_role('finance')
  or has_role('operations')
  or has_role('super_admin')
);

create policy "branch user write own"
on public.sales_reports for insert
with check (
  branch_id = any(current_user_branch_ids())
);

create policy "head office update/approve"
on public.sales_reports for update
using (
  has_role('head_office_admin') or has_role('finance')
)
with check (
  has_role('head_office_admin') or has_role('finance')
);
```

### Audit log (append-only, 30-day immutability)

```sql
create policy "audit read by role"
on public.audit_log for select
using (
  has_role('super_admin')
  or has_role('head_office_admin')
  or (has_role('finance') and entity_type in ('royalty','invoice','payment'))
  or (has_role('operations') and entity_type in ('compliance_record','document'))
  or actor_user_id = auth.uid()
);

create policy "audit insert any authenticated"
on public.audit_log for insert
with check (auth.uid() is not null);

-- No update/delete policies = no UPDATE/DELETE ever
-- Trigger enforces immutability after 30 days even for super admin
```

---

## Tests every RLS policy must pass

For every new policy, add a test that proves:

1. The intended role can perform the intended action
2. **Franchisee A cannot see Franchisee B's data** (cross-tenant isolation)
3. A role one level below cannot escalate (e.g. Branch Manager cannot approve royalties)
4. Anonymous (`anon`) cannot access anything (except explicitly public tables, if any)

Run via `vitest` against a local Supabase or `supabase test db`.
