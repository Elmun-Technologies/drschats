-- Click fiscal receipts (docs.click.uz → Merchant API → Фискализация данных).
-- Payme carries the receipt inside CheckPerformTransaction; Click takes it after
-- the payment, through ofd_data/submit_items. A performed Click payment is
-- marked pending and the worker sends it until Click accepts it.
alter table payments
  add column if not exists fiscal_status text
    check (fiscal_status is null or fiscal_status in ('pending', 'sent', 'failed', 'missing_codes')),
  add column if not exists fiscal_attempts integer not null default 0,
  add column if not exists fiscal_error text,
  add column if not exists fiscal_sent_at timestamptz;

create index if not exists payments_fiscal_due_idx on payments (id)
  where fiscal_status in ('pending', 'failed', 'missing_codes');
