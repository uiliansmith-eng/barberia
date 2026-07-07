-- Submit (or update) a review — only allowed for a phone that has at least
-- one completed appointment at that tenant. One review per customer per
-- tenant (upsert on conflict).
create or replace function public.public_submit_review(
  p_tenant_id uuid,
  p_phone text,
  p_rating int,
  p_comment text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer customers%rowtype;
  v_has_completed boolean;
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'invalid_rating';
  end if;

  select * into v_customer from customers
  where tenant_id = p_tenant_id and phone = p_phone
  limit 1;

  if not found then
    raise exception 'customer_not_found';
  end if;

  select exists(
    select 1 from appointments
    where tenant_id = p_tenant_id and customer_id = v_customer.id and status = 'completed'
  ) into v_has_completed;

  if not v_has_completed then
    raise exception 'no_completed_visit';
  end if;

  insert into reviews (tenant_id, customer_id, rating, comment, customer_name)
  values (p_tenant_id, v_customer.id, p_rating, nullif(p_comment, ''), v_customer.full_name)
  on conflict (tenant_id, customer_id)
  do update set rating = excluded.rating, comment = excluded.comment, updated_at = now();

  return json_build_object('success', true);
end;
$$;

grant execute on function public.public_submit_review(uuid, text, int, text) to anon, authenticated;

-- List reviews + aggregate rating for a tenant
create or replace function public.public_get_reviews(p_tenant_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'average', coalesce((select round(avg(rating)::numeric, 1) from reviews where tenant_id = p_tenant_id), 0),
    'count', (select count(*) from reviews where tenant_id = p_tenant_id),
    'reviews', coalesce((
      select json_agg(json_build_object(
        'customer_name', r.customer_name,
        'rating', r.rating,
        'comment', r.comment,
        'created_at', r.created_at
      ) order by r.created_at desc)
      from reviews r
      where r.tenant_id = p_tenant_id
    ), '[]'::json)
  );
$$;

grant execute on function public.public_get_reviews(uuid) to anon, authenticated;
