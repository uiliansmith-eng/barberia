import { createClient } from "@/lib/supabase/server";
import { toWallClockDate } from "@/lib/time";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function monthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
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

const FREE_PLAN_BOOKING_LIMIT = 50;

export async function getBookingUsage(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const now = new Date();
  const monthStartIso = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const [{ data: subscription }, { count }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("tenant_id", tenantId)
      .maybeSingle(),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", monthStartIso),
  ]);

  const isPaid =
    (subscription?.status === "active" || subscription?.status === "trialing") &&
    (subscription.plan === "pro" || subscription.plan === "business");

  return {
    isPaid,
    used: count ?? 0,
    limit: FREE_PLAN_BOOKING_LIMIT,
  };
}

export async function getExecutiveKpis(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { startIso, endIso } = monthRange();

  const [{ data: monthAppointments }, { data: barbers }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, price, starts_at, customer_id, barber_id, service_id, status, barbers(full_name), services(name)")
      .eq("tenant_id", tenantId)
      .gte("starts_at", startIso)
      .lt("starts_at", endIso)
      .neq("status", "cancelled"),
    supabase
      .from("barbers")
      .select("id, full_name, commission_pct")
      .eq("tenant_id", tenantId),
  ]);

  const appointments = monthAppointments ?? [];
  const completed = appointments.filter((a) => a.status === "completed");

  const revenue = completed.reduce((sum, a) => sum + Number(a.price), 0);
  const ticketMedio = completed.length > 0 ? revenue / completed.length : 0;

  const customerVisitCounts = new Map<string, number>();
  for (const a of completed) {
    customerVisitCounts.set(
      a.customer_id,
      (customerVisitCounts.get(a.customer_id) ?? 0) + 1
    );
  }
  const totalClientes = customerVisitCounts.size;
  const clientesRecurrentesMes = [...customerVisitCounts.values()].filter(
    (n) => n > 1
  ).length;

  const hourCounts = new Map<number, number>();
  for (const a of appointments) {
    const hour = toWallClockDate(a.starts_at).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }
  const horasPico = [...hourCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hour, count]) => ({ hour, count }));

  const barberStats = new Map<
    string,
    { name: string; commissionPct: number; revenue: number; citas: number }
  >();
  for (const b of barbers ?? []) {
    barberStats.set(b.id, {
      name: b.full_name,
      commissionPct: Number(b.commission_pct),
      revenue: 0,
      citas: 0,
    });
  }
  for (const a of completed) {
    const entry = barberStats.get(a.barber_id);
    if (!entry) continue;
    entry.revenue += Number(a.price);
    entry.citas += 1;
  }
  const rentabilidadBarberos = [...barberStats.values()]
    .map((b) => ({
      ...b,
      comision: b.revenue * (b.commissionPct / 100),
      beneficio: b.revenue * (1 - b.commissionPct / 100),
    }))
    .sort((a, b) => b.beneficio - a.beneficio);

  const serviceStats = new Map<string, { name: string; revenue: number; citas: number }>();
  for (const a of completed) {
    const name = a.services?.name ?? "Sin servicio";
    const entry = serviceStats.get(a.service_id) ?? { name, revenue: 0, citas: 0 };
    entry.revenue += Number(a.price);
    entry.citas += 1;
    serviceStats.set(a.service_id, entry);
  }
  const rentabilidadServicios = [...serviceStats.values()].sort(
    (a, b) => b.revenue - a.revenue
  );

  return {
    ticketMedio,
    totalClientes,
    clientesRecurrentesMes,
    horasPico,
    rentabilidadBarberos,
    rentabilidadServicios,
  };
}
