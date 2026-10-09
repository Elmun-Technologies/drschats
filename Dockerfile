# syntax=docker/dockerfile:1

# Go Vita storefront — production image for Fly.io (see docs/DEPLOY-FLY.md).
# Three stages: install, build the standalone server, run it on a slim base.
# Debian slim, not Alpine: sharp (image optimisation) ships glibc binaries.

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so
# they are build arguments (fly.toml [build.args]), not runtime secrets.
ARG NEXT_PUBLIC_SITE_URL=https://www.govita.uz
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_GA4_ID
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ARG NEXT_PUBLIC_PAYME_MERCHANT_ID
ARG NEXT_PUBLIC_CLICK_MERCHANT_ID
ARG NEXT_PUBLIC_UZUM_MERCHANT_ID
ARG NEXT_PUBLIC_LICENCE_NUMBER
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG CSP_MODE=report-only
ARG STORAGE_PUBLIC_URL

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID \
    NEXT_PUBLIC_GA4_ID=$NEXT_PUBLIC_GA4_ID \
    NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID \
    NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID \
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME \
    NEXT_PUBLIC_PAYME_MERCHANT_ID=$NEXT_PUBLIC_PAYME_MERCHANT_ID \
    NEXT_PUBLIC_CLICK_MERCHANT_ID=$NEXT_PUBLIC_CLICK_MERCHANT_ID \
    NEXT_PUBLIC_UZUM_MERCHANT_ID=$NEXT_PUBLIC_UZUM_MERCHANT_ID \
    NEXT_PUBLIC_LICENCE_NUMBER=$NEXT_PUBLIC_LICENCE_NUMBER \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID \
    NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET \
    CSP_MODE=$CSP_MODE \
    STORAGE_PUBLIC_URL=$STORAGE_PUBLIC_URL \
    GOVITA_PRODUCTION=1 \
    BUILD_STANDALONE=1 \
    NEXT_TELEMETRY_DISABLED=1

# No DATABASE_URL here: migrations run as Fly's release_command against the
# real database, so `npm run build` skips them and prerenders from the
# built-in catalogue; pages refresh from the database at runtime (ISR).
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    GOVITA_PRODUCTION=1 \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 app && useradd --system --uid 1001 --gid app app

COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
# release_command: `node scripts/db/migrate.mjs`. Next bundles `postgres` into
# the server chunks, so the migration script gets its own copy (no deps).
COPY --from=build --chown=app:app /app/scripts/db ./scripts/db
COPY --from=build --chown=app:app /app/db ./db
COPY --from=build --chown=app:app /app/node_modules/postgres ./node_modules/postgres

USER app
EXPOSE 3000
CMD ["node", "server.js"]
