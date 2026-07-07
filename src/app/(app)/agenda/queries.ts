import { createClient } from "@/lib/supabase/server";

export async function getAgendaContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) return null;

  return { supabase, tenantId: profile.tenant_id };
}

export async function getAppointmentsBetween(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  startIso: string,
  endIso: string
) {
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, notes, barber_id, customer_id, service_id, price, customers(full_name, phone), barbers(full_name), services(name)"
    )
    .eq("tenant_id", tenantId)
    .gte("starts_at", startIso)
    .lt("starts_at", endIso)
    .neq("status", "cancelled")
    .order("starts_at", { ascending: true });

  return data ?? [];
}

export async function getAgendaFormOptions(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const [{ data: customers }, { data: barbers }, { data: services }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, full_name, phone")
        .eq("tenant_id", tenantId)
        .order("full_name"),
      supabase
        .from("barbers")
        .select("id, full_name")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("full_name"),
      supabase
        .from("services")
        .select("id, name, duration_minutes, price")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("name"),
    ]);

  return {
    customers: customers ?? [],
    barbers: barbers ?? [],
    services: services ?? [],
  };
}
