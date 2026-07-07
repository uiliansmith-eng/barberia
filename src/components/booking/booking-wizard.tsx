"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Scissors,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Service = { id: string; name: string; duration_minutes: number; price: number };
type Barber = { id: string; full_name: string; specialty: string | null };
type Tenant = { id: string; name: string; slug: string; logo_url: string | null };

const NEXT_DAYS = 14;

function nextDays() {
  const today = new Date();
  return Array.from({ length: NEXT_DAYS }, (_, i) => addDays(today, i));
}

export function BookingWizard({
  tenant,
  services,
  barbers,
}: {
  tenant: Tenant;
  services: Service[];
  barbers: Barber[];
}) {
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [service, setService] = useState<Service | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [date, setDate] = useState(nextDays()[0]);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsKey, setSlotsKey] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    startsAt: string;
    serviceName: string;
  } | null>(null);

  const dateKey = format(date, "yyyy-MM-dd");
  const currentSlotsKey = barber && service ? `${barber.id}|${dateKey}|${service.id}` : null;
  const loadingSlots = currentSlotsKey !== null && slotsKey !== currentSlotsKey;

  useEffect(() => {
    if (!barber || !service) return;
    const key = `${barber.id}|${dateKey}|${service.id}`;
    supabase
      .rpc("public_available_slots", {
        p_tenant_id: tenant.id,
        p_barber_id: barber.id,
        p_date: dateKey,
        p_duration_minutes: service.duration_minutes,
      })
      .then(({ data }) => {
        setSlots((data as string[] | null) ?? []);
        setSlotsKey(key);
      });
  }, [barber, dateKey, service, supabase, tenant.id]);

  async function handleConfirm() {
    if (!service || !barber || !time) return;
    setSubmitting(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("public_create_booking", {
      p_tenant_id: tenant.id,
      p_barber_id: barber.id,
      p_service_id: service.id,
      p_date: format(date, "yyyy-MM-dd"),
      p_time: time,
      p_customer_name: name,
      p_customer_phone: phone,
      p_customer_email: email,
      p_notes: notes,
    });

    setSubmitting(false);

    if (rpcError) {
      setError(
        rpcError.message.includes("slot_unavailable")
          ? "Ese horario ya no está disponible. Elige otro."
          : "No se pudo confirmar la reserva. Inténtalo de nuevo."
      );
      return;
    }

    const result = data as { starts_at: string; service_name: string };
    setConfirmation({ startsAt: result.starts_at, serviceName: result.service_name });
    setStep(3);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-10">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scissors className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold tracking-tight">{tenant.name}</p>
          <p className="text-xs text-muted-foreground">Reserva tu cita</p>
        </div>
      </div>

      {step > 0 && step < 3 && (
        <button
          onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2)}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </button>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-3">
          <h1 className="text-lg font-semibold">Elige un servicio</h1>
          {services.length === 0 && (
            <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">
              Esta barbería todavía no tiene servicios publicados.
            </p>
          )}
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setService(s);
                setStep(1);
              }}
              className="glass flex items-center justify-between rounded-2xl p-4 text-left transition hover:border-primary/40"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.duration_minutes} min
                </p>
              </div>
              <span className="font-semibold text-primary">
                {Number(s.price).toFixed(2)}€
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && service && (
        <div className="flex flex-col gap-5">
          <h1 className="text-lg font-semibold">Elige barbero, fecha y hora</h1>

          <div className="flex flex-wrap gap-2">
            {barbers.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBarber(b);
                  setTime(null);
                }}
                className={cn(
                  "glass flex items-center gap-2 rounded-full px-4 py-2 text-sm",
                  barber?.id === b.id && "border-primary text-primary"
                )}
              >
                <User className="h-3.5 w-3.5" />
                {b.full_name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {nextDays().map((d) => {
              const active = format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    setDate(d);
                    setTime(null);
                  }}
                  className={cn(
                    "glass flex shrink-0 flex-col items-center rounded-xl px-3 py-2 text-xs",
                    active && "border-primary text-primary"
                  )}
                >
                  <span className="capitalize">{format(d, "EEE", { locale: es })}</span>
                  <span className="text-sm font-semibold">{format(d, "d")}</span>
                </button>
              );
            })}
          </div>

          {barber ? (
            <div className="grid grid-cols-3 gap-2">
              {loadingSlots ? (
                <p className="col-span-3 text-sm text-muted-foreground">
                  Cargando horarios...
                </p>
              ) : slots.length === 0 ? (
                <p className="col-span-3 text-sm text-muted-foreground">
                  Sin horarios disponibles ese día.
                </p>
              ) : (
                slots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={cn(
                      "glass rounded-lg py-2 text-sm",
                      time === t && "border-primary text-primary"
                    )}
                  >
                    {t}
                  </button>
                ))
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Elige un barbero para ver los horarios.
            </p>
          )}

          <Button disabled={!barber || !time} onClick={() => setStep(2)}>
            Continuar
          </Button>
        </div>
      )}

      {step === 2 && service && barber && time && (
        <div className="flex flex-col gap-5">
          <h1 className="text-lg font-semibold">Tus datos</h1>

          <div className="glass flex items-center justify-between rounded-2xl p-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck className="h-4 w-4" />
              {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" />
              {time}
            </div>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email (opcional)</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Alguna nota para tu barbero</FieldLabel>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Me gusta el degradado bajo"
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Button
              disabled={submitting || !name.trim() || !phone.trim()}
              onClick={handleConfirm}
            >
              {submitting ? "Confirmando..." : "Confirmar reserva"}
            </Button>
          </FieldGroup>
        </div>
      )}

      {step === 3 && confirmation && (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-semibold">¡Cita reservada!</h1>
          <p className="text-sm text-muted-foreground">
            {confirmation.serviceName} · {tenant.name}
          </p>
          <p className="text-sm font-medium">
            {format(new Date(confirmation.startsAt), "EEEE d 'de' MMMM 'a las' HH:mm", {
              locale: es,
            })}
          </p>
        </div>
      )}
    </div>
  );
}
