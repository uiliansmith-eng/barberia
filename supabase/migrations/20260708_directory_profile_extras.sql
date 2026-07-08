-- Directory search/filters + richer client-facing shop profile.
-- price_tier and open_now are derived from real data (service prices,
-- barber schedules + tenant timezone) — no fabricated distance, since the
-- schema has no lat/lng to compute it from honestly.

drop function if exists public.public_list_tenants(text);

create or replace function public.public_list_tenants(
  p_query text default null,
  p_service text default null,
  p_open_now boolean default null,
  p_sort text default null,
  p_area text default null
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return coalesce((
    select json_agg(row_to_json(x) order by
      case when p_sort = 'rating' then x.avg_rating end desc nulls last,
      x.name
    )
    from (
      select
        t.id,
        t.name,
        t.slug,
        t.logo_url,
        l.address,
        (select count(*) from services s where s.tenant_id = t.id and s.status = 'active') as services_count,
        (select count(*) from barbers b where b.tenant_id = t.id and b.status = 'active') as barbers_count,
        (select round(avg(rating)::numeric, 1) from reviews r where r.tenant_id = t.id) as avg_rating,
        (select count(*) from reviews r where r.tenant_id = t.id) as reviews_count,
        (select case
           when avg(s.price) is null then null
           when avg(s.price) < 15 then '€'
           when avg(s.price) < 30 then '€€'
           else '€€€'
         end
         from services s where s.tenant_id = t.id and s.status = 'active'
        ) as price_tier,
        (select coalesce(json_agg(sub.name order by sub.name), '[]'::json)
         from (
           select distinct s2.name from services s2
           where s2.tenant_id = t.id and s2.status = 'active'
           order by s2.name limit 3
         ) sub
        ) as tags,
        exists (
          select 1 from schedules sch
          join barbers b on b.id = sch.barber_id and b.status = 'active'
          where sch.tenant_id = t.id
            and sch.weekday = extract(dow from (now() at time zone t.timezone))::int
            and (now() at time zone t.timezone)::time between sch.start_time and sch.end_time
        ) as open_now
      from tenants t
      left join locations l on l.tenant_id = t.id and l.is_main = true
      where (p_query is null or trim(p_query) = '' or t.name ilike '%' || p_query || '%')
        and (p_area is null or trim(p_area) = '' or l.address ilike '%' || p_area || '%')
        and (p_service is null or trim(p_service) = '' or exists (
          select 1 from services s3
          where s3.tenant_id = t.id and s3.status = 'active' and s3.name ilike '%' || p_service || '%'
        ))
    ) x
    where (p_open_now is null or p_open_now = false or x.open_now = true)
  ), '[]'::json);
end;
$$;

grant execute on function public.public_list_tenants(text, text, boolean, text, text) to anon, authenticated;

-- Richer booking_info: rating, price tier, tags, open-now, weekly hours.
create or replace function public.public_booking_info(p_slug text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tenant tenants%rowtype;
  v_today_dow int;
  v_result json;
begin
  select * into v_tenant from tenants where slug = p_slug;

  if not found then
    raise exception 'tenant_not_found';
  end if;

  v_today_dow := extract(dow from (now() at time zone v_tenant.timezone))::int;

  select json_build_object(
    'tenant', json_build_object(
      'id', v_tenant.id,
      'name', v_tenant.name,
      'slug', v_tenant.slug,
      'logo_url', v_tenant.logo_url,
      'address', (select address from locations where tenant_id = v_tenant.id and is_main = true limit 1),
      'avg_rating', (select round(avg(rating)::numeric, 1) from reviews where tenant_id = v_tenant.id),
      'reviews_count', (select count(*) from reviews where tenant_id = v_tenant.id),
      'price_tier', (
        select case
          when avg(price) is null then null
          when avg(price) < 15 then '€'
          when avg(price) < 30 then '€€'
          else '€€€'
        end
        from services where tenant_id = v_tenant.id and status = 'active'
      ),
      'tags', coalesce((
        select json_agg(sub.name order by sub.name) from (
          select distinct name from services
          where tenant_id = v_tenant.id and status = 'active'
          order by name limit 3
        ) sub
      ), '[]'::json),
      'open_now', exists (
        select 1 from schedules sch
        join barbers b on b.id = sch.barber_id and b.status = 'active'
        where sch.tenant_id = v_tenant.id
          and sch.weekday = v_today_dow
          and (now() at time zone v_tenant.timezone)::time between sch.start_time and sch.end_time
      )
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
    ), '[]'::json),
    'hours', (
      select json_agg(json_build_object(
        'label', (array['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'])[d.dow + 1],
        'is_today', d.dow = v_today_dow,
        'range', (
          select case
            when min(sch.start_time) is null then 'Cerrado'
            else to_char(min(sch.start_time), 'HH24:MI') || ' – ' || to_char(max(sch.end_time), 'HH24:MI')
          end
          from schedules sch
          join barbers b on b.id = sch.barber_id and b.status = 'active'
          where sch.tenant_id = v_tenant.id and sch.weekday = d.dow
        )
      ) order by (d.dow + 6) % 7)
      from generate_series(0, 6) as d(dow)
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.public_booking_info(text) to anon, authenticated;
