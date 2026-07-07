import { CalendarX2 } from "lucide-react";
import {
  AppointmentCard,
  type AgendaAppointment,
} from "@/components/agenda/appointment-card";

type Option = { id: string; label: string };

export function DayView({
  appointments,
  customers,
  barbers,
  services,
}: {
  appointments: AgendaAppointment[];
  customers: Option[];
  barbers: Option[];
  services: { id: string; label: string; duration: number; price: number }[];
}) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
        <CalendarX2 className="h-6 w-6" />
        <p className="text-sm">No hay citas este día.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          customers={customers}
          barbers={barbers}
          services={services}
        />
      ))}
    </div>
  );
}
