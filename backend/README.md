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
| `POST /api/v1/auth/register` | Name, phone, password → token |
| `POST /api/v1/auth/login` | Phone, password → token |
| `GET  /api/v1/auth/me` | Current user |
| `GET  /api/v1/profile/me` | Goals, household, birthday, consent |
| `PATCH /api/v1/profile/me` | Replaces the same. A changed address is an unverified address. |
| `GET  /api/v1/subscriptions/me` | The caller's repeating orders |
| `PATCH /api/v1/subscriptions/{id}` | Pause, resume, skip one, re-time, cancel |
| `GET  /health` | Liveness |

Service-to-service, authenticated with `X-Service-Key` rather than a customer
token — the storefront calls these as itself:

| | |
|---|---|
| `POST /api/v1/marketing/subscribers` | Double opt-in confirmed, or unsubscribed |
| `POST /api/v1/marketing/verify-email` | The registration confirmation link was clicked |
| `GET  /api/v1/marketing/due` | Who is due a message today |
| `POST /api/v1/marketing/sent` | What was delivered, and what failed |

Interactive docs at `/docs` once running.

## Four decisions worth knowing

**Guest orders are first-class.** `orders.user_id` is nullable, and so is
`subscriptions.user_id`. Checkout has no login and adding one as a precondition
would trade a working funnel for a database column. When someone registers
later, orders *and* subscriptions matching their phone are claimed
automatically, so "my orders" is useful on the first visit rather than empty.

**The phone is the identity.** It is what people in this market have and
already type into checkout, and it is stored digits-only — so `+998 90 123 45
67` at checkout and `998901234567` at signup are one customer, not two. The
email address is secondary: something a customer offers so we can write to
them, and worth nothing until `email_verified_at` is set.

**This service decides who to message; it does not send.** The templates, the
mail provider and the Telegram token live in the storefront, which is deployed.
Consent is checked *here* — a row only reaches the queue if the person agreed
and, for email, confirmed the address. See `docs/MARKETING.md`.

**A message is logged before it is handed out.** `marketing_messages.reminder_id`
is unique per occurrence, so a cron that runs twice cannot wish anyone a happy
birthday twice. Recording after delivery instead would risk the opposite: the
same greeting every minute until the send succeeds.

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
