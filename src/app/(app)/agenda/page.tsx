import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { addDays, addWeeks, subDays, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayView } from "@/components/agenda/day-view";
import { WeekView } from "@/components/agenda/week-view";
import { NewAppointmentButton } from "@/components/agenda/new-appointment-button";
import { getAgendaContext, getAgendaFormOptions, getAppointmentsBetween } from "./queries";
import {
  formatDayLabel,
  parseDateKey,
  toDateKey,
  weekDays,
} from "@/lib/agenda/time";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Agenda — BarberFlow AI",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const { view: viewParam, date: dateParam } = await searchParams;
  const view = viewParam === "week" ? "week" : "day";
  const dateKey = dateParam ?? toDateKey(new Date());
  const selectedDate = parseDateKey(dateKey);

  const ctx = await getAgendaContext();
  if (!ctx) redirect("/login");
  const { supabase, tenantId } = ctx;

  const [rangeStart, rangeEnd] =
    view === "day"
      ? [selectedDate, addDays(selectedDate, 1)]
      : [weekDays(dateKey)[0], addDays(weekDays(dateKey)[6], 1)];

  const [appointments, options] = await Promise.all([
    getAppointmentsBetween(
      tenantId,
      supabase,
      rangeStart.toISOString(),
      rangeEnd.toISOString()
    ),
    getAgendaFormOptions(tenantId, supabase),
  ]);

  const customerOptions = options.customers.map((c) => ({
    id: c.id,
    label: c.phone ? `${c.full_name} · ${c.phone}` : c.full_name,
  }));
  const barberOptions = options.barbers.map((b) => ({
    id: b.id,
    label: b.full_name,
  }));
  const serviceOptions = options.services.map((s) => ({
    id: s.id,
    label: s.name,
    duration: s.duration_minutes,
    price: s.price,
  }));

  const prevDate =
    view === "day" ? subDays(selectedDate, 1) : subWeeks(selectedDate, 1);
  const nextDate =
    view === "day" ? addDays(selectedDate, 1) : addWeeks(selectedDate, 1);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Agenda
          </h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {view === "day"
              ? formatDayLabel(selectedDate)
              : `Semana del ${formatDayLabel(weekDays(dateKey)[0])}`}
          </p>
        </div>
        <NewAppointmentButton
          customers={customerOptions}
          barbers={barberOptions}
          services={serviceOptions}
          date={dateKey}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            nativeButton={false}
            render={
              <Link href={`/agenda?view=${view}&date=${toDateKey(prevDate)}`} />
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={`/agenda?view=${view}&date=${toDateKey(new Date())}`}
              />
            }
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            nativeButton={false}
            render={
              <Link href={`/agenda?view=${view}&date=${toDateKey(nextDate)}`} />
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Link
            href={`/agenda?view=day&date=${dateKey}`}
            className={cn(
              "rounded-md px-3 py-1 text-sm",
              view === "day"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Día
          </Link>
          <Link
            href={`/agenda?view=week&date=${dateKey}`}
            className={cn(
              "rounded-md px-3 py-1 text-sm",
              view === "week"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Semana
          </Link>
        </div>
      </div>

      {view === "day" ? (
        <DayView
          appointments={appointments}
          customers={customerOptions}
          barbers={barberOptions}
          services={serviceOptions}
        />
      ) : (
        <WeekView
          days={weekDays(dateKey)}
          appointments={appointments}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
