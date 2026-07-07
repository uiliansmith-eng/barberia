"use server";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReminderEmail } from "@/lib/reminders/email";
import { toWallClockDate } from "@/lib/time";
import { escapeHtml } from "@/lib/escape-html";

type CreateBookingInput = {
  tenantId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
};

type BookingResult = {
  appointment_id: string;
  starts_at: string;
  ends_at: string;
  service_name: string;
  price: number;
};

export type CreateBookingActionResult =
  | { error: string }
  | { data: BookingResult };

export async function createPublicBooking(
  input: CreateBookingInput
): Promise<CreateBookingActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_create_booking", {
    p_tenant_id: input.tenantId,
    p_barber_id: input.barberId,
    p_service_id: input.serviceId,
    p_date: input.date,
    p_time: input.time,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_customer_email: input.customerEmail,
    p_notes: input.notes,
  });

  if (error) {
    return { error: error.message };
  }

  const result = data as unknown as BookingResult;

  try {
    await notifyOwnerOfNewBooking(input.tenantId, input, result);
  } catch {
    // The booking already succeeded — a failed notification shouldn't fail it.
  }

  return { data: result };
}

async function notifyOwnerOfNewBooking(
  tenantId: string,
  input: CreateBookingInput,
  booking: BookingResult
) {
  const admin = createAdminClient();

  const { data: owner } = await admin
    .from("profiles")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (!owner) return;

  const { data: userData } = await admin.auth.admin.getUserById(owner.id);
  const email = userData?.user?.email;
  if (!email) return;

  const when = format(
    toWallClockDate(booking.starts_at),
    "EEEE d 'de' MMMM 'a las' HH:mm",
    { locale: es }
  );

  await sendReminderEmail({
    to: email,
    subject: `Nueva reserva: ${input.customerName} — ${booking.service_name}`,
    html: `
      <p>Tienes una nueva reserva a través de tu link de BarberOS.</p>
      <ul>
        <li><strong>Cliente:</strong> ${escapeHtml(input.customerName)}</li>
        <li><strong>Teléfono:</strong> ${input.customerPhone ? escapeHtml(input.customerPhone) : "—"}</li>
        <li><strong>Servicio:</strong> ${escapeHtml(booking.service_name)}</li>
        <li><strong>Fecha:</strong> ${when}</li>
        <li><strong>Precio:</strong> ${booking.price}€</li>
      </ul>
    `,
  });
}
