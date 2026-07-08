import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getExecutiveKpis,
  getStatCards,
  getRevenueLast7Days,
  getTodayAgenda,
  getInventorySummary,
  getBookingUsage,
} from "./queries";
import { getAgendaFormOptions } from "@/app/(app)/agenda/queries";
import { BookingLinkCard } from "@/components/dashboard/booking-link-card";
import { AppointmentsRealtimeRefresher } from "@/components/agenda/realtime-refresher";
import { BookingUsageBanner } from "@/components/dashboard/booking-usage-banner";
import { StripeConnectCard } from "@/components/dashboard/stripe-connect-card";
import { PlanCard } from "@/components/dashboard/plan-card";
import { RangeSelector } from "@/components/dashboard/range-selector";
import { NewAppointmentButton } from "@/components/agenda/new-appointment-button";
import { Paywall } from "@/components/dashboard/paywall";
import { getSubscriptionInfo } from "@/lib/subscription";

const GOLD = "#c9a227";
const GREEN = "#5cc98a";
const NEGATIVE = "#e07a5c";
const RED = "#e05c5c";
const YELLOW = "#e0b23c";
const BLUE = "#5c7fc9";
const DONE = "#4a4438";

const AVATAR_COLORS = [GOLD, BLUE, GREEN, NEGATIVE];

function delta(value: number, suffix: "%" | "" = "") {
  const positive = value >= 0;
  return {
    label: `${positive ? "+" : ""}${Math.round(value)}${suffix}`,
    color: positive ? GREEN : NEGATIVE,
    bg: positive
      ? "rgba(92,201,138,0.12)"
      : "rgba(224,122,92,0.12)",
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, role, tenant_id, tenants(name, slug, stripe_charges_enabled, require_online_payment)"
    )
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) {
    redirect("/onboarding");
  }

  const tenantId = profile.tenant_id;

  const { plan, status, isPaid } = await getSubscriptionInfo(tenantId, supabase);
  const usage = await getBookingUsage(tenantId, supabase, isPaid);

  const today = format(new Date(), "yyyy-MM-dd");
  const rawDateLabel = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
  const dateLabel =
    rawDateLabel.charAt(0).toUpperCase() + rawDateLabel.slice(1);

  const statusColor: Record<string, string> = {
    done: DONE,
    now: GOLD,
    upcoming: BLUE,
  };

  const levelColor: Record<string, string> = {
    low: RED,
    mid: YELLOW,
    ok: GREEN,
  };

  let paid: {
    customerOptions: { id: string; label: string }[];
    barberOptions: { id: string; label: string }[];
    serviceOptions: { id: string; label: string; duration: number; price: number }[];
    statCards: {
      label: string;
      value: string | number;
      sub: string;
      delta: ReturnType<typeof delta>;
    }[];
    revenue: Awaited<ReturnType<typeof getRevenueLast7Days>>;
    agenda: Awaited<ReturnType<typeof getTodayAgenda>>;
    inventory: Awaited<ReturnType<typeof getInventorySummary>>;
    rentabilidadServicios: Awaited<
      ReturnType<typeof getExecutiveKpis>
    >["rentabilidadServicios"];
    barberRanking: Awaited<
      ReturnType<typeof getExecutiveKpis>
    >["rentabilidadBarberos"];
    maxBar: number;
    maxBarberRevenue: number;
  } | null = null;

  if (isPaid) {
    const [exec, revenue, agenda, inventory, formOptions] = await Promise.all([
      getExecutiveKpis(tenantId, supabase),
      getRevenueLast7Days(tenantId, supabase),
      getTodayAgenda(tenantId, supabase),
      getInventorySummary(tenantId, supabase),
      getAgendaFormOptions(tenantId, supabase),
    ]);

    const stats = await getStatCards(tenantId, supabase, {
      totalClientes: exec.totalClientes,
      clientesRecurrentesMes: exec.clientesRecurrentesMes,
    });

    const barberRanking = [...exec.rentabilidadBarberos]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    paid = {
      customerOptions: formOptions.customers.map((c) => ({
        id: c.id,
        label: c.phone ? `${c.full_name} · ${c.phone}` : c.full_name,
      })),
      barberOptions: formOptions.barbers.map((b) => ({
        id: b.id,
        label: b.full_name,
      })),
      serviceOptions: formOptions.services.map((s) => ({
        id: s.id,
        label: s.name,
        duration: s.duration_minutes,
        price: s.price,
      })),
      statCards: [
        {
          label: "Ingresos hoy",
          value: `${Math.round(stats.ingresosHoy)}€`,
          sub: `${stats.serviciosHoy} servicio${stats.serviciosHoy === 1 ? "" : "s"}`,
          delta: delta(stats.ingresosDeltaPct, "%"),
        },
        {
          label: "Citas hoy",
          value: stats.citasHoy,
          sub: `${stats.citasPendientes} pendiente${stats.citasPendientes === 1 ? "" : "s"}`,
          delta: delta(stats.citasDelta),
        },
        {
          label: "Clientes nuevos",
          value: stats.clientesNuevos,
          sub: "esta semana",
          delta: delta(stats.clientesNuevosDelta),
        },
        {
          label: "Recurrencia",
          value: `${Math.round(stats.recurrenciaPct)}%`,
          sub: "clientes que regresan",
          delta: delta(stats.recurrenciaDelta, "%"),
        },
      ],
      revenue,
      agenda,
      inventory,
      rentabilidadServicios: exec.rentabilidadServicios,
      barberRanking,
      maxBar: Math.max(...revenue.days.map((d) => d.amount), 1),
      maxBarberRevenue: Math.max(...barberRanking.map((b) => b.revenue), 1),
    };
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-9 py-8">
      <AppointmentsRealtimeRefresher tenantId={tenantId} />

      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Resumen del negocio
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {dateLabel}
          </p>
        </div>
        {paid && (
          <div className="flex items-center gap-2.5">
            <RangeSelector />
            <NewAppointmentButton
              customers={paid.customerOptions}
              barbers={paid.barberOptions}
              services={paid.serviceOptions}
              date={today}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">
            Barbería:{" "}
            <span className="font-medium text-foreground">
              {profile.tenants?.name}
            </span>
          </p>
        </div>
      </div>

      {paid ? (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paid.statCards.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{ color: s.delta.color, backgroundColor: s.delta.bg }}
                  >
                    {s.delta.label}
                  </span>
                </div>
                <p className="mt-2.5 text-[28px] font-extrabold text-foreground">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* REVENUE CHART + AGENDA */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-foreground">
                  Ingresos — últimos 7 días
                </h2>
                <p className="text-[13px] font-bold text-primary">
                  {Math.round(paid.revenue.total)}€{" "}
                  <span className="font-normal text-muted-foreground/70">
                    total semana
                  </span>
                </p>
              </div>
              <div className="flex h-[150px] items-end gap-3.5">
                {paid.revenue.days.map((d, i) => {
                  const isLast = i === paid!.revenue.days.length - 1;
                  const height = Math.max((d.amount / paid!.maxBar) * 110, 4);
                  return (
                    <div
                      key={`${d.day}-${i}`}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-[11px] text-muted-foreground">
                        {Math.round(d.amount)}€
                      </span>
                      <div
                        className="w-full max-w-[34px] rounded-t-[5px]"
                        style={{
                          height,
                          backgroundColor: isLast ? GOLD : "#3a3226",
                        }}
                      />
                      <span className="text-[11px] text-muted-foreground/70">
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-[15px] font-bold text-foreground">
                Agenda de hoy
              </h2>
              <div className="flex flex-1 flex-col gap-0.5 overflow-auto">
                {paid.agenda.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay citas hoy todavía.
                  </p>
                ) : (
                  paid.agenda.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 border-b border-[#262019] py-2.5 last:border-b-0"
                    >
                      <span className="w-11 shrink-0 text-xs text-muted-foreground">
                        {a.time}
                      </span>
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: statusColor[a.bucket] }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {a.client}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {a.service} · {a.barber}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* BARBERS + SERVICES + INVENTORY */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-[15px] font-bold text-foreground">
                Desempeño de barberos
              </h2>
              {paid.barberRanking.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay barberos configurados.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {paid.barberRanking.map((b, i) => (
                    <div key={b.name}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#141210]"
                            style={{
                              backgroundColor:
                                AVATAR_COLORS[i % AVATAR_COLORS.length],
                            }}
                          >
                            {b.name
                              .split(" ")
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </span>
                          <span className="text-[13px] font-semibold text-foreground">
                            {b.name}
                          </span>
                        </div>
                        <span className="text-[13px] font-bold text-primary">
                          {Math.round(b.revenue)}€
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#262019]">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${(b.revenue / paid!.maxBarberRevenue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-[15px] font-bold text-foreground">
                Servicios más vendidos
              </h2>
              {paid.rentabilidadServicios.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay citas completadas este mes.
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {paid.rentabilidadServicios.slice(0, 5).map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between border-b border-[#262019] py-2.5 last:border-b-0"
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.citas} servicio{s.citas === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="text-[13px] font-bold text-foreground">
                        {Math.round(s.revenue)}€
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-foreground">
                  Inventario
                </h2>
                {paid.inventory.lowStockCount > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{ color: RED, backgroundColor: "rgba(224,92,92,0.12)" }}
                  >
                    {paid.inventory.lowStockCount} bajo
                    {paid.inventory.lowStockCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              {paid.inventory.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no has añadido productos.
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {paid.inventory.items.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between border-b border-[#262019] py-2.5 last:border-b-0"
                    >
                      <span className="text-[13px] font-semibold text-foreground">
                        {i.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold"
                          style={{ color: levelColor[i.level] }}
                        >
                          {i.stock} {i.unit}
                        </span>
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: levelColor[i.level] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <Paywall
          title="Las estadísticas del negocio son de pago"
          description="Mejora a Pro o Business para ver ingresos, agenda de hoy, desempeño de barberos, servicios más vendidos e inventario."
          canUpgrade={profile.role === "owner"}
        />
      )}

      {profile.tenants?.slug && <BookingLinkCard slug={profile.tenants.slug} />}

      {profile.role === "owner" && profile.tenants && (
        <>
          <PlanCard plan={plan} status={status} />
          <StripeConnectCard
            chargesEnabled={profile.tenants.stripe_charges_enabled}
            requireOnlinePayment={profile.tenants.require_online_payment}
          />
        </>
      )}

      <BookingUsageBanner
        used={usage.used}
        limit={usage.limit}
        isPaid={usage.isPaid}
      />
    </div>
  );
}
