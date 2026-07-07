-- The lead form was missing a street address (only had an optional city),
-- and there was no way to capture the barbershop's services/prices up
-- front, which is otherwise the first thing we'd have to ask for anyway
-- when manually onboarding a lead.

alter table directory_leads
  add column address text,
  add column services jsonb not null default '[]'::jsonb;
