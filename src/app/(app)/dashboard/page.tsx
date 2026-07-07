import { redirect } from "next/navigation";
import {
  CalendarCheck,
  Euro,
  UserPlus,
  Repeat,
  Scissors,
  Store,
  Receipt,
  Users,
  Clock,
  UserSquare2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardKpis, getExecutiveKpis, getBookingUsage } from "./queries";
import { BookingLinkCard } from "@/components/dashboard/booking-link-card";
import { AppointmentsRealtimeRefresher } from "@/components/agenda/realtime-refresher";
import { BookingUsageBanner } from "@/components/dashboard/booking-usage-banner";
import { StripeConnectCard } from "@/components/dashboard/stripe-connect-card";

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

  const [kpis, exec, usage] = await Promise.all([
    getDashboardKpis(profile.tenant_id, supabase),
    getExecutiveKpis(profile.tenant_id, supabase),
    getBookingUsage(profile.tenant_id, supabase),
  ]);

  const cards = [
    {
      label: "Citas hoy",
      value: kpis.citasHoy,
      icon: CalendarCheck,
    },
    {
      label: "Ingresos hoy",
      value: `${kpis.ingresosHoy.toFixed(2)}€`,
      icon: Euro,
    },
    {
      label: "Clientes nuevos",
      value: kpis.clientesNuevos,
      icon: UserPlus,
    },
    {
      label: "Clientes recurrentes",
      value: kpis.clientesRecurrentes,
      icon: Repeat,
    },
  ];

  const topCount = kpis.serviciosMasVendidos[0]?.count ?? 0;

  const topBarberProfit = exec.rentabilidadBarberos[0]?.beneficio ?? 0;
  const topServiceRevenue = exec.rentabilidadServicios[0]?.revenue ?? 0;
  const topHourCount = exec.horasPico[0]?.count ?? 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
      <AppointmentsRealtimeRefresher tenantId={profile.tenant_id} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hola{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="flex items-center gap-4 glass rounded-2xl p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">
            Barbería:{" "}
            <span className="font-medium text-foreground">
              {profile?.tenants?.name}
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rol: <span className="font-medium text-foreground">{profile?.role}</span>
          </p>
        </div>
      </div>

      {profile?.tenants?.slug && <BookingLinkCard slug={profile.tenants.slug} />}

      {profile?.role === "owner" && profile.tenants && (
        <StripeConnectCard
          chargesEnabled={profile.tenants.stripe_charges_enabled}
          requireOnlinePayment={profile.tenants.require_online_payment}
        />
      )}

      <BookingUsageBanner
        used={usage.used}
        limit={usage.limit}
        isPaid={usage.isPaid}
      />

      <div>
        <h2 className="text-lg font-semibold text-foreground">Hoy</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="glass rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <card.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Scissors className="h-3.5 w-3.5" />
          </span>
          Servicios más vendidos hoy
        </h2>
        <div className="mt-3 glass rounded-2xl p-4">
          {kpis.serviciosMasVendidos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay citas registradas hoy.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {kpis.serviciosMasVendidos.map((s, i) => (
                <li key={s.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground/85">
                      <span className="mr-2 text-muted-foreground/70">#{i + 1}</span>
                      {s.name}
                    </span>
                    <span className="font-medium text-foreground">
                      {s.count} {s.count === 1 ? "cita" : "citas"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${topCount ? (s.count / topCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Dashboard ejecutivo{" "}
          <span className="text-sm font-normal text-muted-foreground">
            · este mes
          </span>
        </h2>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ticket medio
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {exec.ticketMedio.toFixed(2)}€
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Clientes recurrentes
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {exec.clientesRecurrentesMes}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {exec.totalClientes}
              </span>
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hora pico
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {exec.horasPico[0]
                ? `${String(exec.horasPico[0].hour).padStart(2, "0")}:00`
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 glass rounded-2xl p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-3.5 w-3.5" />
            </span>
            Horas pico
          </h3>
          {exec.horasPico.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Todavía no hay citas este mes.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {exec.horasPico.map((h) => (
                <li key={h.hour} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground/85">
                      {String(h.hour).padStart(2, "0")}:00 –{" "}
                      {String(h.hour + 1).padStart(2, "0")}:00
                    </span>
                    <span className="font-medium text-foreground">
                      {h.count} {h.count === 1 ? "cita" : "citas"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${topHourCount ? (h.count / topHourCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserSquare2 className="h-3.5 w-3.5" />
              </span>
              Rentabilidad por barbero
            </h3>
            {exec.rentabilidadBarberos.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Todavía no hay barberos configurados.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-4">
                {exec.rentabilidadBarberos.map((b) => (
                  <li key={b.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/85">{b.name}</span>
                      <span className="font-medium text-foreground">
                        {b.beneficio.toFixed(2)}€
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {b.citas} {b.citas === 1 ? "cita" : "citas"} ·{" "}
                      {b.revenue.toFixed(2)}€ ingresos · {b.commissionPct}% comisión (
                      {b.comision.toFixed(2)}€)
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${topBarberProfit ? (b.beneficio / topBarberProfit) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Scissors className="h-3.5 w-3.5" />
              </span>
              Rentabilidad por servicio
            </h3>
            {exec.rentabilidadServicios.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Todavía no hay citas completadas este mes.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-4">
                {exec.rentabilidadServicios.map((s) => (
                  <li key={s.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/85">{s.name}</span>
                      <span className="font-medium text-foreground">
                        {s.revenue.toFixed(2)}€
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.citas} {s.citas === 1 ? "cita" : "citas"}
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${topServiceRevenue ? (s.revenue / topServiceRevenue) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
