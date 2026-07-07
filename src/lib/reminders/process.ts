import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { sendReminderEmail } from "./email";
import { sendReminderWhatsApp } from "./whatsapp";
import { reminderSubject, reminderHtml, reminderWhatsAppText } from "./templates";

type ReminderColumn = "reminder_24h_sent_at" | "reminder_2h_sent_at";

function columnFor(hoursBefore: 24 | 2): ReminderColumn {
  return hoursBefore === 24 ? "reminder_24h_sent_at" : "reminder_2h_sent_at";
}

export type ReminderRunResult = {
  hoursBefore: 24 | 2;
  processed: number;
  emailsSent: number;
  emailsSimulated: number;
  whatsappSkipped: number;
  errors: string[];
};

export async function processReminders(
  supabase: SupabaseClient<Database>,
  hoursBefore: 24 | 2
): Promise<ReminderRunResult> {
  const column = columnFor(hoursBefore);
  const now = new Date();
  const cutoff = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, customers(full_name, email, phone), services(name), barbers(full_name), tenants(name)"
    )
    .is(column, null)
    .in("status", ["scheduled", "confirmed"])
    .gt("starts_at", now.toISOString())
    .lte("starts_at", cutoff.toISOString());

  const result: ReminderRunResult = {
    hoursBefore,
    processed: 0,
    emailsSent: 0,
    emailsSimulated: 0,
    whatsappSkipped: 0,
    errors: [],
  };

  if (error) {
    result.errors.push(error.message);
    return result;
  }

  for (const appt of appointments ?? []) {
    const customer = appt.customers;
    const ctx = {
      customerName: customer?.full_name ?? "cliente",
      tenantName: appt.tenants?.name ?? "tu barbería",
      serviceName: appt.services?.name ?? "tu servicio",
      barberName: appt.barbers?.full_name ?? "tu barbero",
      startsAt: appt.starts_at,
    };

    if (customer?.email) {
      const emailResult = await sendReminderEmail({
        to: customer.email,
        subject: reminderSubject(hoursBefore, ctx),
        html: reminderHtml(hoursBefore, ctx),
      });

      if (emailResult.status === "sent") result.emailsSent++;
      else if (emailResult.status === "simulated") result.emailsSimulated++;
      else result.errors.push(`Email cita ${appt.id}: ${emailResult.error}`);
    }

    if (customer?.phone) {
      const waResult = await sendReminderWhatsApp({
        to: customer.phone,
        message: reminderWhatsAppText(hoursBefore, ctx),
      });

      if (waResult.status === "not_configured") result.whatsappSkipped++;
      else if (waResult.status === "error")
        result.errors.push(`WhatsApp cita ${appt.id}: ${waResult.error}`);
    }

    const sentAt = new Date().toISOString();
    const update =
      column === "reminder_24h_sent_at"
        ? { reminder_24h_sent_at: sentAt }
        : { reminder_2h_sent_at: sentAt };

    await supabase.from("appointments").update(update).eq("id", appt.id);

    result.processed++;
  }

  return result;
}
