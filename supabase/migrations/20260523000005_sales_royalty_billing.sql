-- ============================================================================
-- Migration: 20260523000005_sales_royalty_billing
-- Phase 1, step 5 — sales reports, royalty policies + computation, internal invoices,
-- payment tracking with proof uploads
-- Spec: Franchise.md §Core Modules > 4. Sales Reporting, 5. Royalty Computation,
--       §Invoicing Policy. CLAUDE.md §Critical business rules.
--       .claude/skills/franchise-control-tower/references/royalty-and-billing.md
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'sales_report_status') then
    create type public.sales_report_status as enum (
      'draft', 'submitted', 'under_review', 'approved', 'rejected', 'edited_after_submission'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'royalty_model') then
    create type public.royalty_model as enum (
      'percentage_of_gross', 'percentage_of_net', 'fixed_monthly'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'royalty_status') then
    create type public.royalty_status as enum ('computed', 'reviewed', 'invoiced');
  end if;
  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type public.invoice_status as enum (
      'draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'invoice_line_type') then
    create type public.invoice_line_type as enum (
      'royalty_base', 'royalty_transactional', 'marketing_fee', 'penalty', 'adjustment', 'previous_balance'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum (
      'bank_transfer', 'gcash', 'maya', 'otc_deposit', 'cash', 'other'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'pending_review', 'confirmed', 'rejected', 'requires_clarification'
    );
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Sales reports — manual MVP submission with proof upload required
-- ---------------------------------------------------------------------------
create table if not exists public.sales_reports (
  id                       uuid primary key default gen_random_uuid(),
  branch_id                uuid not null references public.branches(id) on delete restrict,
  franchisor_id            uuid not null references public.franchisors(id) on delete restrict,
  period_start             date not null,
  period_end               date not null,
  gross_sales              numeric(14,2) not null default 0,
  discounts                numeric(14,2) not null default 0,
  refunds                  numeric(14,2) not null default 0,
  net_sales                numeric(14,2) generated always as (gross_sales - discounts - refunds) stored,
  payment_method_breakdown jsonb default '{}'::jsonb,
  status                   public.sales_report_status not null default 'draft',
  reviewer_notes           text,
  submitted_by             uuid references auth.users(id) on delete set null,
  submitted_at             timestamptz,
  reviewed_by              uuid references auth.users(id) on delete set null,
  reviewed_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint sales_report_period_valid check (period_end >= period_start),
  constraint sales_report_nonneg check (gross_sales >= 0 and discounts >= 0 and refunds >= 0)
);

create index if not exists sales_reports_branch_period_idx
  on public.sales_reports (branch_id, period_start desc);
create index if not exists sales_reports_status_idx
  on public.sales_reports (franchisor_id, status, period_start desc);

alter table public.sales_reports enable row level security;

create table if not exists public.sales_report_attachments (
  id               uuid primary key default gen_random_uuid(),
  sales_report_id  uuid not null references public.sales_reports(id) on delete cascade,
  storage_path     text not null,         -- Supabase Storage path
  file_name        text not null,
  file_size_bytes  integer,
  mime_type        text,
  uploaded_by      uuid references auth.users(id) on delete set null,
  uploaded_at      timestamptz not null default now()
);

create index if not exists sales_report_attachments_report_idx
  on public.sales_report_attachments (sales_report_id);

alter table public.sales_report_attachments enable row level security;

-- ---------------------------------------------------------------------------
-- Royalty policy — per franchisor (one active policy at a time typical).
-- "Stacking" rule: transaction-based fees ADD ON TOP of monthly minimums.
-- Multiple models can apply via separate policy rows (one for base, one
-- for transactional). Per Franchise.md §5 and royalty-and-billing.md.
-- ---------------------------------------------------------------------------
create table if not exists public.royalty_policies (
  id                       uuid primary key default gen_random_uuid(),
  franchisor_id            uuid not null references public.franchisors(id) on delete cascade,
  name                     text not null,
  model                    public.royalty_model not null,
  rate_percentage          numeric(5,4),                -- e.g. 0.0500 for 5%; null if model=fixed_monthly
  fixed_amount             numeric(14,2),               -- only for fixed_monthly; null otherwise
  marketing_fee_percentage numeric(5,4),                -- additional marketing fund cut
  marketing_fee_fixed      numeric(14,2),
  effective_from           date not null,
  effective_to             date,
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint royalty_policy_rate_for_pct
    check (model = 'fixed_monthly' or rate_percentage is not null),
  constraint royalty_policy_amount_for_fixed
    check (model <> 'fixed_monthly' or fixed_amount is not null)
);

create index if not exists royalty_policies_franchisor_idx on public.royalty_policies (franchisor_id);

alter table public.royalty_policies enable row level security;

-- ---------------------------------------------------------------------------
-- Royalties — computed per franchisee/branch per period. base + transactional
-- stay SEPARATE columns; total_due is a generated column summing all lines.
-- Status flow: computed → reviewed (Finance) → invoiced.
-- ---------------------------------------------------------------------------
create table if not exists public.royalties (
  id                   uuid primary key default gen_random_uuid(),
  franchisor_id        uuid not null references public.franchisors(id) on delete restrict,
  franchisee_id        uuid not null references public.franchisees(id) on delete restrict,
  branch_id            uuid references public.branches(id) on delete restrict,
  period_start         date not null,
  period_end           date not null,
  base_royalty         numeric(14,2) not null default 0,
  transaction_royalty  numeric(14,2) not null default 0,
  marketing_fee        numeric(14,2) not null default 0,
  penalties            numeric(14,2) not null default 0,
  adjustments          numeric(14,2) not null default 0,
  previous_balance     numeric(14,2) not null default 0,
  total_due            numeric(14,2) generated always as (
    base_royalty + transaction_royalty + marketing_fee + penalties + adjustments + previous_balance
  ) stored,
  status               public.royalty_status not null default 'computed',
  computed_at          timestamptz not null default now(),
  computed_by          uuid references auth.users(id) on delete set null,
  reviewed_at          timestamptz,
  reviewed_by          uuid references auth.users(id) on delete set null,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint royalty_period_valid check (period_end >= period_start)
);

create index if not exists royalties_franchisee_period_idx
  on public.royalties (franchisee_id, period_start desc);
create index if not exists royalties_status_idx
  on public.royalties (franchisor_id, status);

alter table public.royalties enable row level security;

-- ---------------------------------------------------------------------------
-- Invoices — INTERNAL billing only. Numbering convention INT-YYYY-NNNNNN,
-- never resembling BIR series. Mandatory footer enforced at render-time.
-- ---------------------------------------------------------------------------
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  franchisor_id   uuid not null references public.franchisors(id) on delete restrict,
  franchisee_id   uuid not null references public.franchisees(id) on delete restrict,
  invoice_number  text not null,                       -- INT-YYYY-NNNNNN
  period_start    date,
  period_end      date,
  issued_at       timestamptz,
  due_date        date,
  status          public.invoice_status not null default 'draft',
  subtotal        numeric(14,2) not null default 0,
  total           numeric(14,2) not null default 0,
  notes           text,
  -- Hard-coded footer text included on every render. Constitutional rule
  -- (CLAUDE.md §Critical business rules > Invoice scope).
  footer_text     text not null default
    'Internal billing document — for franchisor/franchisee royalty reconciliation. Not a BIR Official Receipt or Sales Invoice.',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (franchisor_id, invoice_number),
  constraint invoice_number_format check (invoice_number ~ '^INT-[0-9]{4}-[0-9]{6}$')
);

create index if not exists invoices_franchisee_idx on public.invoices (franchisee_id, issued_at desc);
create index if not exists invoices_status_idx     on public.invoices (franchisor_id, status, due_date);

alter table public.invoices enable row level security;

create table if not exists public.invoice_line_items (
  id           uuid primary key default gen_random_uuid(),
  invoice_id   uuid not null references public.invoices(id) on delete cascade,
  royalty_id   uuid references public.royalties(id) on delete set null,
  line_type    public.invoice_line_type not null,
  description  text not null,
  amount       numeric(14,2) not null default 0,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists invoice_line_items_invoice_idx
  on public.invoice_line_items (invoice_id, sort_order);

alter table public.invoice_line_items enable row level security;

-- ---------------------------------------------------------------------------
-- Payments + proof attachments (GCash/Maya/bank/OTC reality per PH context)
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id                uuid primary key default gen_random_uuid(),
  invoice_id        uuid not null references public.invoices(id) on delete restrict,
  amount            numeric(14,2) not null,
  payment_method    public.payment_method not null,
  reference_number  text,                                  -- bank ref, GCash txn id
  paid_at           date not null,                         -- date payment was made (not uploaded)
  status            public.payment_status not null default 'pending_review',
  submitted_by      uuid references auth.users(id) on delete set null,
  submitted_at      timestamptz not null default now(),
  reviewed_by       uuid references auth.users(id) on delete set null,
  reviewed_at       timestamptz,
  reviewer_notes    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint payment_amount_positive check (amount > 0)
);

create index if not exists payments_invoice_idx on public.payments (invoice_id, paid_at desc);
create index if not exists payments_status_idx  on public.payments (status, submitted_at desc);

alter table public.payments enable row level security;

create table if not exists public.payment_attachments (
  id               uuid primary key default gen_random_uuid(),
  payment_id       uuid not null references public.payments(id) on delete cascade,
  storage_path     text not null,
  file_name        text not null,
  file_size_bytes  integer,
  mime_type        text,
  uploaded_by      uuid references auth.users(id) on delete set null,
  uploaded_at      timestamptz not null default now()
);

create index if not exists payment_attachments_payment_idx
  on public.payment_attachments (payment_id);

alter table public.payment_attachments enable row level security;

-- ---------------------------------------------------------------------------
-- RLS — sales_reports
-- Franchisee owners + branch managers see + write own branches.
-- Admin/finance/ops see all in franchisor; finance/admin approve.
-- ---------------------------------------------------------------------------
create policy "sales_reports read scope"
  on public.sales_reports for select
  to authenticated
  using (
    public.is_super_admin()
    or branch_id = any (public.current_user_branch_ids())
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance')
           or public.has_role('operations') or public.has_role('viewer'))
    )
  );

create policy "sales_reports write own branch"
  on public.sales_reports for insert
  to authenticated
  with check (
    branch_id = any (public.current_user_branch_ids())
  );

create policy "sales_reports update own draft or admin"
  on public.sales_reports for update
  to authenticated
  using (
    -- branch users may update only their own DRAFT or SUBMITTED reports
    (branch_id = any (public.current_user_branch_ids()) and status in ('draft', 'submitted'))
    -- admin/finance may update anytime within franchisor
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance'))
    )
    or public.is_super_admin()
  )
  with check (
    (branch_id = any (public.current_user_branch_ids()) and status in ('draft', 'submitted', 'edited_after_submission'))
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance'))
    )
    or public.is_super_admin()
  );

create policy "sales_report_attachments read"
  on public.sales_report_attachments for select
  to authenticated
  using (sales_report_id in (select id from public.sales_reports));

create policy "sales_report_attachments write own branch"
  on public.sales_report_attachments for insert
  to authenticated
  with check (
    sales_report_id in (select id from public.sales_reports)
  );

-- ---------------------------------------------------------------------------
-- RLS — royalty_policies (read by anyone in franchisor; write by Finance/Admin)
-- ---------------------------------------------------------------------------
create policy "royalty_policies read scope"
  on public.royalty_policies for select
  to authenticated
  using (
    public.is_super_admin()
    or franchisor_id = any (public.current_user_franchisor_ids())
  );

create policy "royalty_policies write by finance"
  on public.royalty_policies for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance'))
    )
  )
  with check (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance'))
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — royalties
-- ---------------------------------------------------------------------------
create policy "royalties read scope"
  on public.royalties for select
  to authenticated
  using (
    public.is_super_admin()
    or franchisee_id = any (public.current_user_franchisee_ids())
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance')
           or public.has_role('operations') or public.has_role('viewer'))
    )
  );

-- Only Finance/Admin compute or review royalties — no franchisee writes.
create policy "royalties write by finance"
  on public.royalties for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance'))
    )
  )
  with check (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance'))
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — invoices + line items
-- ---------------------------------------------------------------------------
create policy "invoices read scope"
  on public.invoices for select
  to authenticated
  using (
    public.is_super_admin()
    or franchisee_id = any (public.current_user_franchisee_ids())
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance')
           or public.has_role('viewer'))
    )
  );

create policy "invoices write by finance"
  on public.invoices for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance'))
    )
  )
  with check (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance'))
    )
  );

create policy "invoice_line_items read"
  on public.invoice_line_items for select
  to authenticated
  using (invoice_id in (select id from public.invoices));

create policy "invoice_line_items write by finance"
  on public.invoice_line_items for all
  to authenticated
  using (invoice_id in (select id from public.invoices))
  with check (invoice_id in (select id from public.invoices));

-- ---------------------------------------------------------------------------
-- RLS — payments + attachments
-- Franchisee can submit a payment for their own invoice; Finance reviews.
-- ---------------------------------------------------------------------------
create policy "payments read scope"
  on public.payments for select
  to authenticated
  using (
    public.is_super_admin()
    or invoice_id in (
      select id from public.invoices
      where franchisee_id = any (public.current_user_franchisee_ids())
    )
    or (
      (public.has_role('head_office_admin') or public.has_role('finance')
       or public.has_role('viewer'))
      and invoice_id in (
        select id from public.invoices
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

create policy "payments submit own"
  on public.payments for insert
  to authenticated
  with check (
    invoice_id in (
      select id from public.invoices
      where franchisee_id = any (public.current_user_franchisee_ids())
    )
    or public.has_role('head_office_admin') or public.has_role('finance')
    or public.is_super_admin()
  );

create policy "payments review by finance"
  on public.payments for update
  to authenticated
  using (
    public.is_super_admin()
    or (
      (public.has_role('head_office_admin') or public.has_role('finance'))
      and invoice_id in (
        select id from public.invoices
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  )
  with check (
    public.is_super_admin()
    or (
      (public.has_role('head_office_admin') or public.has_role('finance'))
      and invoice_id in (
        select id from public.invoices
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

create policy "payment_attachments read"
  on public.payment_attachments for select
  to authenticated
  using (payment_id in (select id from public.payments));

create policy "payment_attachments write"
  on public.payment_attachments for insert
  to authenticated
  with check (payment_id in (select id from public.payments));

-- ---------------------------------------------------------------------------
-- Audit triggers on CBEs
-- ---------------------------------------------------------------------------
create trigger sales_reports_audit
  after insert or update or delete on public.sales_reports
  for each row execute function public.audit_trigger();

create trigger royalty_policies_audit
  after insert or update or delete on public.royalty_policies
  for each row execute function public.audit_trigger();

create trigger royalties_audit
  after insert or update or delete on public.royalties
  for each row execute function public.audit_trigger();

create trigger invoices_audit
  after insert or update or delete on public.invoices
  for each row execute function public.audit_trigger();

create trigger invoice_line_items_audit
  after insert or update or delete on public.invoice_line_items
  for each row execute function public.audit_trigger();

create trigger payments_audit
  after insert or update or delete on public.payments
  for each row execute function public.audit_trigger();
