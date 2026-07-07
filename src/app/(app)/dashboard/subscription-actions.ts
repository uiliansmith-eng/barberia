"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

async function getOwnerContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id || profile.role !== "owner") return null;

  return { tenantId: profile.tenant_id, email: user.email ?? undefined };
}

const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_ID_PRO,
  business: process.env.STRIPE_PRICE_ID_BUSINESS,
};

export async function createSubscriptionCheckout(
  plan: "pro" | "business"
): Promise<{ url: string } | { error: string }> {
  const ctx = await getOwnerContext();
  if (!ctx) return { error: "No autorizado" };

  const priceId = PRICE_IDS[plan];
  if (!priceId) return { error: "Plan no disponible" };

  const stripe = getStripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: ctx.email,
    client_reference_id: ctx.tenantId,
    metadata: { tenant_id: ctx.tenantId, plan },
    subscription_data: {
      trial_period_days: 14,
      metadata: { tenant_id: ctx.tenantId, plan },
    },
    success_url: `${siteUrl}/dashboard?subscription=success`,
    cancel_url: `${siteUrl}/dashboard?subscription=cancelled`,
  });

  if (!session.url) return { error: "No se pudo iniciar el pago." };
  return { url: session.url };
}

export async function createBillingPortalSession(): Promise<
  { url: string } | { error: string }
> {
  const ctx = await getOwnerContext();
  if (!ctx) return { error: "No autorizado" };

  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("tenant_id", ctx.tenantId)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return { error: "No tienes una suscripción activa." };
  }

  const stripe = getStripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${siteUrl}/dashboard`,
  });

  return { url: session.url };
}
