"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";

const CANCELABLE_STATUSES = new Set(["trialing", "active", "past_due"]);

export async function deleteMyAccount(): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  const admin = createAdminClient();

  // Owners take the whole business down with them — everyone else just
  // removes themselves. tenants → (appointments, clientes, barberos,
  // servicios, horarios, inventario, reseñas, profiles de todo el
  // personal) cascadea por FK, así que borrar el tenant basta para los
  // datos del negocio.
  if (profile?.role === "owner" && profile.tenant_id) {
    const tenantId = profile.tenant_id;

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (
      subscription?.stripe_subscription_id &&
      CANCELABLE_STATUSES.has(subscription.status)
    ) {
      try {
        const stripe = getStripeClient();
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch {
        // Best effort — a Stripe hiccup shouldn't block the deletion itself.
      }
    }

    const { error: tenantError } = await admin
      .from("tenants")
      .delete()
      .eq("id", tenantId);

    if (tenantError) {
      return { error: "No se pudo eliminar el negocio. Inténtalo de nuevo." };
    }
  }

  const { error: userError } = await admin.auth.admin.deleteUser(user.id);
  if (userError) {
    return { error: "No se pudo eliminar la cuenta. Inténtalo de nuevo." };
  }

  await supabase.auth.signOut();
  redirect("/login?deleted=1");
}
