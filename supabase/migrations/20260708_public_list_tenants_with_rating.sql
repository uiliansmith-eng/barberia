create or replace function public.public_list_tenants(p_query text default null)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return coalesce((
    select json_agg(json_build_object(
      'name', t.name,
      'slug', t.slug,
      'logo_url', t.logo_url,
      'address', l.address,
      'services_count', (select count(*) from services s where s.tenant_id = t.id and s.status = 'active'),
      'barbers_count', (select count(*) from barbers b where b.tenant_id = t.id and b.status = 'active'),
      'avg_rating', (select round(avg(rating)::numeric, 1) from reviews r where r.tenant_id = t.id),
      'reviews_count', (select count(*) from reviews r where r.tenant_id = t.id)
    ) order by t.name)
    from tenants t
    left join locations l on l.tenant_id = t.id and l.is_main = true
    where p_query is null or trim(p_query) = '' or t.name ilike '%' || p_query || '%'
  ), '[]'::json);
end;
$$;
