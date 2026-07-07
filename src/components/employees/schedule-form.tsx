"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FieldError } from "@/components/ui/field";
import { saveSchedule, type ScheduleActionState } from "@/app/(app)/empleados/actions";

const DAYS = [
  { weekday: 1, label: "Lunes" },
  { weekday: 2, label: "Martes" },
  { weekday: 3, label: "Miércoles" },
  { weekday: 4, label: "Jueves" },
  { weekday: 5, label: "Viernes" },
  { weekday: 6, label: "Sábado" },
  { weekday: 0, label: "Domingo" },
];

export type ScheduleEntry = {
  weekday: number;
  start_time: string;
  end_time: string;
};

export function ScheduleForm({
  barberId,
  schedule,
}: {
  barberId: string;
  schedule: ScheduleEntry[];
}) {
  const scheduleByDay = new Map(schedule.map((s) => [s.weekday, s]));

  const [enabledDays, setEnabledDays] = useState<Record<number, boolean>>(
    Object.fromEntries(DAYS.map((d) => [d.weekday, scheduleByDay.has(d.weekday)]))
  );

  const [state, formAction, pending] = useActionState<
    ScheduleActionState,
    FormData
  >(saveSchedule.bind(null, barberId), null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {DAYS.map((day) => {
        const existing = scheduleByDay.get(day.weekday);
        const enabled = enabledDays[day.weekday];

        return (
          <div
            key={day.weekday}
            className="flex flex-wrap items-center gap-3 glass rounded-xl p-3"
          >
            <div className="flex w-32 items-center gap-2">
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setEnabledDays((prev) => ({ ...prev, [day.weekday]: checked }))
                }
              />
              <input
                type="hidden"
                name={`day_${day.weekday}_enabled`}
                value={enabled ? "on" : ""}
              />
              <span className="text-sm font-medium text-foreground">
                {day.label}
              </span>
            </div>

            <Input
              type="time"
              name={`day_${day.weekday}_start`}
              defaultValue={existing?.start_time?.slice(0, 5) ?? "09:00"}
              disabled={!enabled}
              className="w-32"
            />
            <span className="text-muted-foreground/70">—</span>
            <Input
              type="time"
              name={`day_${day.weekday}_end`}
              defaultValue={existing?.end_time?.slice(0, 5) ?? "20:00"}
              disabled={!enabled}
              className="w-32"
            />
          </div>
        );
      })}

      {state?.error && <FieldError>{state.error}</FieldError>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar horario"}
      </Button>
    </form>
  );
}
