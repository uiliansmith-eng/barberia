-- Free-plan booking cap: 50 appointments created per calendar month.
-- Tenants with an active pro/business subscription are unlimited. Since the
-- Stripe subscriptions module was never wired up, every existing tenant has
-- no subscriptions row at all, so this cap applies to all of them today.

create or replace function public.tenant_has_booking_capacity(p_tenant_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_is_paid boolean;
  v_count int;
begin
  select exists(
    select 1 from subscriptions
    where tenant_id = p_tenant_id
      and status = 'active'
      and plan in ('pro', 'business')
  ) into v_is_paid;

  if v_is_paid then
    return true;
  end if;

  select count(*) into v_count
  from appointments
  where tenant_id = p_tenant_id
    and created_at >= date_trunc('month', now());

  return v_count < 50;
end;
$$;

grant execute on function public.tenant_has_booking_capacity(uuid) to anon, authenticated;

-- Enforce it inside public_create_booking (the customer-facing directory/
-- booking-page flow). Re-created in full since Postgres can't add a
-- statement to an existing function body.
create or replace function public.public_create_booking(
  p_tenant_id uuid,
  p_barber_id uuid,
  p_service_id uuid,
  p_date date,
  p_time text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_notes text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service services%rowtype;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_customer_id uuid;
  v_appointment_id uuid;
  v_location_id uuid;
begin
  if trim(coalesce(p_customer_name, '')) = '' then
    raise exception 'customer_name_required';
  end if;

  if not tenant_has_booking_capacity(p_tenant_id) then
    raise exception 'booking_limit_reached';
  end if;

  select * into v_service from services
  where id = p_service_id and tenant_id = p_tenant_id and status = 'active';
  if not found then
    raise exception 'service_not_found';
  end if;

  if not exists (select 1 from barbers where id = p_barber_id and tenant_id = p_tenant_id and status = 'active') then
    raise exception 'barber_not_found';
  end if;

  v_starts_at := (p_date || ' ' || p_time)::timestamptz;

  if v_starts_at <= now() then
    raise exception 'slot_in_past';
  end if;

  v_ends_at := v_starts_at + (v_service.duration_minutes || ' minutes')::interval;

  if exists (
    select 1 from appointments a
    where a.barber_id = p_barber_id
      and a.tenant_id = p_tenant_id
      and a.status != 'cancelled'
      and a.starts_at < v_ends_at
      and a.ends_at > v_starts_at
  ) then
    raise exception 'slot_unavailable';
  end if;

  select id into v_location_id from locations where tenant_id = p_tenant_id and is_main = true limit 1;

  if p_customer_phone is not null and trim(p_customer_phone) != '' then
    select id into v_customer_id from customers
    where tenant_id = p_tenant_id and phone = p_customer_phone
    limit 1;
  end if;

  if v_customer_id is null then
    insert into customers (tenant_id, location_id, full_name, phone, email)
    values (p_tenant_id, v_location_id, p_customer_name, nullif(p_customer_phone, ''), nullif(p_customer_email, ''))
    returning id into v_customer_id;
  end if;

  insert into appointments (
    tenant_id, location_id, customer_id, barber_id, service_id,
    starts_at, ends_at, status, price, notes
  )
  values (
    p_tenant_id, v_location_id, v_customer_id, p_barber_id, p_service_id,
    v_starts_at, v_ends_at, 'scheduled', v_service.price, nullif(p_notes, '')
  )
  returning id into v_appointment_id;

  return json_build_object(
    'appointment_id', v_appointment_id,
    'starts_at', v_starts_at,
    'ends_at', v_ends_at,
    'service_name', v_service.name,
    'price', v_service.price
  );
end;
$$;
