# syntax=docker/dockerfile:1

# Go Vita storefront — production image (Hetzner/Coolify, Fly.io): docs/DEPLOY-HETZNER.md.
# Node 22 = .nvmrc, package.json engines and CI; do not bump it here alone.
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
ARG NEXT_PUBLIC_LICENCE_NUMBER
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_DELIVERY_CUTOFF
ARG NEXT_PUBLIC_TELEGRAM_CLUB_BOT
ARG CSP_MODE=report-only
# Analytics IDs are managed in /admin/integrations; this lets their vendor hosts through the CSP.
ARG ADMIN_ANALYTICS_CSP=on
ARG STORAGE_PUBLIC_URL
# The Tigris bucket: the image optimiser and img-src allow only this bucket
# (lib/security/csp.ts). Not secret; fly-deploy.yml passes it. Unset = any bucket.
ARG BUCKET_NAME

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID \
    NEXT_PUBLIC_GA4_ID=$NEXT_PUBLIC_GA4_ID \
    NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID \
    NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID \
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME \
    NEXT_PUBLIC_LICENCE_NUMBER=$NEXT_PUBLIC_LICENCE_NUMBER \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID \
    NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET \
    NEXT_PUBLIC_DELIVERY_CUTOFF=$NEXT_PUBLIC_DELIVERY_CUTOFF \
    NEXT_PUBLIC_TELEGRAM_CLUB_BOT=$NEXT_PUBLIC_TELEGRAM_CLUB_BOT \
    CSP_MODE=$CSP_MODE \
    ADMIN_ANALYTICS_CSP=$ADMIN_ANALYTICS_CSP \
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

# The app's code belongs to root: the process (user app) can read it but not
# change it, so a bug that lets someone write files cannot rewrite the server.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# release_command: `node scripts/db/migrate.mjs`. Next bundles `postgres` into
# the server chunks, so the migration script gets its own copy (no deps).
COPY --from=build /app/scripts/db ./scripts/db
COPY --from=build /app/db ./db
COPY --from=build /app/node_modules/postgres ./node_modules/postgres

# What Next writes at runtime, and nothing else: .next/cache (images, fetch
# cache) and the ISR output under .next/server/app. Its directories are
# root:app with the sticky bit — the app can add and replace its own page
# files but cannot delete or replace the root-owned .js beside them.
RUN mkdir -p .next/cache && chown -R app:app .next/cache \
 && find .next/server/app -type d -exec chown root:app {} + -exec chmod 1775 {} + \
 && find .next/server/app -type f ! -name '*.js' ! -name '*.js.map' ! -name '*.json' -exec chown app:app {} +

USER app
EXPOSE 3000
CMD ["node", "server.js"]
