import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import OTP_HMAC_KEY_MIN_BYTES, get_settings
from app.routers import auth, marketing, orders, profile, subscriptions, telegram_hook, bot_admin, bot_service

logging.basicConfig(level=logging.INFO)

settings = get_settings()

if settings.is_production and settings.jwt_secret == "dev-only-change-me":
    # Fail at boot, not at the first forged token.
    raise RuntimeError("JWT_SECRET must be set in production")

# A derived code-hashing key still comes from JWT_SECRET, so it separates the
# two values but not their fates: whoever holds one can compute the other. Only
# a genuinely independent secret gives the separation the design intends, and
# it costs one env var — so production either has one or does not start.
# See otp.otp_key() for what the fallback does and does not buy.
if settings.is_production and not settings.otp_hmac_key:
    raise RuntimeError("OTP_HMAC_KEY must be set in production")

# A secret that is present but short is worse than one that is missing: it
# passes the check above and then quietly under-protects every stored code.
# 32 bytes is the HMAC-SHA256 output length and what the generation command in
# .env.example produces, so this rejects guessable values without asking for
# anything the documented setup does not already give.
if settings.is_production and len(settings.otp_hmac_key.encode()) < OTP_HMAC_KEY_MIN_BYTES:
    raise RuntimeError(
        f"OTP_HMAC_KEY must be at least {OTP_HMAC_KEY_MIN_BYTES} bytes in production; "
        "generate one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
    )

# Codes in the log are codes in anyone's hands who can read the log.
if settings.is_production and settings.otp_debug_echo:
    raise RuntimeError("OTP_DEBUG_ECHO must be off in production")

if settings.telegram_mode not in {"webhook", "polling"}:
    raise RuntimeError("TELEGRAM_MODE must be webhook or polling")
if settings.is_production:
    for label, value in (("BOT_API_KEY", settings.bot_api_key),
                         ("BOT_ADMIN_KEY", settings.bot_admin_key),
                         ("BOT_ADMIN_SESSION_SECRET", settings.bot_admin_session_secret)):
        if value and len(value.encode()) < 32:
            raise RuntimeError(f"{label} must have at least 32 bytes")
    if settings.bot_admin_key and not settings.bot_admin_session_secret:
        raise RuntimeError("BOT_ADMIN_SESSION_SECRET required with BOT_ADMIN_KEY")

app = FastAPI(
    title="Go Vita API",
    version="0.1.0",
    description="Accounts and orders. The catalogue is served elsewhere — see docs/ARCHITECTURE.md.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(profile.router)
app.include_router(subscriptions.router)
app.include_router(marketing.router)
app.include_router(telegram_hook.router)
app.include_router(bot_admin.router)
app.include_router(bot_service.router)


@app.get("/health", tags=["ops"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
