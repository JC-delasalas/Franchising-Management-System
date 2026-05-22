-- ============================================================================
-- Migration: 20260523000003_harden_function_search_paths
-- Phase 1, step 3 — security hygiene flagged by Supabase advisors.
--
-- Functions without an explicit `search_path` are vulnerable to schema-
-- shadowing attacks (attacker with search_path control redirects calls to
-- malicious objects). Lock all our helpers to an empty search_path; we
-- use fully-qualified names everywhere already, so no behavior change.
-- ============================================================================

alter function public.audit_trigger() set search_path = '';
alter function public.has_role(public.app_role) set search_path = '';
alter function public.current_user_franchisor_ids() set search_path = '';
alter function public.is_super_admin() set search_path = '';

-- audit_trigger() references public.audit_log by name without schema. Now
-- that search_path is empty, qualify it. Recreate the function with the
-- fully-qualified reference (CREATE OR REPLACE leaves the trigger bindings
-- intact).
create or replace function public.audit_trigger()
returns trigger
language plpgsql
set search_path = ''
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

-- Similarly, has_role, current_user_franchisor_ids, is_super_admin reference
-- public.user_roles by name. Re-qualify them.
create or replace function public.has_role(role_name public.app_role)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = role_name
  );
$$;

create or replace function public.current_user_franchisor_ids()
returns uuid[]
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(array_agg(distinct franchisor_id) filter (where franchisor_id is not null), '{}')
  from public.user_roles
  where user_id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;
