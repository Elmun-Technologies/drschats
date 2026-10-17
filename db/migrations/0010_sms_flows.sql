-- Go Vita: SMS channel, automated marketing flows, one message outbox and
-- campaign → order attribution. Code: src/lib/sms/, src/lib/messaging/,
-- src/lib/flows/; docs/MARKETING.md («Avtomatlashtirish»).

-- Eskiz credentials live encrypted in integration_settings (sms.email,
-- sms.password, sms.sender). The key list was a fixed CHECK; parallel
-- migrations add their own keys, so the check becomes a shape rule and the
-- application (INTEGRATION_SETTING_KEYS) stays the allow-list.
alter table integration_settings drop constraint if exists integration_settings_key_check;
alter table integration_settings add constraint integration_settings_key_check
  check (key ~ '^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9]+$');

-- A customer who said "stop". Every flow and campaign reads this before it
-- sends; 'all' stops every marketing channel.
create table marketing_optouts (
  phone9      text not null check (phone9 ~ '^[0-9]{9}$'),
  channel     text not null check (channel in ('sms', 'telegram', 'all')),
  source      text,
  created_at  timestamptz not null default now(),
  primary key (phone9, channel)
);

-- Automations. Steps (jsonb, validated by lib/flows/types.ts):
-- [{ delayMinutes, channel, text: {uz, ru}, link, promo }]. Delays count from
-- the trigger moment (cart time, delivery, last order), not from the previous step.
create table flows (
  id          text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,39}$'),
  name        text not null check (length(name) between 1 and 120),
  trigger     text not null check (trigger in (
                'cart_abandoned', 'checkout_dropped', 'first_order_delivered',
                'course_ending', 'lapsed', 'restock', 'birthday'
              )),
  active      boolean not null default false,
  steps       jsonb not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One run of one flow for one customer. `cycle` names what started the run
-- (the cart's timestamp, an order id), so the same cart never enrolls twice
-- while a new cart a month later does.
create table flow_enrollments (
  id                  bigserial primary key,
  flow_id             text not null references flows (id) on delete cascade,
  subject             text not null check (subject ~ '^[0-9]{9}$'),
  cycle               text not null,
  context             jsonb not null default '{}',
  anchor_at           timestamptz not null,
  step                integer not null default 0,
  next_at             timestamptz,
  status              text not null default 'active'
                      check (status in ('active', 'converted', 'exited', 'done')),
  exit_reason         text,
  converted_order_id  bigint references orders (id) on delete set null,
  enrolled_at         timestamptz not null default now(),
  finished_at         timestamptz,
  unique (flow_id, subject, cycle)
);
create index flow_enrollments_due_idx on flow_enrollments (next_at) where status = 'active';
create index flow_enrollments_flow_idx on flow_enrollments (flow_id, status);

-- Manual campaigns may now go by SMS (or Telegram, else SMS) and carry a
-- personal promo code per recipient.
alter table campaigns drop constraint if exists campaigns_channel_check;
alter table campaigns add constraint campaigns_channel_check
  check (channel in ('telegram', 'sms', 'telegram_then_sms'));
alter table campaigns add column promo jsonb;
alter table campaigns add column link text;

-- Every marketing message, SMS and Telegram alike. SMS is sent by the
-- in-process worker (lib/messaging/worker.ts); a Telegram row is handed to
-- the club bot's own outbox (bot_jobs, which the bot delivers) and keeps its
-- bot_job_id, so delivery is read from there.
create table outbound_messages (
  id             bigserial primary key,
  channel        text not null check (channel in ('sms', 'telegram')),
  phone9         text check (phone9 is null or phone9 ~ '^[0-9]{9}$'),
  chat_id        bigint,
  locale         text not null default 'uz' check (locale in ('uz', 'ru')),
  -- Placeholders that need the send moment ({kod}, {muddat}, {havola}) stay
  -- in the text until then; after sending this is the exact text that went out.
  text           text not null check (length(text) between 1 and 2000),
  link           text,
  promo          jsonb,
  promo_code     text,
  flow_id        text references flows (id) on delete set null,
  flow_step      integer,
  enrollment_id  bigint references flow_enrollments (id) on delete set null,
  campaign_id    bigint references campaigns (id) on delete set null,
  dedupe_key     text not null unique,
  status         text not null default 'pending'
                 check (status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  attempts       integer not null default 0,
  error          text,
  provider_ref   text,
  bot_job_id     bigint,
  scheduled_at   timestamptz not null default now(),
  -- When a worker took it (status 'sending'). A row stuck there after a crash
  -- is marked failed, never resent: the gateway may already have it.
  claimed_at     timestamptz,
  sent_at        timestamptz,
  clicked_at     timestamptz,
  clicks         integer not null default 0,
  created_at     timestamptz not null default now(),
  check (phone9 is not null or chat_id is not null)
);
create index outbound_messages_due_idx on outbound_messages (scheduled_at, id) where status = 'pending';
create index outbound_messages_created_idx on outbound_messages (created_at desc);
create index outbound_messages_flow_idx on outbound_messages (flow_id, created_at desc) where flow_id is not null;
create index outbound_messages_campaign_idx on outbound_messages (campaign_id) where campaign_id is not null;
create index outbound_messages_phone_idx on outbound_messages (phone9, created_at desc) where phone9 is not null;

-- Attribution reads promo_codes by campaign_id ('flow-<id>', 'campaign-<id>').
create index promo_codes_campaign_idx on promo_codes (campaign_id) where campaign_id is not null;
