import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  const { data: tenant } = profile?.tenant_id
    ? await supabase
        .from("tenants")
        .select("stripe_account_id")
        .eq("id", profile.tenant_id)
        .single()
    : { data: null };

  if (!tenant?.stripe_account_id) {
    return NextResponse.redirect(`${siteUrl}/dashboard`);
  }

  const stripe = getStripeClient();
  const accountLink = await stripe.accountLinks.create({
    account: tenant.stripe_account_id,
    refresh_url: `${siteUrl}/api/stripe/connect/refresh`,
    return_url: `${siteUrl}/api/stripe/connect/return`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}
