-- Signing in to the website through the club bot (lib/customer/telegram-login.ts).
--
-- The site creates a row and opens t.me/<bot>?start=login_<token>; the bot asks the
-- customer to confirm («Avtorizatsiyani tasdiqlang») and reports the chat that did.
-- Only hashes are stored: the token travels through Telegram, the browser keeps its
-- own nonce in an httpOnly cookie, and neither alone is enough to sign in.

create table telegram_logins (
  id            bigserial primary key,
  token_hash    text not null unique,
  browser_hash  text not null,
  status        text not null default 'pending' check (status in ('pending', 'confirmed', 'denied', 'used')),
  chat_id       bigint,
  locale        text not null default 'uz' check (locale in ('uz', 'ru')),
  device        text,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  confirmed_at  timestamptz,
  used_at       timestamptz
);

create index telegram_logins_created_idx on telegram_logins (created_at);
