/* 
==============================================================================
RastreWeb - Multi-tenant SaaS Schema & RLS Security Policies
==============================================================================
*/

-- Enable pgcrypto extension for UUIDs and random bytes generation
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Accounts Table (Contas dos assinantes do SaaS)
-- ------------------------------------------------------------------------------
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade not null,
  name text default 'Minha Conta',
  plan text default 'trial',
  monthly_session_quota int default 1000,
  sessions_used_this_cycle int default 0,
  stripe_customer_id text,
  stripe_subscription_status text default 'trialing',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_accounts_owner on public.accounts(owner_user_id);

-- ------------------------------------------------------------------------------
-- 2. Projects Table (Sites cadastrados por cada cliente)
-- ------------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete cascade not null,
  name text not null,
  domain text,
  site_key text not null unique default encode(gen_random_bytes(12), 'hex'),
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_projects_account on public.projects(account_id);
create index if not exists idx_projects_site_key on public.projects(site_key);

-- ------------------------------------------------------------------------------
-- 3. Sessions Table (Metadados das sessões gravadas)
-- ------------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  account_id uuid references public.accounts(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  page_entry text,
  device text default 'desktop',
  browser text,
  os text,
  country text default 'BR',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds int default 0,
  page_count int default 1,
  rage_click boolean default false,
  storage_path text,
  created_at timestamptz default now()
);

create index if not exists idx_sessions_project_started on public.sessions(project_id, started_at desc);
create index if not exists idx_sessions_account on public.sessions(account_id);
create index if not exists idx_sessions_rage_click on public.sessions(project_id, rage_click) where rage_click = true;

-- ------------------------------------------------------------------------------
-- 4. Heatmap Events Table (Eventos de cliques e scroll agregados)
-- ------------------------------------------------------------------------------
create table if not exists public.heatmap_events (
  id bigserial primary key,
  account_id uuid references public.accounts(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  page_path text not null,
  event_type text not null,
  x_percent numeric(5, 2),
  y_percent numeric(5, 2),
  viewport_width int,
  session_id text,
  created_at timestamptz default now()
);

create index if not exists idx_heatmap_project_page on public.heatmap_events(project_id, page_path);
create index if not exists idx_heatmap_account on public.heatmap_events(account_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ------------------------------------------------------------------------------

alter table public.accounts enable row level security;
alter table public.projects enable row level security;
alter table public.sessions enable row level security;
alter table public.heatmap_events enable row level security;

-- Helper function to check if the current auth user owns the account
create or replace function public.fn_current_user_account_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select id from public.accounts where owner_user_id = auth.uid();
$$;

-- RLS Policies for accounts
drop policy if exists "Users can view their own accounts" on public.accounts;
create policy "Users can view their own accounts"
  on public.accounts for select
  using (owner_user_id = auth.uid());

drop policy if exists "Users can update their own accounts" on public.accounts;
create policy "Users can update their own accounts"
  on public.accounts for update
  using (owner_user_id = auth.uid());

-- RLS Policies for projects
drop policy if exists "Account owners can manage their projects" on public.projects;
create policy "Account owners can manage their projects"
  on public.projects for all
  using (account_id in (select public.fn_current_user_account_ids()));

-- RLS Policies for sessions
drop policy if exists "Account owners can view their sessions" on public.sessions;
create policy "Account owners can view their sessions"
  on public.sessions for select
  using (account_id in (select public.fn_current_user_account_ids()));

drop policy if exists "Account owners can delete their sessions" on public.sessions;
create policy "Account owners can delete their sessions"
  on public.sessions for delete
  using (account_id in (select public.fn_current_user_account_ids()));

-- RLS Policies for heatmap_events
drop policy if exists "Account owners can view their heatmap events" on public.heatmap_events;
create policy "Account owners can view their heatmap events"
  on public.heatmap_events for select
  using (account_id in (select public.fn_current_user_account_ids()));

drop policy if exists "Account owners can delete their heatmap events" on public.heatmap_events;
create policy "Account owners can delete their heatmap events"
  on public.heatmap_events for delete
  using (account_id in (select public.fn_current_user_account_ids()));

-- ------------------------------------------------------------------------------
-- AUTOMATIC ACCOUNT CREATION TRIGGER ON AUTH SIGNUP
-- ------------------------------------------------------------------------------

create or replace function public.handle_new_user_signup()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.accounts (owner_user_id, name, plan, monthly_session_quota)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Minha Conta'),
    'trial',
    1000
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_signup();

-- ------------------------------------------------------------------------------
-- STORAGE BUCKET INITIALIZATION SQL
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

drop policy if exists "Users can access recordings from their account" on storage.objects;
create policy "Users can access recordings from their account"
  on storage.objects for select
  using (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] in (select id::text from public.accounts where owner_user_id = auth.uid())
  );
