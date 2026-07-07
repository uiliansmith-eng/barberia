import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { NewBarberButton } from "@/components/employees/new-barber-button";
import { BarberRowActions } from "@/components/employees/barber-row-actions";

export const metadata: Metadata = {
  title: "Empleados — BarberFlow AI",
};

export default async function EmployeesPage() {
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

  const { data: barbers } = await supabase
    .from("barbers")
    .select("id, full_name, specialty, commission_pct, status")
    .eq("tenant_id", profile.tenant_id)
    .order("full_name");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Empleados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {barbers?.length ?? 0} barberos
          </p>
        </div>
        <NewBarberButton />
      </div>

      {!barbers || barbers.length === 0 ? (
        <div className="glass rounded-2xl py-12 text-center text-muted-foreground">
          No hay barberos todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="glass flex items-center gap-4 rounded-2xl p-4"
            >
              <Link
                href={`/empleados/${b.id}`}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20"
              >
                {b.full_name.charAt(0).toUpperCase()}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/empleados/${b.id}`}
                  className="truncate font-semibold text-foreground hover:text-primary"
                >
                  {b.full_name}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {b.specialty ?? "Sin especialidad"} · {Number(b.commission_pct)}%
                </p>
                <Badge
                  variant={b.status === "active" ? "secondary" : "outline"}
                  className="mt-2"
                >
                  {b.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <BarberRowActions
                defaults={{
                  id: b.id,
                  fullName: b.full_name,
                  specialty: b.specialty ?? undefined,
                  commissionPct: Number(b.commission_pct),
                  status: b.status,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
