import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Config error" }, { status: 500 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = session.metadata?.appointment_id;

    if (appointmentId) {
      await admin
        .from("appointments")
        .update({
          payment_status: "paid",
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
        })
        .eq("id", appointmentId);
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await admin
      .from("tenants")
      .update({ stripe_charges_enabled: account.charges_enabled ?? false })
      .eq("stripe_account_id", account.id);
  }

  return NextResponse.json({ received: true });
}
