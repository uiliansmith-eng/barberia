-- BarberFlow AI - Initial Schema (multi-tenant)
-- Tenants -> Locations -> Profiles/Customers/Barbers/Services/Appointments/Schedules/Subscriptions

create extension if not exists "pgcrypto";

-- =========================================
-- ENUMS
-- =========================================
create type user_role as enum ('owner', 'manager', 'barber', 'receptionist', 'customer');
create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
create type subscription_plan as enum ('trial', 'pro', 'business');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');
create type service_status as enum ('active', 'inactive');
create type barber_status as enum ('active', 'inactive');

-- =========================================
-- TENANTS
-- =========================================
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  timezone text not null default 'Europe/Madrid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================
-- LOCATIONS (sucursales)
-- =========================================
create table locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  is_main boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_locations_tenant on locations(tenant_id);

-- =========================================
-- PROFILES (users linked to auth.users)
-- =========================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_tenant on profiles(tenant_id);

-- =========================================
-- CUSTOMERS
-- =========================================
create table customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  birth_date date,
  last_visit_at timestamptz,
  total_spent numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_tenant on customers(tenant_id);
create index idx_customers_phone on customers(tenant_id, phone);

-- =========================================
-- BARBERS
-- =========================================
create table barbers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  specialty text,
  commission_pct numeric(5,2) not null default 0,
  status barber_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_barbers_tenant on barbers(tenant_id);

-- =========================================
-- SERVICES
-- =========================================
create table services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  duration_minutes integer not null default 30,
  price numeric(10,2) not null default 0,
  status service_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_tenant on services(tenant_id);

-- =========================================
-- SCHEDULES (working hours per barber)
-- =========================================
create table schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  barber_id uuid not null references barbers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create index idx_schedules_tenant on schedules(tenant_id);
create index idx_schedules_barber on schedules(barber_id);

-- =========================================
-- APPOINTMENTS
-- =========================================
create table appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  customer_id uuid not null references customers(id) on delete cascade,
  barber_id uuid not null references barbers(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status appointment_status not null default 'scheduled',
  price numeric(10,2) not null default 0,
  notes text,
  reminder_24h_sent_at timestamptz,
  reminder_2h_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_appointments_tenant on appointments(tenant_id);
create index idx_appointments_barber_time on appointments(barber_id, starts_at);
create index idx_appointments_customer on appointments(customer_id);

-- =========================================
-- SUBSCRIPTIONS (Stripe)
-- =========================================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan subscription_plan not null default 'trial',
  status subscription_status not null default 'trialing',
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_tenant on subscriptions(tenant_id);

-- =========================================
-- updated_at triggers
-- =========================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_tenants_updated_at before update on tenants
  for each row execute function set_updated_at();
create trigger trg_locations_updated_at before update on locations
  for each row execute function set_updated_at();
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_customers_updated_at before update on customers
  for each row execute function set_updated_at();
create trigger trg_barbers_updated_at before update on barbers
  for each row execute function set_updated_at();
create trigger trg_services_updated_at before update on services
  for each row execute function set_updated_at();
create trigger trg_appointments_updated_at before update on appointments
  for each row execute function set_updated_at();
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- =========================================
-- Helper: current user's tenant_id
-- =========================================
create or replace function auth_tenant_id()
returns uuid as $$
  select tenant_id from profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function auth_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================
alter table tenants enable row level security;
alter table locations enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table barbers enable row level security;
alter table services enable row level security;
alter table schedules enable row level security;
alter table appointments enable row level security;
alter table subscriptions enable row level security;

-- Tenants: members can read their own tenant
create policy "tenants_select_own" on tenants
  for select using (id = auth_tenant_id());

create policy "tenants_update_owner" on tenants
  for update using (id = auth_tenant_id() and auth_role() in ('owner'));

-- Locations
create policy "locations_select" on locations
  for select using (tenant_id = auth_tenant_id());
create policy "locations_write" on locations
  for all using (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'))
  with check (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'));

-- Profiles: user can see own profile + tenant members if staff
create policy "profiles_select_self" on profiles
  for select using (id = auth.uid());
create policy "profiles_select_tenant_staff" on profiles
  for select using (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager','receptionist'));
create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());
create policy "profiles_write_owner" on profiles
  for all using (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'))
  with check (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'));

-- Customers
create policy "customers_all_staff" on customers
  for all using (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager','receptionist','barber'))
  with check (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager','receptionist','barber'));

-- Barbers
create policy "barbers_select" on barbers
  for select using (tenant_id = auth_tenant_id());
create policy "barbers_write" on barbers
  for all using (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'))
  with check (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'));

-- Services
create policy "services_select" on services
  for select using (tenant_id = auth_tenant_id());
create policy "services_write" on services
  for all using (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'))
  with check (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'));

-- Schedules
create policy "schedules_select" on schedules
  for select using (tenant_id = auth_tenant_id());
create policy "schedules_write" on schedules
  for all using (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'))
  with check (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager'));

-- Appointments
create policy "appointments_all_staff" on appointments
  for all using (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager','receptionist','barber'))
  with check (tenant_id = auth_tenant_id() and auth_role() in ('owner','manager','receptionist','barber'));

-- Subscriptions
create policy "subscriptions_select" on subscriptions
  for select using (tenant_id = auth_tenant_id());
create policy "subscriptions_write_owner" on subscriptions
  for all using (tenant_id = auth_tenant_id() and auth_role() = 'owner')
  with check (tenant_id = auth_tenant_id() and auth_role() = 'owner');
