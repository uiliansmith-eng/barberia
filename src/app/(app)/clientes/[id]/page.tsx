import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarClock, Euro, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerRowActions } from "@/components/customers/customer-row-actions";

export const metadata: Metadata = {
  title: "Cliente — BarberFlow AI",
};

const statusLabels: Record<string, string> = {
  scheduled: "Programada",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No presentado",
};

export default async function CustomerDetailPage({
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

  const { data: customer } = await supabase
    .from("customers")
    .select("id, full_name, phone, email, birth_date, notes, total_spent, last_visit_at")
    .eq("id", id)
    .eq("tenant_id", profile.tenant_id)
    .single();

  if (!customer) notFound();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, status, price, barbers(full_name), services(name)")
    .eq("customer_id", id)
    .order("starts_at", { ascending: false });

  const purchases = (appointments ?? []).filter(
    (a) => a.status === "completed"
  );
  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <Link
        href="/clientes"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {customer.full_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer.phone ?? "Sin teléfono"} ·{" "}
            {customer.email ?? "Sin email"}
          </p>
        </div>
        <CustomerRowActions
          defaults={{
            id: customer.id,
            fullName: customer.full_name,
            phone: customer.phone ?? undefined,
            email: customer.email ?? undefined,
            birthDate: customer.birth_date ?? undefined,
            notes: customer.notes ?? undefined,
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarClock className="h-4 w-4" />
          </span>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Última visita
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {customer.last_visit_at
              ? new Date(customer.last_visit_at).toLocaleDateString("es-ES")
              : "—"}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Euro className="h-4 w-4" />
          </span>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total gastado
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {totalSpent.toFixed(2)}€
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Citas completadas
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {purchases.length}
          </p>
        </div>
      </div>

      {customer.notes && (
        <div className="glass rounded-2xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Notas
          </p>
          <p className="mt-1 text-sm text-foreground/85">{customer.notes}</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Historial de citas
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {!appointments || appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este cliente todavía no tiene citas.
            </p>
          ) : (
            appointments.map((a) => (
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
                    {a.services?.name} · {a.barbers?.full_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{a.price}€</span>
                  <Badge variant={a.status === "cancelled" ? "destructive" : "secondary"}>
                    {statusLabels[a.status] ?? a.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Historial de compras
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Servicios pagados (citas completadas).
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay compras registradas.
            </p>
          ) : (
            purchases.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between glass rounded-xl p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {p.services?.name}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(p.starts_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span className="font-medium text-foreground">{p.price}€</span>
              </div>
            ))
          )}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/clientes" />}
      >
        Volver a clientes
      </Button>
    </div>
  );
}
