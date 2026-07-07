import Link from "next/link";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { formatShortDay, toDateKey } from "@/lib/agenda/time";
import { toWallClockDate } from "@/lib/time";
import type { AgendaAppointment } from "@/components/agenda/appointment-card";

export function WeekView({
  days,
  appointments,
  selectedDate,
}: {
  days: Date[];
  appointments: AgendaAppointment[];
  selectedDate: Date;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const dayAppointments = appointments.filter((a) =>
          isSameDay(toWallClockDate(a.starts_at), day)
        );
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);

        return (
          <Link
            key={day.toISOString()}
            href={`/agenda?view=day&date=${toDateKey(day)}`}
            className={cn(
              "flex flex-col gap-2 glass rounded-xl p-3 transition hover:border-primary/30",
              isSelected && "ring-2 ring-primary"
            )}
          >
            <p
              className={cn(
                "text-xs font-medium capitalize text-muted-foreground",
                isToday && "text-primary"
              )}
            >
              {formatShortDay(day)}
            </p>
            {dayAppointments.length === 0 ? (
              <p className="text-xs text-muted-foreground/70">Sin citas</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {dayAppointments.map((a) => (
                  <li
                    key={a.id}
                    className="truncate rounded-md bg-primary/10 px-2 py-1 text-xs text-foreground/85"
                  >
                    {toWallClockDate(a.starts_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {a.customers?.full_name}
                  </li>
                ))}
              </ul>
            )}
          </Link>
        );
      })}
    </div>
  );
}
