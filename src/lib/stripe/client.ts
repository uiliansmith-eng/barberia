import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY no está configurada. Añádela en .env.local (Stripe Dashboard > Developers > API keys)."
    );
  }
  stripe ??= new Stripe(secretKey);
  return stripe;
}
