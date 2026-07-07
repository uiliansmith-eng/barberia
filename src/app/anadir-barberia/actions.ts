"use server";

import { createClient } from "@/lib/supabase/server";
import { directoryLeadSchema } from "@/lib/validations/directory-lead";
import { sendReminderEmail } from "@/lib/reminders/email";

export type DirectoryLeadActionState = {
  error?: string;
  success?: boolean;
} | null;

const NOTIFY_EMAIL = "info@appstles.com";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function submitDirectoryLead(
  _prevState: DirectoryLeadActionState,
  formData: FormData
): Promise<DirectoryLeadActionState> {
  const parsed = directoryLeadSchema.safeParse({
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    source: formData.get("source"),
    notes: formData.get("notes"),
    serviceNames: formData.getAll("serviceName"),
    servicePrices: formData.getAll("servicePrice"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const services = parsed.data.serviceNames
    .map((name, i) => ({
      name: name.trim(),
      price: Number(parsed.data.servicePrices[i]) || 0,
    }))
    .filter((s) => s.name.length > 0);

  const supabase = await createClient();
  const { error } = await supabase.from("directory_leads").insert({
    business_name: parsed.data.businessName,
    contact_name: parsed.data.contactName,
    phone: parsed.data.phone,
    email: parsed.data.email,
    address: parsed.data.address,
    city: parsed.data.city || null,
    source: parsed.data.source,
    notes: parsed.data.notes || null,
    services,
  });

  if (error) {
    return { error: "No se pudo enviar la solicitud. Inténtalo de nuevo." };
  }

  const servicesList = services.length
    ? `<ul>${services.map((s) => `<li>${escapeHtml(s.name)} — ${s.price}€</li>`).join("")}</ul>`
    : "—";

  await sendReminderEmail({
    to: NOTIFY_EMAIL,
    subject: `Nueva solicitud de barbería: ${parsed.data.businessName}`,
    html: `
      <p>Nueva solicitud para el directorio de BarberOS.</p>
      <ul>
        <li><strong>Barbería:</strong> ${escapeHtml(parsed.data.businessName)}</li>
        <li><strong>Contacto:</strong> ${escapeHtml(parsed.data.contactName)}</li>
        <li><strong>Teléfono:</strong> ${escapeHtml(parsed.data.phone)}</li>
        <li><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</li>
        <li><strong>Dirección:</strong> ${escapeHtml(parsed.data.address)}</li>
        <li><strong>Ciudad:</strong> ${parsed.data.city ? escapeHtml(parsed.data.city) : "—"}</li>
        <li><strong>Quién envía:</strong> ${parsed.data.source === "owner" ? "Dueño de la barbería" : "Equipo BarberOS"}</li>
        <li><strong>Notas:</strong> ${parsed.data.notes ? escapeHtml(parsed.data.notes) : "—"}</li>
      </ul>
      <p><strong>Servicios y precios:</strong></p>
      ${servicesList}
    `,
  });

  return { success: true };
}
