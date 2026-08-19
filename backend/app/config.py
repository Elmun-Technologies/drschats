from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # How far ahead a birthday reminder goes out. A greeting is worth little on
    # the day itself if the customer wanted to order something for it.
    birthday_lead_days: int = 7
    # How far ahead a subscription delivery is announced, so it can still be
    # skipped or re-timed.
    subscription_notice_days: int = 3

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
