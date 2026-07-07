"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Award, CalendarDays, Scissors, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookingWizard } from "@/components/booking/booking-wizard";

type Service = { id: string; name: string; duration_minutes: number; price: number };
type Barber = { id: string; full_name: string; specialty: string | null };
type Tenant = { id: string; name: string; slug: string; logo_url: string | null };

type LookupAppointment = {
  id: string;
  starts_at: string;
  status: string;
  service_name: string;
  barber_name: string;
  price: number;
};

type LookupResult =
  | { found: false }
  | {
      found: true;
      full_name: string;
      visits: number;
      appointments: LookupAppointment[];
    };

const statusLabels: Record<string, string> = {
  scheduled: "Programada",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No presentado",
};

const TABS = [
  { id: "book", label: "Reservar", icon: Scissors },
  { id: "appointments", label: "Mis citas", icon: CalendarDays },
  { id: "points", label: "Puntos", icon: Award },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function BookingPortal({
  tenant,
  services,
  barbers,
}: {
  tenant: Tenant;
  services: Service[];
  barbers: Barber[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<TabId>("book");

  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function handleLookup() {
    if (!phone.trim()) return;
    setSearching(true);
    const { data } = await supabase.rpc("public_customer_lookup", {
      p_tenant_id: tenant.id,
      p_phone: phone.trim(),
    });
    setResult(data as unknown as LookupResult);
    setSearching(false);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scissors className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold tracking-tight">{tenant.name}</p>
          <p className="text-xs text-muted-foreground">Reserva tu cita</p>
        </div>
      </div>

      <div className="glass flex w-fit gap-1 rounded-full p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted-foreground transition",
              tab === t.id && "bg-primary text-primary-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "book" && (
        <BookingWizard tenant={tenant} services={services} barbers={barbers} noHeader />
      )}

      {(tab === "appointments" || tab === "points") && (
        <div className="flex flex-col gap-4">
          <div className="glass flex items-center gap-2 rounded-2xl p-2">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="Tu número de teléfono"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button onClick={handleLookup} disabled={searching || !phone.trim()}>
              {searching ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {result && !result.found && (
            <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">
              No encontramos citas con ese teléfono en {tenant.name}.
            </p>
          )}

          {result && result.found && tab === "points" && (
            <div className="glass-strong flex flex-col items-center gap-2 rounded-3xl p-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Award className="h-6 w-6" />
              </span>
              <p className="text-sm text-muted-foreground">Hola {result.full_name}</p>
              <p className="text-3xl font-semibold">{result.visits}</p>
              <p className="text-sm text-muted-foreground">
                {result.visits === 1 ? "visita completada" : "visitas completadas"}
              </p>
            </div>
          )}

          {result && result.found && tab === "appointments" && (
            <div className="flex flex-col gap-3">
              {result.appointments.length === 0 && (
                <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">
                  Todavía no tienes citas.
                </p>
              )}
              {result.appointments.map((a) => (
                <div key={a.id} className="glass flex items-center justify-between rounded-2xl p-4">
                  <div>
                    <p className="font-medium">
                      {format(new Date(a.starts_at), "EEEE d 'de' MMMM 'a las' HH:mm", {
                        locale: es,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {a.service_name} · {a.barber_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {Number(a.price).toFixed(2)}€
                    </span>
                    <Badge variant="secondary">
                      {statusLabels[a.status] ?? a.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
