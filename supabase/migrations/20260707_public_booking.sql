-- Public customer-facing booking portal.
-- These are SECURITY DEFINER RPCs callable by the anon role: the booking
-- pages have no session, so every check that would normally come from RLS
-- has to happen inside these functions instead.

-- =========================================
-- Booking info: tenant + active services + active barbers, by slug
-- =========================================
create or replace function public.public_booking_info(p_slug text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tenant tenants%rowtype;
  v_result json;
begin
  select * into v_tenant from tenants where slug = p_slug;

  if not found then
    raise exception 'tenant_not_found';
  end if;

  select json_build_object(
    'tenant', json_build_object(
      'id', v_tenant.id,
      'name', v_tenant.name,
      'slug', v_tenant.slug,
      'logo_url', v_tenant.logo_url
    ),
    'services', coalesce((
      select json_agg(json_build_object(
        'id', s.id,
        'name', s.name,
        'duration_minutes', s.duration_minutes,
        'price', s.price
      ) order by s.name)
      from services s
      where s.tenant_id = v_tenant.id and s.status = 'active'
    ), '[]'::json),
    'barbers', coalesce((
      select json_agg(json_build_object(
        'id', b.id,
        'full_name', b.full_name,
        'specialty', b.specialty
      ) order by b.full_name)
      from barbers b
      where b.tenant_id = v_tenant.id and b.status = 'active'
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.public_booking_info(text) to anon, authenticated;

-- =========================================
-- Available time slots for a barber on a given date
-- =========================================
create or replace function public.public_available_slots(
  p_tenant_id uuid,
  p_barber_id uuid,
  p_date date,
  p_duration_minutes integer
)
returns text[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_weekday smallint := extract(dow from p_date);
  v_slots text[] := '{}';
  v_schedule record;
  v_slot_start time;
  v_slot_ts timestamptz;
  v_slot_end_ts timestamptz;
begin
  if not exists (select 1 from barbers where id = p_barber_id and tenant_id = p_tenant_id and status = 'active') then
    return v_slots;
  end if;

  for v_schedule in
    select start_time, end_time from schedules
    where barber_id = p_barber_id and tenant_id = p_tenant_id and weekday = v_weekday
  loop
    v_slot_start := v_schedule.start_time;
    while v_slot_start + (p_duration_minutes || ' minutes')::interval <= v_schedule.end_time loop
      v_slot_ts := (p_date || ' ' || v_slot_start)::timestamptz;
      v_slot_end_ts := v_slot_ts + (p_duration_minutes || ' minutes')::interval;

      if v_slot_ts > now()
        and not exists (
          select 1 from appointments a
          where a.barber_id = p_barber_id
            and a.tenant_id = p_tenant_id
            and a.status != 'cancelled'
            and a.starts_at < v_slot_end_ts
            and a.ends_at > v_slot_ts
        )
      then
        v_slots := array_append(v_slots, to_char(v_slot_start, 'HH24:MI'));
      end if;

      v_slot_start := v_slot_start + (30 || ' minutes')::interval;
    end loop;
  end loop;

  return v_slots;
end;
$$;

grant execute on function public.public_available_slots(uuid, uuid, date, integer) to anon, authenticated;

-- =========================================
-- Create a booking: find-or-create customer + insert appointment
-- =========================================
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

  select * into v_service from services
  where id = p_service_id and tenant_id = p_tenant_id and status = 'active';
  if not found then
    raise exception 'service_not_found';
  end if;

  if not exists (select 1 from barbers where id = p_barber_id and tenant_id = p_tenant_id and status = 'active') then
    raise exception 'barber_not_found';
  end if;

  -- Cast the same way public_available_slots does, so "11:30" always means
  -- the same absolute instant here as it did when the slot was offered —
  -- building a Date client-side and sending an ISO string would silently
  -- reinterpret it in the browser's local timezone instead.
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

grant execute on function public.public_create_booking(uuid, uuid, uuid, date, text, text, text, text, text) to anon, authenticated;
