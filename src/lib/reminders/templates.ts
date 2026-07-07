import { format } from "date-fns";
import { es } from "date-fns/locale";

export type ReminderContext = {
  customerName: string;
  tenantName: string;
  serviceName: string;
  barberName: string;
  startsAt: string;
};

export function reminderSubject(hoursBefore: 24 | 2, ctx: ReminderContext) {
  const when = hoursBefore === 24 ? "mañana" : "en 2 horas";
  return `Recordatorio: tu cita en ${ctx.tenantName} es ${when}`;
}

export function reminderHtml(hoursBefore: 24 | 2, ctx: ReminderContext) {
  const dateLabel = format(new Date(ctx.startsAt), "EEEE d 'de' MMMM 'a las' HH:mm", {
    locale: es,
  });
  const when = hoursBefore === 24 ? "mañana" : "en aproximadamente 2 horas";

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#171717;">Hola ${ctx.customerName},</h2>
      <p style="color:#404040;">
        Te recordamos que tienes una cita ${when} en <strong>${ctx.tenantName}</strong>.
      </p>
      <div style="background:#f5f5f5; border-radius:12px; padding:16px; margin:16px 0;">
        <p style="margin:0; color:#171717;"><strong>Servicio:</strong> ${ctx.serviceName}</p>
        <p style="margin:4px 0 0; color:#171717;"><strong>Barbero:</strong> ${ctx.barberName}</p>
        <p style="margin:4px 0 0; color:#171717;"><strong>Fecha:</strong> ${dateLabel}</p>
      </div>
      <p style="color:#737373; font-size:13px;">
        Si necesitas cancelar o reagendar, contacta directamente con ${ctx.tenantName}.
      </p>
    </div>
  `;
}

export function reminderWhatsAppText(hoursBefore: 24 | 2, ctx: ReminderContext) {
  const dateLabel = format(new Date(ctx.startsAt), "EEEE d 'de' MMMM 'a las' HH:mm", {
    locale: es,
  });
  const when = hoursBefore === 24 ? "mañana" : "en 2 horas";
  return `Hola ${ctx.customerName}, te recordamos tu cita ${when} en ${ctx.tenantName}: ${ctx.serviceName} con ${ctx.barberName} el ${dateLabel}.`;
}
