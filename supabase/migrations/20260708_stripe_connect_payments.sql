-- Online payments at booking time via Stripe Connect (destination charges):
-- each barbershop connects its own Express account, and payment for a
-- booking is transferred straight to that account, not pooled in ours.

alter table tenants
  add column stripe_account_id text,
  add column stripe_charges_enabled boolean not null default false,
  add column require_online_payment boolean not null default false;

alter table appointments
  add column payment_status text not null default 'not_required',
  add column stripe_checkout_session_id text,
  add column stripe_payment_intent_id text;

alter table appointments
  add constraint appointments_payment_status_check
  check (payment_status in ('not_required', 'unpaid', 'paid', 'refunded'));

-- Only the service-role (webhook/connect-onboarding server code) may set
-- these — an owner must not be able to self-report "charges enabled"
-- without actually completing Stripe onboarding.
revoke update (stripe_account_id, stripe_charges_enabled) on tenants from authenticated;
