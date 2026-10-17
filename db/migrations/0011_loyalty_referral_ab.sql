-- Go Vita: cashback points, referral codes, birthday opt-in and A/B tests of
-- banners. Code: src/lib/loyalty/, src/lib/referral/, src/lib/birthday/,
-- src/lib/merch/ab.ts; docs/MARKETING.md («Sodiqlik»).

/*
  Cashback ledger. One soʻm-point is one soʻm. The balance is never stored:
  it is the sum of the rows, with expiry evaluated lazily from the earning
  rows' expires_at (src/lib/loyalty/ledger.ts). An 'expire' row only
  materialises what the evaluation already treats as gone, so the plain sum
  and the evaluated balance agree once the expiry job has run.

  ref_id names the row a 'reverse' or 'expire' row offsets (the earn row a
  cancellation takes back, the redeem row a cancellation refunds, the lot that
  expired). Each row is reversed at most once, each order earns at most once
  and redeems at most once — all enforced here, so a double click or two
  machines processing the same status change cannot pay twice.
*/
create table loyalty_ledger (
  id          bigserial primary key,
  phone9      text not null check (phone9 ~ '^[0-9]{9}$'),
  delta       integer not null check (delta <> 0),
  kind        text not null check (kind in ('earn', 'redeem', 'expire', 'adjust', 'reverse')),
  order_id    bigint references orders (id) on delete set null,
  ref_id      bigint references loyalty_ledger (id) on delete set null,
  note        text check (note is null or length(note) <= 300),
  expires_at  timestamptz,
  created_by  integer references admin_users (id) on delete set null,
  created_at  timestamptz not null default now(),
  check (kind <> 'earn' or (delta > 0 and order_id is not null)),
  check (kind <> 'redeem' or (delta < 0 and order_id is not null)),
  check (kind <> 'expire' or (delta < 0 and ref_id is not null)),
  check (kind <> 'reverse' or ref_id is not null)
);
create index loyalty_ledger_phone_idx on loyalty_ledger (phone9, created_at, id);
create index loyalty_ledger_created_idx on loyalty_ledger (created_at desc);
create unique index loyalty_ledger_earn_once on loyalty_ledger (order_id) where kind = 'earn';
create unique index loyalty_ledger_redeem_once on loyalty_ledger (order_id) where kind = 'redeem';
create unique index loyalty_ledger_reverse_once on loyalty_ledger (ref_id) where kind in ('reverse', 'expire');

/*
  One-time codes that prove a phone before its points are spent. Only the
  HMAC of the code is kept (keyed with a server secret and bound to the
  phone), five attempts, five minutes. Rows older than a day are deleted by
  the expiry job.
*/
create table loyalty_otps (
  id          bigserial primary key,
  phone9      text not null check (phone9 ~ '^[0-9]{9}$'),
  code_hash   text not null,
  attempts    integer not null default 0 check (attempts >= 0),
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);
create index loyalty_otps_phone_idx on loyalty_otps (phone9, created_at desc);

/* Referral programme. A customer's code is stable: GV + 6 readable characters (no dash, unlike promo codes). */
create table referral_codes (
  phone9      text primary key check (phone9 ~ '^[0-9]{9}$'),
  code        text not null unique check (code ~ '^GV[A-Z2-9]{6}$'),
  created_at  timestamptz not null default now()
);

/*
  A friend's first order placed with a referral code. One live referral per
  referred phone (a cancelled one frees the phone: its next order is again a
  first order). The referrer's reward is decided when the order is delivered.
*/
create table referrals (
  id               bigserial primary key,
  code             text not null references referral_codes (code) on update cascade on delete restrict,
  referrer_phone9  text not null check (referrer_phone9 ~ '^[0-9]{9}$'),
  referred_phone9  text not null check (referred_phone9 ~ '^[0-9]{9}$'),
  order_id         bigint references orders (id) on delete set null,
  discount         integer not null default 0 check (discount >= 0),
  status           text not null default 'pending' check (status in ('pending', 'rewarded', 'capped', 'cancelled')),
  reward           jsonb,
  rewarded_at      timestamptz,
  created_at       timestamptz not null default now(),
  check (referrer_phone9 <> referred_phone9)
);
create unique index referrals_referred_once on referrals (referred_phone9) where status <> 'cancelled';
create unique index referrals_order_once on referrals (order_id) where order_id is not null;
create index referrals_referrer_idx on referrals (referrer_phone9, rewarded_at);

/*
  Birthday greetings, by explicit consent from /profile (or the cart). Day and
  month only; the year is optional and never required. Removing the consent
  deletes the row.
*/
create table customer_birthdays (
  phone9      text primary key check (phone9 ~ '^[0-9]{9}$'),
  name        text check (name is null or length(name) <= 80),
  day         smallint not null check (day between 1 and 31),
  month       smallint not null check (month between 1 and 12),
  year        smallint check (year is null or year between 1900 and 2100),
  locale      text not null default 'uz' check (locale in ('uz', 'ru')),
  consent_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (not (month = 2 and day > 29) and not (month in (4, 6, 9, 11) and day > 30))
);
create index customer_birthdays_date_idx on customer_birthdays (month, day);

/*
  A/B test of banners: two banners of one placement share an experiment key,
  one is variant A, the other B. A visitor sees one of them, chosen from the
  gv_ab cookie (src/lib/merch/ab.ts). An exposure is one visitor (gv_ab) ×
  banner × day; clicked_at marks a click on that day.
*/
alter table banners add column experiment text check (experiment is null or experiment ~ '^[a-z0-9][a-z0-9-]{0,39}$');
alter table banners add column variant text check (variant is null or variant in ('A', 'B'));
alter table banners add constraint banners_experiment_variant check ((experiment is null) = (variant is null));
create unique index banners_experiment_variant_idx on banners (experiment, variant) where experiment is not null;

create table banner_exposures (
  banner_id   bigint not null references banners (id) on delete cascade,
  ab_id       text not null check (ab_id ~ '^[A-Za-z0-9_-]{8,64}$'),
  day         date not null,
  visitor_id  uuid,
  clicked_at  timestamptz,
  created_at  timestamptz not null default now(),
  primary key (banner_id, ab_id, day)
);
create index banner_exposures_visitor_idx on banner_exposures (visitor_id) where visitor_id is not null;
