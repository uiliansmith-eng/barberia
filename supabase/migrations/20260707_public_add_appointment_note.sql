-- Lets a customer send a quick note on their own appointment (e.g. "running
-- 10 min late", "need to reschedule", a question) without any real-time
-- messaging infra — it's appended to appointments.notes, which staff already
-- see on the appointment card in the Agenda.

create or replace function public.public_add_appointment_note(
  p_appointment_id uuid,
  p_tenant_id uuid,
  p_phone text,
  p_message text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment appointments%rowtype;
begin
  if trim(coalesce(p_message, '')) = '' then
    raise exception 'message_required';
  end if;

  select a.* into v_appointment
  from appointments a
  join customers c on c.id = a.customer_id
  where a.id = p_appointment_id
    and a.tenant_id = p_tenant_id
    and c.phone = p_phone;

  if not found then
    raise exception 'appointment_not_found';
  end if;

  update appointments
  set notes = trim(both E'\n' from
    coalesce(notes || E'\n', '') ||
    '[' || to_char(now(), 'DD/MM HH24:MI') || ' - cliente] ' || p_message
  )
  where id = p_appointment_id;

  return json_build_object('ok', true);
end;
$$;

grant execute on function public.public_add_appointment_note(uuid, uuid, text, text) to anon, authenticated;
