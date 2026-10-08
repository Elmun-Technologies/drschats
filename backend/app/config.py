from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# Shortest OTP_HMAC_KEY accepted in production, in bytes. Chosen as the
# HMAC-SHA256 output length: shorter keys are accepted by HMAC but contribute
# less than the construction can use, and `secrets.token_urlsafe(32)` — the
# command .env.example tells you to run — produces 43 characters, so this
# rejects weak values without demanding anything unusual.
OTP_HMAC_KEY_MIN_BYTES = 32


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://govita:govita_dev@localhost:5432/govita"

    # Signing key for access tokens. The default exists so `docker compose up`
    # works with no configuration; production must override it, and main.py
    # refuses to start if it has not.
    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 60 * 24 * 30

    environment: str = "development"

    # Shared secret for the storefront's server-to-server marketing calls
    # (writing consent, reading the send queue). Empty means those endpoints
    # refuse everything, which is the right default for a service that can
    # email real people.
    marketing_api_key: str = ""

    # Separate privileges: bot service never receives the admin login secret.
    bot_api_key: str = ""
    bot_admin_key: str = ""
    bot_admin_session_secret: str = ""
    telegram_mode: str = "webhook"  # polling: external aiogram is the sole update engine

    # How far ahead a birthday reminder goes out. A greeting is worth little on
    # the day itself if the customer wanted to order something for it.
    birthday_lead_days: int = 7
    # How far ahead a subscription delivery is announced, so it can still be
    # skipped or re-timed.
    subscription_notice_days: int = 3

    # Key used to hash sign-in codes. Deliberately not `jwt_secret`.
    #
    # The two protect different things with very different blast radii:
    # jwt_secret signs a bearer token that stays valid for 30 days, this one
    # keys a code that dies in 5 minutes. Sharing the key means a single leak
    # breaks both systems, and jwt_secret is the one that travels furthest
    # because every authenticated request touches it.
    #
    # Empty falls back to a key *derived* from jwt_secret (see otp._otp_key),
    # which keeps `docker compose up` working with no configuration. Derivation
    # separates the two values but not their fates — whoever holds one can
    # compute the other — so main.py refuses to boot in production while this
    # is empty, exactly as it refuses the placeholder JWT_SECRET.
    otp_hmac_key: str = ""

    # Sign-in codes. A six-digit code is only 20 bits, so its safety is these
    # numbers rather than its length: short life, few guesses, hard cap per hour.
    otp_ttl_seconds: int = 300
    otp_max_attempts: int = 5
    otp_resend_cooldown_seconds: int = 60
    otp_max_per_hour: int = 5

    # Telegram delivers the codes. Without a token and username the API still
    # runs and still issues codes — it just reports that no channel could
    # deliver them, which is what a misconfigured deployment should say rather
    # than silently accepting sign-ins nobody can complete.
    telegram_bot_token: str = ""
    telegram_bot_username: str = ""
    # Telegram echoes this back in X-Telegram-Bot-Api-Secret-Token, and it is
    # the only thing separating the webhook from anyone who guesses its URL.
    telegram_webhook_secret: str = ""

    # Development escape hatch: log codes instead of delivering them, so the
    # flow can be exercised without a bot. Refused in production by main.py.
    otp_debug_echo: bool = False

    # Browsers call this API directly from the storefront origin.
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
