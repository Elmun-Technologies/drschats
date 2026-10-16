-- Admin-managed server integration settings. Values are encrypted by the
-- application with AES-256-GCM before they reach this table; never store API
-- tokens or credentials here in plaintext.
create table integration_settings (
  key         text primary key,
  ciphertext  text not null,
  updated_by  integer references admin_users (id) on delete set null,
  updated_at  timestamptz not null default now(),
  check (key in (
    'operator.botToken',
    'operator.chatId',
    'email.apiKey',
    'analytics.gtmId',
    'analytics.ga4Id',
    'analytics.metaPixelId',
    'analytics.yandexMetrikaId',
    'email.from',
    'email.replyTo'
  ))
);
