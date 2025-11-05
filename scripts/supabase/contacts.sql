-- Supabase schema for contact form submissions
-- Run this in Supabase SQL editor or psql connected to your project

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  name text not null,
  position text not null,
  phone text not null,
  email text not null,
  subject text not null,
  message text not null,
  attachment_filename text,
  status text default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

-- Migrate existing data if table already exists with old schema
-- Run this only if you have existing data to migrate
-- ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS company_name text;
-- ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS position text;
-- ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS phone text;
-- ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS attachment_filename text;
-- UPDATE public.contacts SET company_name = '' WHERE company_name IS NULL;
-- UPDATE public.contacts SET position = '' WHERE position IS NULL;
-- UPDATE public.contacts SET phone = '' WHERE phone IS NULL;

-- Helpful index for ordering/filtering
create index if not exists idx_contacts_created_at on public.contacts (created_at desc);
create index if not exists idx_contacts_status on public.contacts (status);

-- RLS: disable by default; enable with policies if using auth
alter table public.contacts enable row level security;

-- Simple policy for anon insert/select/update/delete during development
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'contacts' and policyname = 'dev_anon_all'
  ) then
    create policy dev_anon_all
      on public.contacts
      for all using (true) with check (true);
  end if;
end $$;
