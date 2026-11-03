-- Advertising SMS rules in force from 2026-11-01 (presidential decree of 2026-07-15):
-- an advertising SMS needs the recipient's prior written or electronic consent, and none
-- may go out between 18:00 and 09:00 Tashkent (lib/messaging/quiet-hours.ts).
--
-- A STOP (marketing_optouts) still wins over a consent. Order SMS (kind = 'transactional')
-- are not advertising and need neither. Telegram messages are not mobile-network SMS.

create table sms_marketing_consents (
  phone9        text primary key check (phone9 ~ '^[0-9]{9}$'),
  source        text not null,                 -- where it was given: 'checkout', ...
  consent_text  text not null,                 -- the wording the customer agreed to (version tag)
  consented_at  timestamptz not null default now()
);

-- A message the recipient asked for themselves (a restock or price-drop request:
-- "let me know by SMS when it is back"). The request is the consent for that one
-- message, not for any other advertising SMS.
alter table outbound_messages
  add column requested boolean not null default false;
