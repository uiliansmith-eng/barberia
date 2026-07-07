"use server";

import { createClient } from "@/lib/supabase/server";
import { directoryLeadSchema } from "@/lib/validations/directory-lead";
import { sendReminderEmail } from "@/lib/reminders/email";

export type DirectoryLeadActionState = {
  error?: string;
  success?: boolean;
} | null;

const NOTIFY_EMAIL = "info@appstles.com";

export async function submitDirectoryLead(
  _prevState: DirectoryLeadActionState,
  formData: FormData
): Promise<DirectoryLeadActionState> {
  const parsed = directoryLeadSchema.safeParse({
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    city: formData.get("city"),
    source: formData.get("source"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("directory_leads").insert({
    business_name: parsed.data.businessName,
    contact_name: parsed.data.contactName,
    phone: parsed.data.phone,
    email: parsed.data.email,
    city: parsed.data.city || null,
    source: parsed.data.source,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: "No se pudo enviar la solicitud. Inténtalo de nuevo." };
  }

  await sendReminderEmail({
    to: NOTIFY_EMAIL,
    subject: `Nueva solicitud de barbería: ${parsed.data.businessName}`,
    html: `
      <p>Nueva solicitud para el directorio de BarberOS.</p>
      <ul>
        <li><strong>Barbería:</strong> ${parsed.data.businessName}</li>
        <li><strong>Contacto:</strong> ${parsed.data.contactName}</li>
        <li><strong>Teléfono:</strong> ${parsed.data.phone}</li>
        <li><strong>Email:</strong> ${parsed.data.email}</li>
        <li><strong>Ciudad:</strong> ${parsed.data.city || "—"}</li>
        <li><strong>Quién envía:</strong> ${parsed.data.source === "owner" ? "Dueño de la barbería" : "Equipo BarberOS"}</li>
        <li><strong>Notas:</strong> ${parsed.data.notes || "—"}</li>
      </ul>
    `,
  });

  return { success: true };
}
