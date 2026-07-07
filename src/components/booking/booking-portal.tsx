"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Award,
  CalendarDays,
  Check,
  Clock3,
  Crown,
  MessageCircleQuestion,
  Medal,
  Scissors,
  Search,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { toWallClockDate } from "@/lib/booking/time";

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

const TIERS = [
  { name: "Silver", min: 0, icon: Medal, color: "oklch(0.75 0.01 250)" },
  { name: "Gold", min: 5, icon: Trophy, color: "oklch(0.8 0.16 78)" },
  { name: "Platinum", min: 15, icon: Crown, color: "oklch(0.78 0.03 260)" },
] as const;

function currentTier(visits: number) {
  return [...TIERS].reverse().find((t) => visits >= t.min) ?? TIERS[0];
}

function nextTier(visits: number) {
  return TIERS.find((t) => t.min > visits) ?? null;
}

const TABS = [
  { id: "book", label: "Reservar", icon: Scissors },
  { id: "appointments", label: "Mis citas", icon: CalendarDays },
  { id: "points", label: "Puntos", icon: Award },
] as const;

type TabId = (typeof TABS)[number]["id"];

const QUICK_MESSAGES = [
  { id: "late", label: "Llegaré 10 min tarde", icon: Clock3, message: "Llegaré 10 minutos tarde a mi cita." },
  { id: "reschedule", label: "Necesito cambiar cita", icon: CalendarDays, message: "Necesito cambiar mi cita, por favor contáctame." },
] as const;

function AppointmentActions({
  appointmentId,
  tenantId,
  phone,
}: {
  appointmentId: string;
  tenantId: string;
  phone: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [question, setQuestion] = useState("");

  async function sendMessage(id: string, message: string) {
    setSending(id);
    const { error } = await supabase.rpc("public_add_appointment_note", {
      p_appointment_id: appointmentId,
      p_tenant_id: tenantId,
      p_phone: phone,
      p_message: message,
    });
    setSending(null);
    if (!error) {
      setSent((prev) => new Set(prev).add(id));
      if (id === "question") {
        setAskingQuestion(false);
        setQuestion("");
      }
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
      {QUICK_MESSAGES.map((q) => (
        <Button
          key={q.id}
          size="sm"
          variant="outline"
          disabled={sending === q.id || sent.has(q.id)}
          onClick={() => sendMessage(q.id, q.message)}
        >
          {sent.has(q.id) ? <Check className="h-3.5 w-3.5" /> : <q.icon className="h-3.5 w-3.5" />}
          {sent.has(q.id) ? "Enviado" : q.label}
        </Button>
      ))}

      {!askingQuestion && !sent.has("question") && (
        <Button size="sm" variant="outline" onClick={() => setAskingQuestion(true)}>
          <MessageCircleQuestion className="h-3.5 w-3.5" />
          Tengo una pregunta
        </Button>
      )}
      {sent.has("question") && (
        <Button size="sm" variant="outline" disabled>
          <Check className="h-3.5 w-3.5" />
          Pregunta enviada
        </Button>
      )}

      {askingQuestion && (
        <div className="flex w-full gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1"
          />
          <Button
            size="sm"
            disabled={sending === "question" || !question.trim()}
            onClick={() => sendMessage("question", question.trim())}
          >
            Enviar
          </Button>
        </div>
      )}
    </div>
  );
}

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
          {tab === "points" && (
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold">Programa VIP</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Suma 1 punto por cada corte completado y sube de nivel.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {TIERS.map((t) => (
                  <div key={t.name} className="flex flex-col items-center gap-1.5 text-center">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: `color-mix(in oklch, ${t.color} 20%, transparent)`, color: t.color }}
                    >
                      <t.icon className="h-5 w-5" />
                    </span>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.min === 0 ? "Desde el inicio" : `${t.min}+ visitas`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {result && result.found && tab === "points" && (() => {
            const tier = currentTier(result.visits);
            const next = nextTier(result.visits);
            const progress = next
              ? Math.min(100, (result.visits / next.min) * 100)
              : 100;
            return (
              <div className="glass-strong flex flex-col items-center gap-2 rounded-3xl p-8 text-center">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${tier.color} 20%, transparent)`,
                    color: tier.color,
                  }}
                >
                  <tier.icon className="h-6 w-6" />
                </span>
                <p className="text-sm text-muted-foreground">Hola {result.full_name}</p>
                <Badge style={{ backgroundColor: tier.color, color: "black" }}>
                  Nivel {tier.name}
                </Badge>
                <p className="mt-2 text-3xl font-semibold">{result.visits}</p>
                <p className="text-sm text-muted-foreground">
                  {result.visits === 1 ? "visita completada" : "visitas completadas"}
                </p>
                {next && (
                  <div className="mt-4 w-full max-w-xs">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {next.min - result.visits} visitas más para nivel {next.name}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {result && result.found && tab === "appointments" && (
            <div className="flex flex-col gap-3">
              {result.appointments.length === 0 && (
                <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">
                  Todavía no tienes citas.
                </p>
              )}
              {result.appointments.map((a) => {
                const isUpcoming =
                  (a.status === "scheduled" || a.status === "confirmed") &&
                  new Date(a.starts_at) > new Date();
                return (
                  <div key={a.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {format(toWallClockDate(a.starts_at), "EEEE d 'de' MMMM 'a las' HH:mm", {
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
                    {isUpcoming && (
                      <AppointmentActions
                        appointmentId={a.id}
                        tenantId={tenant.id}
                        phone={phone.trim()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
