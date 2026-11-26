-- AI yordamchi (lib/assistant/, /admin/assistant): one row per conversation an admin had
-- with the agent. `messages` is the Claude Messages API history exactly as sent (thinking
-- blocks included — they must be replayed unchanged); `pending` is a write action the agent
-- asked for and the admin has not approved or rejected yet. Token counters are for the
-- cost readout. Expand-only: nothing else reads or changes because of this table.

create table if not exists assistant_conversations (
  id                 bigserial primary key,
  admin_user_id      integer references admin_users(id) on delete cascade,
  title              text,
  messages           jsonb not null default '[]'::jsonb,
  pending            jsonb,
  model              text,
  input_tokens       bigint not null default 0,
  output_tokens      bigint not null default 0,
  cache_read_tokens  bigint not null default 0,
  cache_write_tokens bigint not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists assistant_conversations_admin_idx on assistant_conversations (admin_user_id, updated_at desc);
