-- Customer reviews for a barbershop. Public read (shown on the directory
-- and the booking portal); writes only via public_submit_review, which
-- verifies the customer actually had a completed appointment first.

create table reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  customer_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, customer_id)
);

alter table reviews enable row level security;

create policy "reviews_select_public" on reviews
  for select
  using (true);

create index reviews_tenant_id_idx on reviews (tenant_id);
