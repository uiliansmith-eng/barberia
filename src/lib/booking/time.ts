// Appointment times are stored as if the barbershop's local wall-clock time
// were UTC (see public_available_slots/public_create_booking, which both
// cast "date + time" straight to timestamptz without a timezone offset).
// Formatting the resulting ISO string with a plain `new Date(...)` would
// re-render it in the visitor's browser timezone, shifting the displayed
// hour away from what was actually booked. This turns it back into a Date
// whose local getters read the original UTC wall-clock values.
export function toWallClockDate(iso: string) {
  const d = new Date(iso);
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds()
  );
}
