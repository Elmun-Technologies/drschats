-- Transactional SMS (order received, status changes) share the outbox with
-- marketing messages but not its rules: no opt-out check, no STOP link, and
-- they are not held for quiet hours (lib/messaging/outbox.ts).
alter table outbound_messages
  add column kind text not null default 'marketing' check (kind in ('marketing', 'transactional'));
