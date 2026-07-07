"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import {
  AppointmentSheet,
  type AppointmentFormDefaults,
} from "@/components/agenda/appointment-sheet";
import { cancelAppointment } from "@/app/(app)/agenda/actions";
import { toDateKey } from "@/lib/agenda/time";

export type AgendaAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  barber_id: string;
  customer_id: string;
  service_id: string;
  customers: { full_name: string; phone: string | null } | null;
  barbers: { full_name: string } | null;
  services: { name: string } | null;
};

type Option = { id: string; label: string };

export function AppointmentCard({
  appointment,
  customers,
  barbers,
  services,
}: {
  appointment: AgendaAppointment;
  customers: Option[];
  barbers: Option[];
  services: { id: string; label: string; duration: number; price: number }[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const starts = new Date(appointment.starts_at);

  const defaults: AppointmentFormDefaults = {
    id: appointment.id,
    customerId: appointment.customer_id,
    barberId: appointment.barber_id,
    serviceId: appointment.service_id,
    date: toDateKey(starts),
    time: format(starts, "HH:mm"),
    notes: appointment.notes ?? undefined,
  };

  return (
    <div className="rounded-xl border border-l-4 border-border border-l-primary bg-card p-3 text-sm shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-foreground">
          <span className="text-primary">{format(starts, "HH:mm", { locale: es })}</span>
          {" · "}
          {appointment.customers?.full_name ?? "Cliente"}
        </p>
        <form action={cancelAppointment.bind(null, appointment.id)}>
          <Button
            type="submit"
            variant="ghost"
            size="icon-xs"
            aria-label="Cancelar cita"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
      <p className="mt-1 text-muted-foreground">
        {appointment.services?.name} · {appointment.barbers?.full_name}
      </p>
      {appointment.notes && (
        <p className="mt-1 text-xs text-muted-foreground">{appointment.notes}</p>
      )}

      <AppointmentSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        customers={customers}
        barbers={barbers}
        services={services}
        defaults={defaults}
        trigger={
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
              />
            }
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Editar / Reagendar
          </SheetTrigger>
        }
      />
    </div>
  );
}
