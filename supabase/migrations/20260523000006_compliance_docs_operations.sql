-- ============================================================================
-- Migration: 20260523000006_compliance_docs_operations
-- Phase 1, step 6 — compliance checklists, document repository, support
-- tickets, announcements, SOP library, training tracking, notifications
-- Spec: Franchise.md §Core Modules > 6, 7, 8, 9 + Notifications
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'compliance_status') then
    create type public.compliance_status as enum (
      'not_started', 'pending_submission', 'submitted', 'approved', 'rejected', 'expired', 'overdue'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'document_review_status') then
    create type public.document_review_status as enum ('pending', 'approved', 'rejected', 'expired');
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_category') then
    create type public.ticket_category as enum (
      'operations', 'inventory', 'sales_reporting', 'compliance', 'training',
      'marketing', 'technical', 'supplier', 'other'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_priority') then
    create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_status') then
    create type public.ticket_status as enum (
      'open', 'in_progress', 'waiting_franchisee', 'waiting_head_office', 'resolved', 'closed'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'announcement_audience') then
    create type public.announcement_audience as enum (
      'all', 'franchisees', 'branch_managers', 'admins', 'finance', 'operations', 'trainers'
    );
  end if;
end$$;

-- ===========================================================================
-- COMPLIANCE
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Compliance requirement templates — configurable per franchisor / city /
-- region per CLAUDE.md PH context: LGU rules vary, NEVER hard-code.
-- ---------------------------------------------------------------------------
create table if not exists public.compliance_requirements (
  id                 uuid primary key default gen_random_uuid(),
  franchisor_id      uuid not null references public.franchisors(id) on delete cascade,
  name               text not null,
  description        text,
  category           text,                            -- e.g. 'permit', 'tax', 'health', 'safety'
  jurisdiction_city  text,                            -- null = applies everywhere
  jurisdiction_region text,
  required_attachment boolean not null default true,
  default_lead_days  integer not null default 30,    -- days before due_date to start reminding
  renewal_months     integer,                         -- recurring cycle (12 for annual permits)
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists compliance_requirements_franchisor_idx
  on public.compliance_requirements (franchisor_id, active);
alter table public.compliance_requirements enable row level security;

-- ---------------------------------------------------------------------------
-- Compliance records — per-branch instance of a requirement, with status
-- workflow and submitted document reference.
-- ---------------------------------------------------------------------------
create table if not exists public.compliance_records (
  id                  uuid primary key default gen_random_uuid(),
  franchisor_id       uuid not null references public.franchisors(id) on delete restrict,
  branch_id           uuid not null references public.branches(id) on delete cascade,
  requirement_id      uuid not null references public.compliance_requirements(id) on delete restrict,
  due_date            date,
  expiry_date         date,
  status              public.compliance_status not null default 'not_started',
  document_id         uuid,                            -- FK added after documents created
  submitted_at        timestamptz,
  submitted_by        uuid references auth.users(id) on delete set null,
  reviewed_at         timestamptz,
  reviewed_by         uuid references auth.users(id) on delete set null,
  reviewer_notes      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists compliance_records_branch_idx on public.compliance_records (branch_id, status);
create index if not exists compliance_records_due_idx    on public.compliance_records (franchisor_id, due_date) where status in ('not_started', 'pending_submission', 'overdue');
alter table public.compliance_records enable row level security;

-- ===========================================================================
-- DOCUMENTS
-- ===========================================================================

create table if not exists public.document_types (
  id                       uuid primary key default gen_random_uuid(),
  franchisor_id            uuid not null references public.franchisors(id) on delete cascade,
  name                     text not null,                -- 'Mayor''s Permit', 'BIR Certificate', etc.
  requires_expiry          boolean not null default true,
  default_retention_years  integer not null default 7,
  created_at               timestamptz not null default now()
);
create index if not exists document_types_franchisor_idx on public.document_types (franchisor_id);
alter table public.document_types enable row level security;

create table if not exists public.documents (
  id                uuid primary key default gen_random_uuid(),
  franchisor_id     uuid not null references public.franchisors(id) on delete restrict,
  branch_id         uuid references public.branches(id) on delete cascade,
  franchisee_id     uuid references public.franchisees(id) on delete cascade,
  document_type_id  uuid references public.document_types(id) on delete set null,
  file_name         text not null,
  storage_path      text not null,                       -- Supabase Storage path
  file_size_bytes   integer,
  mime_type         text,
  expiry_date       date,
  review_status     public.document_review_status not null default 'pending',
  reviewer_id       uuid references auth.users(id) on delete set null,
  reviewer_notes    text,
  uploaded_by       uuid references auth.users(id) on delete set null,
  uploaded_at       timestamptz not null default now(),
  archived_at       timestamptz,
  constraint document_scope_check check (branch_id is not null or franchisee_id is not null)
);
create index if not exists documents_branch_idx     on public.documents (branch_id);
create index if not exists documents_franchisee_idx on public.documents (franchisee_id);
create index if not exists documents_expiry_idx
  on public.documents (franchisor_id, expiry_date) where expiry_date is not null and archived_at is null;
alter table public.documents enable row level security;

-- Now we can FK compliance_records.document_id back to documents
alter table public.compliance_records
  add constraint compliance_records_document_fk
  foreign key (document_id) references public.documents(id) on delete set null;

-- ===========================================================================
-- SUPPORT TICKETING
-- ===========================================================================

create table if not exists public.support_tickets (
  id              uuid primary key default gen_random_uuid(),
  franchisor_id   uuid not null references public.franchisors(id) on delete restrict,
  branch_id       uuid references public.branches(id) on delete set null,
  submitted_by    uuid references auth.users(id) on delete set null,
  category        public.ticket_category not null,
  priority        public.ticket_priority not null default 'normal',
  subject         text not null,
  description     text,
  status          public.ticket_status not null default 'open',
  assigned_to     uuid references auth.users(id) on delete set null,
  resolved_at     timestamptz,
  resolved_by     uuid references auth.users(id) on delete set null,
  resolution_notes text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists support_tickets_franchisor_status_idx
  on public.support_tickets (franchisor_id, status, created_at desc);
create index if not exists support_tickets_assigned_idx
  on public.support_tickets (assigned_to) where status not in ('resolved', 'closed');
create index if not exists support_tickets_branch_idx
  on public.support_tickets (branch_id, status);
alter table public.support_tickets enable row level security;

create table if not exists public.ticket_messages (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references public.support_tickets(id) on delete cascade,
  author_id    uuid references auth.users(id) on delete set null,
  body         text not null,
  internal_note boolean not null default false,         -- true = admin-only note
  created_at   timestamptz not null default now()
);
create index if not exists ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);
alter table public.ticket_messages enable row level security;

create table if not exists public.ticket_attachments (
  id               uuid primary key default gen_random_uuid(),
  ticket_id        uuid not null references public.support_tickets(id) on delete cascade,
  storage_path     text not null,
  file_name        text not null,
  file_size_bytes  integer,
  mime_type        text,
  uploaded_by      uuid references auth.users(id) on delete set null,
  uploaded_at      timestamptz not null default now()
);
create index if not exists ticket_attachments_ticket_idx on public.ticket_attachments (ticket_id);
alter table public.ticket_attachments enable row level security;

-- ===========================================================================
-- ANNOUNCEMENTS, SOPs, TRAINING
-- ===========================================================================

create table if not exists public.announcements (
  id              uuid primary key default gen_random_uuid(),
  franchisor_id   uuid not null references public.franchisors(id) on delete cascade,
  title           text not null,
  body            text not null,
  audience        public.announcement_audience not null default 'all',
  pinned          boolean not null default false,
  published_at    timestamptz,
  expires_at      timestamptz,
  author_id       uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists announcements_franchisor_idx
  on public.announcements (franchisor_id, published_at desc) where published_at is not null;
alter table public.announcements enable row level security;

create table if not exists public.sop_articles (
  id              uuid primary key default gen_random_uuid(),
  franchisor_id   uuid not null references public.franchisors(id) on delete cascade,
  slug            text not null,
  title           text not null,
  body            text not null,                       -- markdown
  category        text,
  version         integer not null default 1,
  published_at    timestamptz,
  author_id       uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (franchisor_id, slug)
);
create index if not exists sop_articles_franchisor_idx on public.sop_articles (franchisor_id, category);
alter table public.sop_articles enable row level security;

create table if not exists public.training_modules (
  id                  uuid primary key default gen_random_uuid(),
  franchisor_id       uuid not null references public.franchisors(id) on delete cascade,
  title               text not null,
  description         text,
  content             text,                                 -- markdown / URL
  required_for_roles  public.app_role[] default '{}',       -- which roles must complete
  published_at        timestamptz,
  author_id           uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists training_modules_franchisor_idx on public.training_modules (franchisor_id);
alter table public.training_modules enable row level security;

create table if not exists public.training_completions (
  id            uuid primary key default gen_random_uuid(),
  module_id     uuid not null references public.training_modules(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  score         integer,                              -- 0-100 if module has assessment
  unique (module_id, user_id)
);
create index if not exists training_completions_user_idx on public.training_completions (user_id);
alter table public.training_completions enable row level security;

-- ===========================================================================
-- NOTIFICATIONS — in-app + drives email/SMS later
-- ===========================================================================

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,                          -- 'sales_report_approved', 'compliance_overdue', etc.
  title       text not null,
  body        text,
  link        text,                                    -- in-app deep link
  metadata    jsonb default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, created_at desc) where read_at is null;
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;

-- ===========================================================================
-- RLS POLICIES
-- ===========================================================================

-- compliance_requirements: read by anyone in franchisor; write by admin/ops.
create policy "compliance_requirements read scope"
  on public.compliance_requirements for select to authenticated using (
    public.is_super_admin() or franchisor_id = any (public.current_user_franchisor_ids())
  );
create policy "compliance_requirements write by admin"
  on public.compliance_requirements for all to authenticated using (
    public.is_super_admin()
    or (franchisor_id = any (public.current_user_franchisor_ids())
        and (public.has_role('head_office_admin') or public.has_role('operations')))
  ) with check (
    public.is_super_admin()
    or (franchisor_id = any (public.current_user_franchisor_ids())
        and (public.has_role('head_office_admin') or public.has_role('operations')))
  );

-- compliance_records: branch users see own; admin/ops see franchisor scope.
create policy "compliance_records read scope"
  on public.compliance_records for select to authenticated using (
    public.is_super_admin()
    or branch_id = any (public.current_user_branch_ids())
    or (franchisor_id = any (public.current_user_franchisor_ids())
        and (public.has_role('head_office_admin') or public.has_role('operations')
             or public.has_role('viewer')))
  );
create policy "compliance_records write own branch or admin"
  on public.compliance_records for all to authenticated using (
    public.is_super_admin()
    or branch_id = any (public.current_user_branch_ids())
    or (franchisor_id = any (public.current_user_franchisor_ids())
        and (public.has_role('head_office_admin') or public.has_role('operations')))
  ) with check (
    public.is_super_admin()
    or branch_id = any (public.current_user_branch_ids())
    or (franchisor_id = any (public.current_user_franchisor_ids())
        and (public.has_role('head_office_admin') or public.has_role('operations')))
  );

-- document_types
create policy "document_types read scope" on public.document_types for select to authenticated using (
  public.is_super_admin() or franchisor_id = any (public.current_user_franchisor_ids())
);
create policy "document_types write by admin" on public.document_types for all to authenticated using (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('operations')))
) with check (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('operations')))
);

-- documents
create policy "documents read scope" on public.documents for select to authenticated using (
  public.is_super_admin()
  or (branch_id is not null and branch_id = any (public.current_user_branch_ids()))
  or (franchisee_id is not null and franchisee_id = any (public.current_user_franchisee_ids()))
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('finance')
           or public.has_role('operations') or public.has_role('viewer')))
);
create policy "documents write scope" on public.documents for insert to authenticated with check (
  public.is_super_admin()
  or (branch_id is not null and branch_id = any (public.current_user_branch_ids()))
  or (franchisee_id is not null and franchisee_id = any (public.current_user_franchisee_ids()))
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('operations')))
);
create policy "documents update by reviewer or admin" on public.documents for update to authenticated using (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('operations')))
) with check (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('operations')))
);

-- support_tickets
create policy "support_tickets read scope" on public.support_tickets for select to authenticated using (
  public.is_super_admin()
  or submitted_by = auth.uid()
  or assigned_to = auth.uid()
  or (branch_id is not null and branch_id = any (public.current_user_branch_ids()))
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('operations')
           or public.has_role('finance') or public.has_role('trainer')
           or public.has_role('viewer')))
);
create policy "support_tickets submit by authenticated" on public.support_tickets for insert to authenticated with check (
  public.is_super_admin()
  or franchisor_id = any (public.current_user_franchisor_ids())
);
create policy "support_tickets update by participant or admin" on public.support_tickets for update to authenticated using (
  public.is_super_admin()
  or assigned_to = auth.uid()
  or submitted_by = auth.uid()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('operations')))
) with check (
  public.is_super_admin()
  or assigned_to = auth.uid()
  or submitted_by = auth.uid()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('operations')))
);

-- ticket_messages — read access piggybacks on parent ticket; insert allowed
-- to participants. internal_note=true messages further filtered in app code.
create policy "ticket_messages read" on public.ticket_messages for select to authenticated using (
  ticket_id in (select id from public.support_tickets)
  and (internal_note = false or public.has_role('head_office_admin')
       or public.has_role('operations') or public.is_super_admin())
);
create policy "ticket_messages write" on public.ticket_messages for insert to authenticated with check (
  ticket_id in (select id from public.support_tickets)
);

create policy "ticket_attachments read" on public.ticket_attachments for select to authenticated using (
  ticket_id in (select id from public.support_tickets)
);
create policy "ticket_attachments write" on public.ticket_attachments for insert to authenticated with check (
  ticket_id in (select id from public.support_tickets)
);

-- announcements
create policy "announcements read scope" on public.announcements for select to authenticated using (
  public.is_super_admin()
  or (
    franchisor_id = any (public.current_user_franchisor_ids())
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  )
);
create policy "announcements write by admin or trainer" on public.announcements for all to authenticated using (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('trainer')))
) with check (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('trainer')))
);

-- sop_articles — read by anyone in franchisor; write by admin/trainer.
create policy "sop_articles read scope" on public.sop_articles for select to authenticated using (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids()) and published_at is not null)
);
create policy "sop_articles write by admin or trainer" on public.sop_articles for all to authenticated using (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('trainer')))
) with check (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('trainer')))
);

-- training_modules
create policy "training_modules read scope" on public.training_modules for select to authenticated using (
  public.is_super_admin()
  or franchisor_id = any (public.current_user_franchisor_ids())
);
create policy "training_modules write by trainer" on public.training_modules for all to authenticated using (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('trainer')))
) with check (
  public.is_super_admin()
  or (franchisor_id = any (public.current_user_franchisor_ids())
      and (public.has_role('head_office_admin') or public.has_role('trainer')))
);

-- training_completions — users read own; trainers read franchisor; users insert own.
create policy "training_completions read" on public.training_completions for select to authenticated using (
  user_id = auth.uid()
  or public.is_super_admin()
  or (public.has_role('head_office_admin') or public.has_role('trainer')
      or public.has_role('operations'))
);
create policy "training_completions write own" on public.training_completions for insert to authenticated with check (
  user_id = auth.uid()
);
create policy "training_completions update by trainer" on public.training_completions for update to authenticated using (
  public.is_super_admin() or public.has_role('head_office_admin') or public.has_role('trainer')
) with check (
  public.is_super_admin() or public.has_role('head_office_admin') or public.has_role('trainer')
);

-- notifications — own only.
create policy "notifications read own" on public.notifications for select to authenticated using (
  user_id = auth.uid()
);
create policy "notifications insert by any authenticated" on public.notifications for insert to authenticated with check (
  auth.uid() is not null
);
create policy "notifications update own (mark read)" on public.notifications for update to authenticated using (
  user_id = auth.uid()
) with check (
  user_id = auth.uid()
);

-- ===========================================================================
-- AUDIT TRIGGERS (only on CBEs — skip ephemeral things like notifications)
-- ===========================================================================
create trigger compliance_requirements_audit after insert or update or delete on public.compliance_requirements for each row execute function public.audit_trigger();
create trigger compliance_records_audit      after insert or update or delete on public.compliance_records      for each row execute function public.audit_trigger();
create trigger documents_audit               after insert or update or delete on public.documents               for each row execute function public.audit_trigger();
create trigger support_tickets_audit         after insert or update or delete on public.support_tickets         for each row execute function public.audit_trigger();
create trigger announcements_audit           after insert or update or delete on public.announcements           for each row execute function public.audit_trigger();
create trigger sop_articles_audit            after insert or update or delete on public.sop_articles            for each row execute function public.audit_trigger();
create trigger training_modules_audit        after insert or update or delete on public.training_modules        for each row execute function public.audit_trigger();
