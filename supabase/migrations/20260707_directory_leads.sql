-- Lead capture for the barbershop directory. Anyone (a barbershop owner who
-- saw the landing page, or someone on our own team) can submit a request to
-- be listed — this does NOT create a tenant/auth account, it's reviewed and
-- onboarded manually. No SELECT policy is granted here on purpose: leads are
-- only readable via the Supabase dashboard / service role, not the app.

create table directory_leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  phone text not null,
  email text not null,
  city text,
  source text not null default 'owner',
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table directory_leads enable row level security;

create policy "directory_leads_insert_anyone" on directory_leads
  for insert
  with check (true);
