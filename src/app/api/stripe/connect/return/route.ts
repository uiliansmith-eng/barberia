import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) {
    return NextResponse.redirect(`${siteUrl}/dashboard`);
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("stripe_account_id")
    .eq("id", profile.tenant_id)
    .single();

  if (tenant?.stripe_account_id) {
    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve(tenant.stripe_account_id);
    const admin = createAdminClient();
    await admin
      .from("tenants")
      .update({ stripe_charges_enabled: account.charges_enabled })
      .eq("id", profile.tenant_id);
  }

  return NextResponse.redirect(`${siteUrl}/dashboard?stripe=connected`);
}
