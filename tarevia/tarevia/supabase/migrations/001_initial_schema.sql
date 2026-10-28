-- Esquema inicial de Tarevia. Revisar y aplicar en un proyecto Supabase de desarrollo.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  timezone text not null default 'America/Bogota',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  color text not null default '#6656d9',
  description text,
  teacher text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  description text,
  kind text not null default 'Tarea' check (kind in ('Tarea','Trabajo','Proyecto','Taller','Lectura','Exposición','Investigación','Otro')),
  priority text not null default 'Media' check (priority in ('Baja','Media','Alta','Urgente')),
  status text not null default 'Pendiente' check (status in ('Pendiente','En progreso','Completada')),
  due_at timestamptz,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  scheduled_at timestamptz,
  topics text,
  preparation_level smallint check (preparation_level between 1 and 5),
  status text not null default 'Pendiente' check (status in ('Pendiente','Presentada','Cancelada')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  starts_at timestamptz,
  duration_minutes integer not null default 25 check (duration_minutes between 1 and 1440),
  objective text,
  status text not null default 'Planificada' check (status in ('Planificada','Realizada','Cancelada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subjects_user_idx on public.subjects(user_id);
create index if not exists tasks_user_due_idx on public.tasks(user_id,due_at);
create index if not exists evaluations_user_date_idx on public.evaluations(user_id,scheduled_at);
create index if not exists sessions_user_date_idx on public.study_sessions(user_id,starts_at);

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tasks enable row level security;
alter table public.evaluations enable row level security;
alter table public.study_sessions enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "subjects_manage_own" on public.subjects;
create policy "subjects_manage_own" on public.subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "tasks_manage_own" on public.tasks;
create policy "tasks_manage_own" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "evaluations_manage_own" on public.evaluations;
create policy "evaluations_manage_own" on public.evaluations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "sessions_manage_own" on public.study_sessions;
create policy "sessions_manage_own" on public.study_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
