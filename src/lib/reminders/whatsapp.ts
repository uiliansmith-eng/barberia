import "server-only";

export type SendWhatsAppResult =
  | { status: "sent" }
  | { status: "not_configured" }
  | { status: "error"; error: string };

/**
 * Architecture placeholder for WhatsApp reminders (WhatsApp Cloud API).
 *
 * Not active yet — this only becomes functional once WHATSAPP_API_TOKEN and
 * WHATSAPP_PHONE_NUMBER_ID are set. The call shape below matches Meta's
 * Cloud API (`POST /{phone-number-id}/messages`) so activating it later is
 * just filling in the fetch call, no changes needed in the callers.
 */
export async function sendReminderWhatsApp(params: {
  to: string;
  message: string;
}): Promise<SendWhatsAppResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log(
      `[reminders] WhatsApp no configurado — se omite el envío a ${params.to}`
    );
    return { status: "not_configured" };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: params.to,
          type: "text",
          text: { body: params.message },
        }),
      }
    );

    if (!response.ok) {
      return { status: "error", error: await response.text() };
    }

    return { status: "sent" };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
