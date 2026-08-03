# Go Vita API — accounts and orders

Faza 1 of `docs/ARCHITECTURE.md`. Deliberately **not** the catalogue: products,
categories and promotions still come from the existing backend, and duplicating
them here would mean maintaining two sources of truth for the same data before
anything is gained.

What this service exists for is the one thing nothing else does — **orders are
persisted**. Today an order becomes a Telegram message and then stops existing:
no history, no repeat purchase, no analytics, and no foundation for the
customer, doctor or partner cabinets.

## Endpoints

| | |
|---|---|
| `POST /api/v1/orders` | Accepts the payload the storefront already sends, byte for byte. Works signed in or out. |
| `GET  /api/v1/orders/me` | The caller's orders. Requires a token. |
| `POST /api/v1/auth/otp/request` | Phone → a code in Telegram, or a link to start the bot |
| `POST /api/v1/auth/otp/verify` | Phone + code → token, creating the account if new |
| `GET  /api/v1/auth/me` | Current user |
| `POST /api/v1/telegram/webhook` | Bot updates. Guarded by a shared secret. |
| `GET  /health` | Liveness |

Interactive docs at `/docs` once running.

## Two decisions worth knowing

**Guest orders are first-class.** `orders.user_id` is nullable. Checkout has no
login and adding one as a precondition would trade a working funnel for a
database column. When someone registers later, orders matching their phone are
claimed automatically, so "my orders" is useful on the first visit rather than
empty.

**The phone is the identity.** It is what people in this market have and
already type into checkout, and it is stored digits-only — so `+998 90 123 45
67` at checkout and `998901234567` at signup are one customer, not two.

**There are no passwords.** Signing in is a phone and a six-digit code sent
over Telegram, which is what this market expects and what the competition does.
Sign-up and sign-in are therefore the same request — the phone is the identity,
the code proves it, and there is nothing else to register.

## The Telegram constraint that shapes the flow

**A bot cannot message a phone number.** It can only reply inside a chat the
person has already opened with it. So a code can reach someone only after they
have started the bot and shared their contact, and `POST /auth/otp/request` has
two possible answers:

| answer | meaning |
|---|---|
| `{"status": "sent"}` | The phone has a linked chat; a code is on its way. |
| `{"status": "link_required", "telegramLink": "..."}` | Nobody can be reached yet. Open the link, press Start, share the contact — the bot binds the phone and sends the code straight away. |

No code is issued in the second case: one nobody can receive would only spend a
slot against that phone's hourly budget.

Contacts are accepted only when Telegram says `contact.user_id` matches the
sender. A forwarded card carries someone else's number, and binding it would
hand their sign-in codes to whoever forwarded it.

## What keeps a six-digit code safe

It is 20 bits, so the length is not the protection — the limits are:

| | |
|---|---|
| Lifetime | 5 minutes |
| Guesses | 5, then the code is burned |
| Requests | 5 per phone per hour, 60s between them |
| At rest | HMAC-SHA256 keyed with `JWT_SECRET`, salted with the phone — never the code itself |
| Reuse | Single-use; issuing a new code retires the previous one |

Every rejection says `invalid_code`, whether the code was wrong, expired or
never existed. Splitting those apart would tell an attacker which phone numbers
have accounts.

## Running it

From the repository root:

```bash
docker compose up -d          # postgres, redis, meilisearch, api
curl localhost:8000/health
```

Migrations run automatically on container start.

Locally, without Docker:

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

## Tests

```bash
.venv/bin/python -m pytest
```

The suite runs against SQLite for speed and isolation. That is a real gap worth
naming: Postgres-specific behaviour is not exercised, so the first deploy
should run `alembic upgrade head` against a real database before taking
traffic. The schema itself is dialect-neutral — the bigint primary keys carry a
SQLite variant precisely so the tests exercise the same models the application
uses.

## Connecting the storefront

The order endpoint matches `src/lib/shopflow/schemas.ts`, so switching over is
configuration rather than code:

```env
SHOPFLOW_MODE=http
SHOPFLOW_API_URL=https://api.your-host.example
```

Catalogue reads will 404 against this service until Faza 2 — point the
storefront here only once the catalogue moves too, or split the two base URLs
first.
