import { createClient } from "@/lib/supabase/server";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

export async function getDashboardKpis(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { startIso, endIso } = todayRange();

  const [{ data: todaysAppointments }, { count: newCustomersCount }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id, price, customer_id, service_id, services(name)")
        .eq("tenant_id", tenantId)
        .gte("starts_at", startIso)
        .lt("starts_at", endIso)
        .neq("status", "cancelled"),
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .gte("created_at", startIso)
        .lt("created_at", endIso),
    ]);

  const appointments = todaysAppointments ?? [];
  const citasHoy = appointments.length;
  const ingresosHoy = appointments.reduce((sum, a) => sum + Number(a.price), 0);
  const clientesNuevos = newCustomersCount ?? 0;

  const customerIds = [...new Set(appointments.map((a) => a.customer_id))];
  let clientesRecurrentes = 0;

  if (customerIds.length > 0) {
    const { data: priorVisits } = await supabase
      .from("appointments")
      .select("customer_id")
      .eq("tenant_id", tenantId)
      .in("customer_id", customerIds)
      .lt("starts_at", startIso)
      .neq("status", "cancelled");

    clientesRecurrentes = new Set(
      (priorVisits ?? []).map((v) => v.customer_id)
    ).size;
  }

  const serviceCounts = new Map<string, { name: string; count: number }>();
  for (const a of appointments) {
    const name = a.services?.name ?? "Sin servicio";
    const entry = serviceCounts.get(a.service_id) ?? { name, count: 0 };
    entry.count += 1;
    serviceCounts.set(a.service_id, entry);
  }
  const serviciosMasVendidos = Array.from(serviceCounts.values()).sort(
    (a, b) => b.count - a.count
  );

  return {
    citasHoy,
    ingresosHoy,
    clientesNuevos,
    clientesRecurrentes,
    serviciosMasVendidos,
  };
}
