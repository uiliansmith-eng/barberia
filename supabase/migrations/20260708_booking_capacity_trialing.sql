-- Now that Pro/Business checkout includes a 14-day trial, a tenant in
-- 'trialing' status should get unlimited bookings too, not just 'active' —
-- otherwise the trial wouldn't actually let them try the paid experience.

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
      and status in ('active', 'trialing')
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
