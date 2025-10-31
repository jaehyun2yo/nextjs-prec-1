-- Supabase schema for portfolio management
-- Run this in Supabase SQL editor or psql connected to your project

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  field text not null,
  purpose text not null,
  type text not null,
  format text not null,
  size text not null,
  paper text not null,
  printing text not null,
  finishing text not null,
  description text not null,
  images jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

-- Helpful index for ordering/filtering
create index if not exists idx_portfolio_created_at on public.portfolio (created_at desc);

-- RLS: disable by default; enable with policies if using auth
alter table public.portfolio enable row level security;

-- Simple policy for anon insert/select/update/delete during development
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'portfolio' and policyname = 'dev_anon_all'
  ) then
    create policy dev_anon_all
      on public.portfolio
      for all using (true) with check (true);
  end if;
end $$;


