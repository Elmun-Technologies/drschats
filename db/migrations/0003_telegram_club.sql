-- Telegram club bot (govita-vip-bot). The bot keeps no data of its own: it
-- calls the site's API (src/app/api/bot) and everything lives here, next to
-- the orders it reports on. Managed from /admin/bot.

-- One row: the club settings an admin edits (src/lib/bot/config.ts).
create table bot_config (
  id         integer primary key check (id = 1),
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Everyone who pressed /start. blocked_at is set when Telegram says the user
-- blocked the bot; nothing is queued for them until they /start again.
create table bot_members (
  chat_id    bigint primary key,
  locale     text not null default 'uz' check (locale in ('uz', 'ru')),
  source     text,
  blocked_at timestamptz,
  created_at timestamptz not null default now()
);

-- A Telegram account proven to own a phone number (it shared its own contact).
-- phone is 998XXXXXXXXX; both sides are unique, so one phone is one chat.
create table telegram_links (
  chat_id    bigint primary key,
  phone      text not null unique check (phone ~ '^998[0-9]{9}$'),
  name       text,
  username   text,
  linked_at  timestamptz not null default now()
);

create table bot_tickets (
  id          bigserial primary key,
  chat_id     bigint not null,
  category    text not null check (category in ('operator', 'consult', 'return', 'club-conflict')),
  text        text not null,
  status      text not null default 'open' check (status in ('open', 'answered', 'closed')),
  reply       text,
  created_at  timestamptz not null default now(),
  answered_at timestamptz
);
create index bot_tickets_status on bot_tickets (status, created_at desc);

-- Outbox: the site queues, the bot claims (with a lease), sends and reports.
-- dedupe_key makes every enqueue idempotent (an order event, a ticket reply).
create table bot_jobs (
  id           bigserial primary key,
  dedupe_key   text not null unique,
  chat_id      bigint not null,
  kind         text not null,
  payload      jsonb not null,
  status       text not null default 'pending'
               check (status in ('pending', 'leased', 'sent', 'failed', 'blocked')),
  attempts     integer not null default 0,
  due_at       timestamptz not null default now(),
  lease_token  text,
  leased_until timestamptz,
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index bot_jobs_due on bot_jobs (status, due_at);

-- Status history of an order, as the customer was told it.
create table bot_order_events (
  id         bigserial primary key,
  order_id   bigint not null references orders (id) on delete cascade,
  status     text not null,
  created_at timestamptz not null default now()
);
create index bot_order_events_order on bot_order_events (order_id, created_at);

-- Orders placed inside the Telegram Mini App carry the verified chat id.
alter table orders add column telegram_chat_id bigint;
create index orders_telegram_chat on orders (telegram_chat_id) where telegram_chat_id is not null;
-- Customers are matched on the last nine digits of their phone
-- (ordersFromPhone, the bot's "my orders"); this is that expression.
create index orders_phone9 on orders (right(regexp_replace(customer ->> 'phone', '\D', '', 'g'), 9));
