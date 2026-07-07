-- subscriptions rows must only ever be written by the Stripe webhook
-- (service role, bypasses RLS). The previous subscriptions_write_owner
-- policy let a tenant's owner INSERT/UPDATE/DELETE their own subscription
-- row directly — including setting plan='business' and status='active'
-- themselves, which would grant unlimited bookings for free. Owners can
-- still read their own subscription (subscriptions_select).

drop policy if exists subscriptions_write_owner on subscriptions;
