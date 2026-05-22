-- ============================================================================
-- Migration: 20260523000004_franchise_structure
-- Phase 1, step 4 — branches, franchisees, junctions, branch/franchisee scoping
-- Spec: Franchise.md §Core Modules > 2. Branch Management, 3. Franchisee Management
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'branch_status') then
    create type public.branch_status as enum (
      'pending_opening', 'active', 'inactive', 'closed'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'contract_renewal_status') then
    create type public.contract_renewal_status as enum (
      'current', 'expiring_soon', 'expired', 'in_renewal', 'terminated'
    );
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Branches
-- ---------------------------------------------------------------------------
create table if not exists public.branches (
  id                 uuid primary key default gen_random_uuid(),
  franchisor_id      uuid not null references public.franchisors(id) on delete restrict,
  name               text not null,
  code               text not null,                  -- short code unique within franchisor
  address            text,
  region             text,
  province           text,
  city               text,
  opening_date       date,
  status             public.branch_status not null default 'pending_opening',
  contact_person     text,
  contact_phone      text,
  operating_schedule jsonb default '{}'::jsonb,      -- {mon: "8-22", tue: ..., closed: ["sun"]}
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  archived_at        timestamptz,                    -- soft delete only
  unique (franchisor_id, code)
);

create index if not exists branches_franchisor_idx on public.branches (franchisor_id);
create index if not exists branches_status_idx     on public.branches (franchisor_id, status);
create index if not exists branches_city_idx       on public.branches (franchisor_id, city);

alter table public.branches enable row level security;

-- ---------------------------------------------------------------------------
-- Franchisees
-- ---------------------------------------------------------------------------
create table if not exists public.franchisees (
  id                    uuid primary key default gen_random_uuid(),
  franchisor_id         uuid not null references public.franchisors(id) on delete restrict,
  legal_name            text not null,
  business_entity_name  text,
  contact_number        text,
  email                 citext,
  territory             text,
  contract_start_date   date,
  contract_end_date     date,
  renewal_status        public.contract_renewal_status not null default 'current',
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  archived_at           timestamptz
);

create index if not exists franchisees_franchisor_idx on public.franchisees (franchisor_id);
create index if not exists franchisees_renewal_idx    on public.franchisees (franchisor_id, renewal_status);

alter table public.franchisees enable row level security;

-- ---------------------------------------------------------------------------
-- Branch ↔ Franchisee junction (a franchisee can run multiple branches; a
-- branch can change hands across franchisees over time — track history).
-- ---------------------------------------------------------------------------
create table if not exists public.branch_franchisees (
  id              uuid primary key default gen_random_uuid(),
  branch_id       uuid not null references public.branches(id) on delete cascade,
  franchisee_id   uuid not null references public.franchisees(id) on delete cascade,
  is_primary      boolean not null default true,
  assigned_at     timestamptz not null default now(),
  unassigned_at   timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  unique (branch_id, franchisee_id, assigned_at)
);

create index if not exists branch_franchisees_branch_idx     on public.branch_franchisees (branch_id);
create index if not exists branch_franchisees_franchisee_idx on public.branch_franchisees (franchisee_id);
create index if not exists branch_franchisees_active_idx
  on public.branch_franchisees (branch_id) where unassigned_at is null;

alter table public.branch_franchisees enable row level security;

-- ---------------------------------------------------------------------------
-- Contracts (separate from franchisees so a franchisee can have a renewal
-- history rather than one set of dates that get overwritten).
-- ---------------------------------------------------------------------------
create table if not exists public.contracts (
  id                  uuid primary key default gen_random_uuid(),
  franchisee_id       uuid not null references public.franchisees(id) on delete cascade,
  reference_number    text not null,
  start_date          date not null,
  end_date            date,
  renewal_status      public.contract_renewal_status not null default 'current',
  document_path       text,                           -- Supabase Storage path
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists contracts_franchisee_idx on public.contracts (franchisee_id);
create index if not exists contracts_renewal_idx    on public.contracts (renewal_status, end_date);

alter table public.contracts enable row level security;

-- ---------------------------------------------------------------------------
-- User → Branch scoping (for branch_manager role)
-- ---------------------------------------------------------------------------
create table if not exists public.location_assignments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  branch_id       uuid not null references public.branches(id) on delete cascade,
  assigned_at     timestamptz not null default now(),
  unassigned_at   timestamptz,
  assigned_by     uuid references auth.users(id) on delete set null,
  unique (user_id, branch_id, assigned_at)
);

create index if not exists location_assignments_user_idx   on public.location_assignments (user_id);
create index if not exists location_assignments_branch_idx on public.location_assignments (branch_id);
create index if not exists location_assignments_active_idx
  on public.location_assignments (user_id, branch_id) where unassigned_at is null;

alter table public.location_assignments enable row level security;

-- ---------------------------------------------------------------------------
-- User → Franchisee scoping (for franchisee_owner role)
-- ---------------------------------------------------------------------------
create table if not exists public.franchisee_owners (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  franchisee_id   uuid not null references public.franchisees(id) on delete cascade,
  assigned_at     timestamptz not null default now(),
  unassigned_at   timestamptz,
  assigned_by     uuid references auth.users(id) on delete set null,
  unique (user_id, franchisee_id, assigned_at)
);

create index if not exists franchisee_owners_user_idx       on public.franchisee_owners (user_id);
create index if not exists franchisee_owners_franchisee_idx on public.franchisee_owners (franchisee_id);
create index if not exists franchisee_owners_active_idx
  on public.franchisee_owners (user_id, franchisee_id) where unassigned_at is null;

alter table public.franchisee_owners enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: every branch_id the current user can access (direct assignment
-- or via franchisee ownership). Admin roles see franchisor-wide; checked
-- separately in policies (they don't need branch enumeration).
-- ---------------------------------------------------------------------------
create or replace function public.current_user_branch_ids()
returns uuid[]
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(array_agg(distinct b.id), '{}')
  from public.branches b
  where exists (
    -- direct branch assignment (branch_manager)
    select 1 from public.location_assignments la
    where la.user_id = auth.uid()
      and la.branch_id = b.id
      and la.unassigned_at is null
  )
  or exists (
    -- via franchisee ownership → branch_franchisees
    select 1
    from public.franchisee_owners fo
    join public.branch_franchisees bf on bf.franchisee_id = fo.franchisee_id
    where fo.user_id = auth.uid()
      and fo.unassigned_at is null
      and bf.branch_id = b.id
      and bf.unassigned_at is null
  );
$$;

-- ---------------------------------------------------------------------------
-- Helper: every franchisee_id the current user can access (direct ownership)
-- ---------------------------------------------------------------------------
create or replace function public.current_user_franchisee_ids()
returns uuid[]
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(array_agg(distinct franchisee_id), '{}')
  from public.franchisee_owners
  where user_id = auth.uid() and unassigned_at is null;
$$;

-- ---------------------------------------------------------------------------
-- RLS — branches
-- ---------------------------------------------------------------------------
-- SELECT: see branches you're admin/finance/ops in (franchisor scope), or
-- branch-assigned to, or own via franchisee ownership.
create policy "branches read scope"
  on public.branches for select
  to authenticated
  using (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (
        public.has_role('head_office_admin')
        or public.has_role('finance')
        or public.has_role('operations')
        or public.has_role('viewer')
      )
    )
    or id = any (public.current_user_branch_ids())
  );

-- WRITE: head_office_admin within franchisor (or super_admin).
create policy "branches write by admin"
  on public.branches for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and public.has_role('head_office_admin')
    )
  )
  with check (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and public.has_role('head_office_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — franchisees
-- ---------------------------------------------------------------------------
create policy "franchisees read scope"
  on public.franchisees for select
  to authenticated
  using (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and (
        public.has_role('head_office_admin')
        or public.has_role('finance')
        or public.has_role('operations')
        or public.has_role('viewer')
      )
    )
    or id = any (public.current_user_franchisee_ids())
  );

create policy "franchisees write by admin"
  on public.franchisees for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and public.has_role('head_office_admin')
    )
  )
  with check (
    public.is_super_admin()
    or (
      franchisor_id = any (public.current_user_franchisor_ids())
      and public.has_role('head_office_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — branch_franchisees (junction follows branch access)
-- ---------------------------------------------------------------------------
create policy "branch_franchisees read"
  on public.branch_franchisees for select
  to authenticated
  using (
    branch_id in (
      select id from public.branches
    )                                     -- piggyback on branches RLS via subselect
  );

create policy "branch_franchisees write by admin"
  on public.branch_franchisees for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and branch_id in (
        select b.id from public.branches b
        where b.franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  )
  with check (
    public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and branch_id in (
        select b.id from public.branches b
        where b.franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — contracts (Finance + Head Office + the franchisee owner)
-- ---------------------------------------------------------------------------
create policy "contracts read scope"
  on public.contracts for select
  to authenticated
  using (
    public.is_super_admin()
    or franchisee_id = any (public.current_user_franchisee_ids())
    or (
      public.has_role('head_office_admin') or public.has_role('finance')
      and franchisee_id in (
        select id from public.franchisees
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

create policy "contracts write by admin"
  on public.contracts for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      (public.has_role('head_office_admin') or public.has_role('finance'))
      and franchisee_id in (
        select id from public.franchisees
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  )
  with check (
    public.is_super_admin()
    or (
      (public.has_role('head_office_admin') or public.has_role('finance'))
      and franchisee_id in (
        select id from public.franchisees
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — location_assignments and franchisee_owners
-- ---------------------------------------------------------------------------
create policy "location_assignments read"
  on public.location_assignments for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and branch_id in (
        select b.id from public.branches b
        where b.franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

create policy "location_assignments write by admin"
  on public.location_assignments for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and branch_id in (
        select b.id from public.branches b
        where b.franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  )
  with check (
    public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and branch_id in (
        select b.id from public.branches b
        where b.franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

create policy "franchisee_owners read"
  on public.franchisee_owners for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and franchisee_id in (
        select id from public.franchisees
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

create policy "franchisee_owners write by admin"
  on public.franchisee_owners for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and franchisee_id in (
        select id from public.franchisees
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  )
  with check (
    public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and franchisee_id in (
        select id from public.franchisees
        where franchisor_id = any (public.current_user_franchisor_ids())
      )
    )
  );

-- ---------------------------------------------------------------------------
-- Audit triggers on CBEs
-- ---------------------------------------------------------------------------
create trigger branches_audit
  after insert or update or delete on public.branches
  for each row execute function public.audit_trigger();

create trigger franchisees_audit
  after insert or update or delete on public.franchisees
  for each row execute function public.audit_trigger();

create trigger branch_franchisees_audit
  after insert or update or delete on public.branch_franchisees
  for each row execute function public.audit_trigger();

create trigger contracts_audit
  after insert or update or delete on public.contracts
  for each row execute function public.audit_trigger();

create trigger location_assignments_audit
  after insert or update or delete on public.location_assignments
  for each row execute function public.audit_trigger();

create trigger franchisee_owners_audit
  after insert or update or delete on public.franchisee_owners
  for each row execute function public.audit_trigger();
