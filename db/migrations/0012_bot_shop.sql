-- The club bot becomes a shop: the bot's catalogue, cart and checkout run
-- through the same products, prices, promotions and placeOrder() transaction
-- as the website. Nothing here holds a price: a cart row only says which
-- product and how many, and prices are read from the catalogue on every call.

-- Where an order came from. The site is the default so existing rows and the
-- normal checkout keep working unchanged; the bot marks its own rows.
alter table orders add column source text not null default 'site'
  check (source in ('site', 'telegram_bot', 'telegram_mini'));
create index orders_source_created_idx on orders (source, created_at desc);

-- One cart per Telegram chat, kept server-side so the bot stays stateless and
-- an abandoned bot cart is visible to the same marketing machinery.
-- lines: [{"slug": "product-slug", "qty": 2}]
create table bot_carts (
  chat_id     bigint primary key,
  lines       jsonb not null default '[]'::jsonb,
  promo_code  text,
  locale      text not null default 'uz' check (locale in ('uz', 'ru')),
  updated_at  timestamptz not null default now()
);
create index bot_carts_updated_idx on bot_carts (updated_at desc);

-- Idempotency for the bot's "Tasdiqlash": a double tap, a retried request
-- after a timeout, or two bot replicas must produce one order.
create table bot_order_keys (
  chat_id       bigint not null,
  key           text not null check (char_length(key) between 8 and 128),
  order_number  text,
  created_at    timestamptz not null default now(),
  primary key (chat_id, key)
);

-- The waitlist now also feeds the "Omborga keldi" flow (lib/flows/restock.ts),
-- which delivers through the shared outbox. "flow" records that path.
alter table restock_requests drop constraint if exists restock_requests_notified_via_check;
alter table restock_requests add constraint restock_requests_notified_via_check
  check (notified_via in ('telegram', 'sms', 'operator', 'manual', 'flow'));

-- A scheduled "Bugungi taklif" lowers the selling price when its window
-- opens. Marking each deal once is what lets the worker tell the waiting
-- "narx tushsa xabar bering" customers exactly when it starts.
create table deal_notifications (
  deal_id     bigint primary key references deals (id) on delete cascade,
  notified_at timestamptz not null default now()
);
