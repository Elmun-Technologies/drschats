-- Keyword research (lib/keywords/, /admin/keywords): search demand from
-- Google Keyword Planner exports, one row per keyword, latest import wins.

create table keyword_imports (
  id             bigserial primary key,
  file_name      text,
  rows           integer not null,
  matched        integer not null,
  currency       text,
  ranged         boolean not null default false,   -- the account saw ranges ("1K – 10K"), not exact numbers
  admin_user_id  integer references admin_users(id) on delete set null,
  created_at     timestamptz not null default now()
);

create table keyword_stats (
  keyword            text primary key,               -- normalized (lib/keywords/generate.ts normalizeKeyword)
  lang               text not null check (lang in ('ru', 'uz', 'uz-cyrl')),
  subject            text,                           -- subjects.ts id, brand-…, "products", or null (unmatched idea)
  kind               text,
  intent             text,
  avg_monthly        integer,                        -- exact, or the geometric middle of a range
  avg_low            integer,
  avg_high           integer,
  ranged             boolean not null default false,
  competition        text check (competition is null or competition in ('low', 'medium', 'high')),
  competition_index  smallint,
  bid_low            numeric(14, 2),
  bid_high           numeric(14, 2),
  three_month_change text,
  yoy_change         text,
  monthly            jsonb not null default '{}'::jsonb,   -- {"2026-01": 1200, …}
  import_id          bigint references keyword_imports(id) on delete set null,
  updated_at         timestamptz not null default now()
);
create index keyword_stats_subject_idx on keyword_stats (subject);
