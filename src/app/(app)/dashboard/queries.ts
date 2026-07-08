import { createClient } from "@/lib/supabase/server";
import { toWallClockDate } from "@/lib/time";

function todayRange() {
  return dayRange(0);
}

function dayRange(offsetDays: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

// `daysBack` calendar days ending today (inclusive) when offsetDays is 0;
// pass offsetDays: -7 to get the equivalent window one week earlier.
function daysRange(daysBack: number, offsetDays = 0) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + offsetDays + 1);
  const start = new Date(end);
  start.setDate(start.getDate() - daysBack);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function monthRange(offsetMonths = 0) {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offsetMonths, 1)
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offsetMonths + 1, 1)
  );
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

async function getRecurrenceRate(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  range: { startIso: string; endIso: string }
) {
  const { data } = await supabase
    .from("appointments")
    .select("customer_id")
    .eq("tenant_id", tenantId)
    .gte("starts_at", range.startIso)
    .lt("starts_at", range.endIso)
    .eq("status", "completed");

  const visitCounts = new Map<string, number>();
  for (const a of data ?? []) {
    visitCounts.set(a.customer_id, (visitCounts.get(a.customer_id) ?? 0) + 1);
  }
  const totalClientes = visitCounts.size;
  const clientesRecurrentes = [...visitCounts.values()].filter(
    (n) => n > 1
  ).length;

  return { totalClientes, clientesRecurrentes };
}

export async function getStatCards(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentMonthRecurrence: { totalClientes: number; clientesRecurrentesMes: number }
) {
  const today = todayRange();
  const yesterday = dayRange(-1);
  const thisWeek = daysRange(7, 0);
  const lastWeek = daysRange(7, -7);
  const lastMonth = monthRange(-1);

  const [
    { data: todayAppointments },
    { data: yesterdayAppointments },
    { count: newThisWeek },
    { count: newLastWeek },
    lastMonthRecurrence,
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, price, status")
      .eq("tenant_id", tenantId)
      .gte("starts_at", today.startIso)
      .lt("starts_at", today.endIso)
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select("id, price")
      .eq("tenant_id", tenantId)
      .gte("starts_at", yesterday.startIso)
      .lt("starts_at", yesterday.endIso)
      .neq("status", "cancelled"),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", thisWeek.startIso)
      .lt("created_at", thisWeek.endIso),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", lastWeek.startIso)
      .lt("created_at", lastWeek.endIso),
    getRecurrenceRate(tenantId, supabase, lastMonth),
  ]);

  const todayAppts = todayAppointments ?? [];
  const yesterdayAppts = yesterdayAppointments ?? [];

  const ingresosHoy = todayAppts.reduce((sum, a) => sum + Number(a.price), 0);
  const ingresosAyer = yesterdayAppts.reduce(
    (sum, a) => sum + Number(a.price),
    0
  );
  const ingresosDeltaPct =
    ingresosAyer > 0
      ? ((ingresosHoy - ingresosAyer) / ingresosAyer) * 100
      : ingresosHoy > 0
        ? 100
        : 0;

  const citasHoy = todayAppts.length;
  const citasDelta = citasHoy - yesterdayAppts.length;
  const citasPendientes = todayAppts.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ).length;

  const clientesNuevos = newThisWeek ?? 0;
  const clientesNuevosDelta = (newThisWeek ?? 0) - (newLastWeek ?? 0);

  const recurrenciaPct =
    currentMonthRecurrence.totalClientes > 0
      ? (currentMonthRecurrence.clientesRecurrentesMes /
          currentMonthRecurrence.totalClientes) *
        100
      : 0;
  const recurrenciaPctAnterior =
    lastMonthRecurrence.totalClientes > 0
      ? (lastMonthRecurrence.clientesRecurrentes /
          lastMonthRecurrence.totalClientes) *
        100
      : 0;
  const recurrenciaDelta = recurrenciaPct - recurrenciaPctAnterior;

  return {
    ingresosHoy,
    ingresosDeltaPct,
    serviciosHoy: citasHoy,
    citasHoy,
    citasDelta,
    citasPendientes,
    clientesNuevos,
    clientesNuevosDelta,
    recurrenciaPct,
    recurrenciaDelta,
  };
}

export async function getRevenueLast7Days(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { startIso, endIso } = daysRange(7, 0);

  const { data } = await supabase
    .from("appointments")
    .select("starts_at, price")
    .eq("tenant_id", tenantId)
    .gte("starts_at", startIso)
    .lt("starts_at", endIso)
    .neq("status", "cancelled");

  const totalsByDay = new Map<string, number>();
  for (const a of data ?? []) {
    const key = dateKey(toWallClockDate(a.starts_at));
    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + Number(a.price));
  }

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      day: WEEKDAY_LABELS[d.getDay()],
      amount: totalsByDay.get(dateKey(d)) ?? 0,
    });
  }

  return {
    days,
    total: days.reduce((sum, d) => sum + d.amount, 0),
  };
}

export async function getTodayAgenda(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { startIso, endIso } = todayRange();

  const { data } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, customers(full_name), barbers(full_name), services(name)"
    )
    .eq("tenant_id", tenantId)
    .gte("starts_at", startIso)
    .lt("starts_at", endIso)
    .neq("status", "cancelled")
    .order("starts_at", { ascending: true })
    .limit(5);

  const nowIso = new Date().toISOString();

  return (data ?? []).map((a) => {
    let bucket: "done" | "now" | "upcoming";
    if (a.status === "completed" || a.status === "no_show" || a.ends_at < nowIso) {
      bucket = "done";
    } else if (a.starts_at <= nowIso) {
      bucket = "now";
    } else {
      bucket = "upcoming";
    }

    return {
      id: a.id,
      time: toWallClockDate(a.starts_at).toTimeString().slice(0, 5),
      client: a.customers?.full_name ?? "Cliente",
      service: a.services?.name ?? "Servicio",
      barber: a.barbers?.full_name ?? "—",
      bucket,
    };
  });
}

export async function getInventorySummary(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase
    .from("inventory_items")
    .select("id, name, stock, unit, low_stock_threshold, medium_stock_threshold")
    .eq("tenant_id", tenantId);

  const severity = { low: 0, mid: 1, ok: 2 } as const;
  const withLevel = (data ?? []).map((i) => ({
    ...i,
    level:
      i.stock <= i.low_stock_threshold
        ? ("low" as const)
        : i.stock <= i.medium_stock_threshold
          ? ("mid" as const)
          : ("ok" as const),
  }));

  const items = [...withLevel]
    .sort((a, b) => severity[a.level] - severity[b.level] || a.stock - b.stock)
    .slice(0, 5);

  return {
    items,
    lowStockCount: withLevel.filter((i) => i.level === "low").length,
  };
}

const FREE_PLAN_BOOKING_LIMIT = 50;

export async function getBookingUsage(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  isPaid: boolean
) {
  const now = new Date();
  const monthStartIso = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("created_at", monthStartIso);

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
