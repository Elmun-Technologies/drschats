import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, orders, telegram_hook

logging.basicConfig(level=logging.INFO)

settings = get_settings()

if settings.is_production and settings.jwt_secret == "dev-only-change-me":
    # Fail at boot, not at the first forged token.
    raise RuntimeError("JWT_SECRET must be set in production")

# Codes in the log are codes in anyone's hands who can read the log.
if settings.is_production and settings.otp_debug_echo:
    raise RuntimeError("OTP_DEBUG_ECHO must be off in production")

app = FastAPI(
    title="Go Vita API",
    version="0.1.0",
    description="Accounts and orders. The catalogue is served elsewhere — see docs/ARCHITECTURE.md.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(telegram_hook.router)


@app.get("/health", tags=["ops"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
