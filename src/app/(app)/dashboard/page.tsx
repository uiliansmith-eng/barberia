import { redirect } from "next/navigation";
import {
  CalendarCheck,
  Euro,
  UserPlus,
  Repeat,
  Scissors,
  Store,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardKpis } from "./queries";
import { BookingLinkCard } from "@/components/dashboard/booking-link-card";

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
    .select("full_name, role, tenant_id, tenants(name, slug)")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) {
    redirect("/onboarding");
  }

  const kpis = await getDashboardKpis(profile.tenant_id, supabase);

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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
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
    </div>
  );
}
