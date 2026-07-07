create extension if not exists "unaccent";

-- Atomically creates the tenant, its main location, and links the owner's
-- profile. Runs as SECURITY DEFINER so it doesn't need extra RLS insert
-- policies on tenants/locations for the onboarding step.
create or replace function public.complete_onboarding(
  business_name text,
  business_phone text,
  business_address text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_location_id uuid;
  v_base_slug text;
  v_slug text;
  v_suffix int := 0;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from profiles where id = auth.uid() and tenant_id is not null) then
    raise exception 'already_onboarded';
  end if;

  v_base_slug := trim(both '-' from lower(regexp_replace(unaccent(business_name), '[^a-zA-Z0-9]+', '-', 'g')));
  if v_base_slug = '' then
    v_base_slug := 'barberia';
  end if;
  v_slug := v_base_slug;

  while exists (select 1 from tenants where slug = v_slug) loop
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix;
  end loop;

  insert into tenants (name, slug) values (business_name, v_slug)
  returning id into v_tenant_id;

  insert into locations (tenant_id, name, address, phone, is_main)
  values (v_tenant_id, business_name, nullif(business_address, ''), nullif(business_phone, ''), true)
  returning id into v_location_id;

  update profiles
  set tenant_id = v_tenant_id, location_id = v_location_id
  where id = auth.uid();

  return v_tenant_id;
end;
$$;

grant execute on function public.complete_onboarding(text, text, text) to authenticated;
