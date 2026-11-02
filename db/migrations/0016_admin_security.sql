-- Admin security: roles, two-factor sign-in (TOTP) and an audit log (lib/admin/).

-- owner: everything; manager: the shop without users and integrations;
-- operator: orders, customers, waiting list and support.
-- Admins that exist today keep what they had: all of it.
alter table admin_users
  add column role text not null default 'owner' check (role in ('owner', 'manager', 'operator')),
  add column totp_secret text,                 -- AES-GCM, key derived from ADMIN_SESSION_SECRET
  add column totp_enabled_at timestamptz,
  add column totp_last_step bigint,             -- a code is accepted once (replay)
  add column recovery_codes text[];             -- sha256 of each unused one-time code (random, 50 bits)

-- New admins are invited at the least power; the owner raises them.
alter table admin_users alter column role set default 'operator';

create table admin_audit_log (
  id             bigserial primary key,
  admin_user_id  integer references admin_users(id) on delete set null,
  admin_email    text,                          -- kept when the admin is deleted
  action         text not null,
  target         text,
  detail         jsonb,
  ip             text,
  created_at     timestamptz not null default now()
);
create index admin_audit_log_created_idx on admin_audit_log (created_at desc);
create index admin_audit_log_admin_idx on admin_audit_log (admin_user_id, created_at desc);
