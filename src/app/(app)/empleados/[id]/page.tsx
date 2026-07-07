import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Euro, Percent } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarberRowActions } from "@/components/employees/barber-row-actions";
import { ScheduleForm } from "@/components/employees/schedule-form";

export const metadata: Metadata = {
  title: "Barbero — BarberFlow AI",
};

const statusLabels: Record<string, string> = {
  scheduled: "Programada",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No presentado",
};

export default async function BarberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!profile?.tenant_id) redirect("/onboarding");

  const { data: barber } = await supabase
    .from("barbers")
    .select("id, full_name, specialty, commission_pct, status")
    .eq("id", id)
    .eq("tenant_id", profile.tenant_id)
    .single();

  if (!barber) notFound();

  const { data: schedule } = await supabase
    .from("schedules")
    .select("weekday, start_time, end_time")
    .eq("barber_id", id);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, status, price, customers(full_name), services(name)")
    .eq("barber_id", id)
    .order("starts_at", { ascending: false });

  const now = new Date();
  const upcoming = (appointments ?? []).filter(
    (a) => new Date(a.starts_at) >= now && a.status !== "cancelled"
  );
  const completed = (appointments ?? []).filter((a) => a.status === "completed");
  const revenue = completed.reduce((sum, a) => sum + Number(a.price), 0);
  const commissionEarned = (revenue * Number(barber.commission_pct)) / 100;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <Link
        href="/empleados"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a empleados
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {barber.full_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {barber.specialty ?? "Sin especialidad"} · Comisión{" "}
            {Number(barber.commission_pct)}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={barber.status === "active" ? "secondary" : "outline"}>
            {barber.status === "active" ? "Activo" : "Inactivo"}
          </Badge>
          <BarberRowActions
            defaults={{
              id: barber.id,
              fullName: barber.full_name,
              specialty: barber.specialty ?? undefined,
              commissionPct: Number(barber.commission_pct),
              status: barber.status,
            }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">Rendimiento</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Citas completadas
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {completed.length}
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Euro className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ingresos generados
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {revenue.toFixed(2)}€
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Percent className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Comisión generada
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {commissionEarned.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">Horario</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Días y horas en los que trabaja este barbero.
        </p>
        <div className="mt-3">
          <ScheduleForm barberId={barber.id} schedule={schedule ?? []} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Agenda individual
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Próximas citas.</p>
        <div className="mt-3 flex flex-col gap-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay citas próximas para este barbero.
            </p>
          ) : (
            upcoming.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between glass rounded-xl p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {new Date(a.starts_at).toLocaleString("es-ES", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-muted-foreground">
                    {a.customers?.full_name} · {a.services?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{a.price}€</span>
                  <Badge variant="secondary">
                    {statusLabels[a.status] ?? a.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/empleados" />}
      >
        Volver a empleados
      </Button>
    </div>
  );
}
