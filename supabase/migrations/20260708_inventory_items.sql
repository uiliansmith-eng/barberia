-- =========================================
-- INVENTORY ITEMS (stock de productos por barbería)
-- =========================================
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  stock integer not null default 0,
  unit text not null default 'uds',
  low_stock_threshold integer not null default 5,
  medium_stock_threshold integer not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_inventory_items_tenant on inventory_items(tenant_id);

create trigger trg_inventory_items_updated_at before update on inventory_items
  for each row execute function set_updated_at();

alter table inventory_items enable row level security;

create policy "inventory_items_select" on inventory_items
  for select using (tenant_id = auth_tenant_id());

create policy "inventory_items_write" on inventory_items
  for all using (tenant_id = auth_tenant_id() and auth_role() in ('owner', 'manager'))
  with check (tenant_id = auth_tenant_id() and auth_role() in ('owner', 'manager'));
