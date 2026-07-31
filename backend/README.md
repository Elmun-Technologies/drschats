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
