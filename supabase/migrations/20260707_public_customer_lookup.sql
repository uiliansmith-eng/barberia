-- Lets a customer look up their own appointment history and visit count
-- by phone number (no password flow exists yet for the booking portal).

create or replace function public.public_customer_lookup(
  p_tenant_id uuid,
  p_phone text
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_customer customers%rowtype;
  v_result json;
begin
  select * into v_customer from customers
  where tenant_id = p_tenant_id and phone = p_phone;

  if not found then
    return json_build_object('found', false);
  end if;

  select json_build_object(
    'found', true,
    'full_name', v_customer.full_name,
    'visits', (
      select count(*) from appointments
      where customer_id = v_customer.id and status = 'completed'
    ),
    'appointments', coalesce((
      select json_agg(json_build_object(
        'id', a.id,
        'starts_at', a.starts_at,
        'status', a.status,
        'service_name', s.name,
        'barber_name', b.full_name,
        'price', a.price
      ) order by a.starts_at desc)
      from appointments a
      join services s on s.id = a.service_id
      join barbers b on b.id = a.barber_id
      where a.customer_id = v_customer.id
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.public_customer_lookup(uuid, text) to anon, authenticated;
