import "server-only";
import { Resend } from "resend";

export type SendEmailResult =
  | { status: "sent" }
  | { status: "simulated" }
  | { status: "error"; error: string };

/**
 * Sends a reminder email via Resend. If RESEND_API_KEY isn't configured yet
 * (e.g. local dev before the user has an account), it logs the email instead
 * of failing, so the rest of the pipeline (finding due appointments, marking
 * them as reminded) can still be exercised end to end.
 */
export async function sendReminderEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "BarberFlow AI <recordatorios@barberflow.ai>";

  if (!apiKey) {
    console.log(
      `[reminders] RESEND_API_KEY no configurada — simulando email a ${params.to}: "${params.subject}"`
    );
    return { status: "simulated" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      return { status: "error", error: error.message };
    }

    return { status: "sent" };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
