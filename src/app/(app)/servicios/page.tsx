import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Scissors } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { NewServiceButton } from "@/components/services/new-service-button";
import { ServiceRowActions } from "@/components/services/service-row-actions";

export const metadata: Metadata = {
  title: "Servicios — BarberOS",
};

export default async function ServicesPage() {
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

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price, status")
    .eq("tenant_id", profile.tenant_id)
    .order("name");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Servicios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services?.length ?? 0} servicios
          </p>
        </div>
        <NewServiceButton />
      </div>

      {!services || services.length === 0 ? (
        <div className="glass rounded-2xl py-12 text-center text-muted-foreground">
          No hay servicios todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.id}
              className="glass flex items-center gap-4 rounded-2xl p-4"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/20">
                <Scissors className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {s.name}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {s.duration_minutes} min · {Number(s.price).toFixed(2)}€
                </p>
                <Badge
                  variant={s.status === "active" ? "secondary" : "outline"}
                  className="mt-2"
                >
                  {s.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <ServiceRowActions
                defaults={{
                  id: s.id,
                  name: s.name,
                  durationMinutes: s.duration_minutes,
                  price: Number(s.price),
                  status: s.status,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
