import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export const SLOT_START_HOUR = 9;
export const SLOT_END_HOUR = 21;
export const SLOT_MINUTES = 30;

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(dateKey: string) {
  return parseISO(dateKey);
}

export function weekDays(dateKey: string) {
  const start = startOfWeek(parseDateKey(dateKey), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDayLabel(date: Date) {
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export function formatShortDay(date: Date) {
  return format(date, "EEE d", { locale: es });
}

export function timeSlots() {
  const slots: string[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function combineDateAndTime(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00`);
}

export function minutesFromSlotStart(date: Date) {
  return (date.getHours() - SLOT_START_HOUR) * 60 + date.getMinutes();
}
