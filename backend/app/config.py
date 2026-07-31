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
