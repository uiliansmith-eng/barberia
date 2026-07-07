"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";

async function getOwnerTenant() {
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

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, stripe_account_id, stripe_charges_enabled, require_online_payment")
    .eq("id", profile.tenant_id)
    .single();

  return tenant;
}

export async function createStripeConnectLink(): Promise<
  { url: string } | { error: string }
> {
  const tenant = await getOwnerTenant();
  if (!tenant) return { error: "No autorizado" };

  const stripe = getStripeClient();
  const admin = createAdminClient();

  let accountId = tenant.stripe_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      business_type: "individual",
      metadata: { tenant_id: tenant.id },
    });
    accountId = account.id;

    await admin
      .from("tenants")
      .update({ stripe_account_id: accountId })
      .eq("id", tenant.id);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${siteUrl}/api/stripe/connect/refresh`,
    return_url: `${siteUrl}/api/stripe/connect/return`,
    type: "account_onboarding",
  });

  return { url: accountLink.url };
}

export async function setRequireOnlinePayment(
  next: boolean
): Promise<{ error?: string }> {
  const tenant = await getOwnerTenant();
  if (!tenant) return { error: "No autorizado" };

  if (next && !tenant.stripe_charges_enabled) {
    return { error: "Conecta y activa tu cuenta de Stripe primero." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tenants")
    .update({ require_online_payment: next })
    .eq("id", tenant.id);

  if (error) return { error: "No se pudo actualizar la preferencia." };
  return {};
}
