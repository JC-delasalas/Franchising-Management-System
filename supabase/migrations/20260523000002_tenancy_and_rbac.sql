-- ============================================================================
-- Migration: 20260523000002_tenancy_and_rbac
-- Phase 1, step 2 — multi-tenant root + 8 canonical roles + user identity
-- Spec: Franchise.md §Core Modules > 1. Authentication and Roles
--       CLAUDE.md §Canonical roles (8, fixed)
--       .claude/skills/franchise-control-tower/references/rbac-matrix.md
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Role enum — 8 canonical roles, fixed per CLAUDE.md
-- ---------------------------------------------------------------------------
-- Enum chosen over lookup table because the set is fixed and frequently
-- compared in RLS policies (cheap). If we ever need per-role metadata,
-- promote to a table and migrate.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum (
      'super_admin',
      'head_office_admin',
      'finance',
      'operations',
      'trainer',
      'franchisee_owner',
      'branch_manager',
      'viewer'
    );
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- 2. Franchisors — the tenant root.
--
-- Every other entity (branches, sales reports, royalties, etc.) belongs
-- to exactly one franchisor. RLS uses franchisor_id everywhere.
-- ---------------------------------------------------------------------------
create table if not exists public.franchisors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          citext not null unique,           -- URL-safe id (e.g. "siomai-king")
  contact_email citext,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.franchisors enable row level security;

-- ---------------------------------------------------------------------------
-- 3. Profiles — public extension of auth.users.
--
-- Holds app-facing user info (display name, locale, default franchisor)
-- without touching the auth schema.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         citext,                           -- mirrored from auth.users for display
  phone         text,
  locale        text default 'en' check (locale in ('en', 'fil')),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile row when a new auth.users row is inserted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer                                  -- need to write public.profiles
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- SECURITY DEFINER on the function above is intentional: it writes to
-- public.profiles on behalf of auth.users. Revoke EXECUTE from public
-- callers so it can only fire from the trigger.
revoke execute on function public.handle_new_user() from anon, authenticated, public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. User roles — (user × role × franchisor scope)
--
-- A user can hold multiple roles within a franchisor (e.g. franchisee_owner
-- + branch_manager when they manage their own branch directly). Branch
-- scoping for branch-level roles arrives in a later migration with
-- location_assignments.
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            public.app_role not null,
  franchisor_id   uuid references public.franchisors(id) on delete cascade,
  -- super_admin is the only role that may have null franchisor_id
  -- (system-wide access). All others must be franchisor-scoped.
  created_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null,
  unique (user_id, role, franchisor_id),
  constraint user_roles_franchisor_required
    check (role = 'super_admin' or franchisor_id is not null)
);

create index if not exists user_roles_user_idx       on public.user_roles (user_id);
create index if not exists user_roles_franchisor_idx on public.user_roles (franchisor_id);

alter table public.user_roles enable row level security;

-- ---------------------------------------------------------------------------
-- 5. Helper SQL functions used in RLS policies
-- ---------------------------------------------------------------------------

-- has_role(role_name): does the current user hold `role_name` anywhere?
create or replace function public.has_role(role_name public.app_role)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = role_name
  );
$$;

-- current_user_franchisor_ids(): all franchisor_ids the current user has
-- a role in (super_admin returns null array; checked separately).
create or replace function public.current_user_franchisor_ids()
returns uuid[]
language sql
stable
security invoker
as $$
  select coalesce(array_agg(distinct franchisor_id) filter (where franchisor_id is not null), '{}')
  from public.user_roles
  where user_id = auth.uid();
$$;

-- is_super_admin(): convenience for RLS policies that need to bypass
-- franchisor-scoping for system-wide super admin actions.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 6. RLS policies
-- ---------------------------------------------------------------------------

-- ---- franchisors ----------------------------------------------------------
-- SELECT: users see franchisors they have a role in; super_admin sees all.
create policy "franchisors read scope"
  on public.franchisors for select
  to authenticated
  using (
    public.is_super_admin()
    or id = any (public.current_user_franchisor_ids())
  );

-- INSERT/UPDATE/DELETE: super_admin or head_office_admin within franchisor.
create policy "franchisors super admin write"
  on public.franchisors for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      id = any (public.current_user_franchisor_ids())
      and public.has_role('head_office_admin')
    )
  )
  with check (
    public.is_super_admin()
    or (
      id = any (public.current_user_franchisor_ids())
      and public.has_role('head_office_admin')
    )
  );

-- ---- profiles -------------------------------------------------------------
-- A user can always read and update their own profile.
create policy "profiles read own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_super_admin());

create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Head Office Admin in any franchisor can read profiles of users that
-- share at least one franchisor with them. (We allow this scoped read
-- so an admin can look up "who is this user assigned to my franchisor".)
create policy "profiles read franchisor peers"
  on public.profiles for select
  to authenticated
  using (
    public.has_role('head_office_admin')
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = public.profiles.id
        and ur.franchisor_id = any (public.current_user_franchisor_ids())
    )
  );

-- ---- user_roles -----------------------------------------------------------
-- Users can read their own role assignments.
create policy "user_roles read own"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid() or public.is_super_admin());

-- Head Office Admin can read role assignments within their franchisor(s).
create policy "user_roles read franchisor peers"
  on public.user_roles for select
  to authenticated
  using (
    public.has_role('head_office_admin')
    and franchisor_id = any (public.current_user_franchisor_ids())
  );

-- Only super_admin or head_office_admin (within franchisor) can create
-- new role assignments.
create policy "user_roles write by admin"
  on public.user_roles for all
  to authenticated
  using (
    public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and franchisor_id = any (public.current_user_franchisor_ids())
    )
  )
  with check (
    public.is_super_admin()
    or (
      public.has_role('head_office_admin')
      and franchisor_id = any (public.current_user_franchisor_ids())
    )
  );

-- ---- audit_log read policy (now that user_roles exists) -------------------
-- Defined here so we can use is_super_admin/has_role.
create policy "audit_log read by role"
  on public.audit_log for select
  to authenticated
  using (
    public.is_super_admin()
    or public.has_role('head_office_admin')
    or (
      public.has_role('finance')
      and entity_type in ('royalty', 'invoice', 'payment')
    )
    or (
      public.has_role('operations')
      and entity_type in ('compliance_record', 'document')
    )
    or actor_user_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- 7. Audit triggers on CBEs introduced in this migration
-- ---------------------------------------------------------------------------
create trigger franchisors_audit
  after insert or update or delete on public.franchisors
  for each row execute function public.audit_trigger();

create trigger user_roles_audit
  after insert or update or delete on public.user_roles
  for each row execute function public.audit_trigger();

-- profiles are user-editable; not classified as CBE. No audit trigger
-- (skip the noise — profile edits aren't business-critical).
