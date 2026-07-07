import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";
import type Stripe from "stripe";
import type { Enums } from "@/lib/supabase/database.types";

type SubscriptionStatus = Enums<"subscription_status">;

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

    if (session.mode === "subscription") {
      const tenantId = session.metadata?.tenant_id;
      const plan = session.metadata?.plan;
      if (tenantId && (plan === "pro" || plan === "business")) {
        await admin.from("subscriptions").upsert(
          {
            tenant_id: tenantId,
            plan,
            status: "active",
            stripe_customer_id:
              typeof session.customer === "string"
                ? session.customer
                : (session.customer?.id ?? null),
            stripe_subscription_id:
              typeof session.subscription === "string"
                ? session.subscription
                : (session.subscription?.id ?? null),
          },
          { onConflict: "tenant_id" }
        );
      }
    } else {
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
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const tenantId = subscription.metadata?.tenant_id;

    if (tenantId) {
      const statusMap: Record<string, SubscriptionStatus> = {
        active: "active",
        trialing: "trialing",
        past_due: "past_due",
        canceled: "canceled",
        unpaid: "past_due",
        incomplete_expired: "canceled",
      };
      const status = statusMap[subscription.status] ?? "canceled";
      const periodEnd = subscription.items.data[0]?.current_period_end;

      await admin
        .from("subscriptions")
        .update({
          status,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        })
        .eq("tenant_id", tenantId);
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
