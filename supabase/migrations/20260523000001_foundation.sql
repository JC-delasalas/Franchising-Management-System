-- ============================================================================
-- Migration: 20260523000001_foundation
-- Phase 1, step 1 — foundation: cleanup, extensions, audit log, helpers
-- Spec: Franchise.md §Core Modules > 10. Audit Logs
--       CLAUDE.md §Constitutional rules (6, 9), §Critical business rules
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Lock down the pre-existing rls_auto_enable() function.
-- ---------------------------------------------------------------------------
-- This function is wired to an event trigger (ensure_rls) that auto-enables
-- RLS on newly created tables — a useful safety net we want to keep. The
-- security concern flagged by the advisor was that it was callable via
-- /rest/v1/rpc by anon/authenticated. Revoke that EXECUTE permission while
-- preserving the event-trigger behavior.
do $$
begin
  if exists (
    select 1 from pg_proc
    where proname = 'rls_auto_enable' and pronamespace = 'public'::regnamespace
  ) then
    revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- 2. Required extensions
-- ---------------------------------------------------------------------------
-- pgcrypto: gen_random_uuid() for default PKs.
-- citext:   case-insensitive email/identifier comparisons.
create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- 3. Audit log
--
-- Append-only ledger of every mutation on a Critical Business Entity.
-- Read access is gated by RLS per role (see RBAC matrix in
-- .claude/skills/franchise-control-tower/references/rbac-matrix.md).
-- UPDATE/DELETE are forbidden by omission — no policies = no access.
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id              uuid primary key default gen_random_uuid(),
  actor_user_id   uuid references auth.users(id) on delete set null,
  action          text not null check (action in (
    'INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'STATUS_TRANSITION', 'OVERRIDE'
  )),
  entity_type     text not null,
  entity_id       uuid,
  previous_value  jsonb,
  new_value       jsonb,
  reason          text,           -- required for OVERRIDE; null otherwise
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists audit_log_entity_idx
  on public.audit_log (entity_type, entity_id, created_at desc);
create index if not exists audit_log_actor_idx
  on public.audit_log (actor_user_id, created_at desc);
create index if not exists audit_log_created_idx
  on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

-- Anyone authenticated can write to audit_log (triggers and Server Actions).
-- Reads are scoped per role in a later migration once user_roles exists.
create policy "audit_log insert by authenticated"
  on public.audit_log for insert
  to authenticated
  with check (auth.uid() is not null);

-- Immutability: no UPDATE / DELETE policies. Anyone trying it gets denied
-- by RLS. Constitutional rule (CLAUDE.md §Critical business rules) says
-- audit rows are immutable after 30 days; here we make them immutable
-- forever and prune via partitioning in a later phase.

-- ---------------------------------------------------------------------------
-- 4. Generic audit trigger function
--
-- Attach to any CBE with:
--   create trigger <table>_audit
--     after insert or update or delete on public.<table>
--     for each row execute function public.audit_trigger();
--
-- Captures the actor (auth.uid()), the action, and the row diff.
-- SECURITY INVOKER (default) so the function runs with the caller's
-- permissions. RLS on audit_log gates insert access.
-- ---------------------------------------------------------------------------
create or replace function public.audit_trigger()
returns trigger
language plpgsql
as $$
declare
  v_action text;
  v_entity_id uuid;
  v_old jsonb;
  v_new jsonb;
begin
  if tg_op = 'INSERT' then
    v_action := 'INSERT';
    v_old := null;
    v_new := to_jsonb(new);
    v_entity_id := new.id;
  elsif tg_op = 'UPDATE' then
    v_action := 'UPDATE';
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_entity_id := new.id;
  elsif tg_op = 'DELETE' then
    v_action := 'DELETE';
    v_old := to_jsonb(old);
    v_new := null;
    v_entity_id := old.id;
  end if;

  insert into public.audit_log (
    actor_user_id, action, entity_type, entity_id, previous_value, new_value
  ) values (
    auth.uid(), v_action, tg_table_name, v_entity_id, v_old, v_new
  );

  return coalesce(new, old);
end;
$$;

-- The audit trigger function itself is SECURITY INVOKER (default), so
-- nothing to revoke. If we ever change to SECURITY DEFINER, also run:
--   revoke execute on function public.audit_trigger() from anon, authenticated;
