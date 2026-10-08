import os
from dataclasses import dataclass, field


def _env(k, d=""):
    return os.getenv(k, d)


@dataclass
class Config:
    bot_token: str = field(default_factory=lambda: _env("BOT_TOKEN"))
    club_name: str = field(default_factory=lambda: _env("CLUB_NAME", "GoVita VIP Salomatlik Klubi"))
    store_name: str = field(default_factory=lambda: _env("STORE_NAME", "GoVita"))
    shop_url: str = field(default_factory=lambda: _env("SHOP_URL", "https://govita.uz"))
    operator_phone: str = field(default_factory=lambda: _env("OPERATOR_PHONE", "+998 71 200 70 80"))
    support_hours: str = field(default_factory=lambda: _env("SUPPORT_HOURS", "Dushanba–Shanba, 09:00–18:00"))
    operator_chat_id: str = field(default_factory=lambda: _env("OPERATOR_CHAT_ID"))
    tz_offset: int = field(default_factory=lambda: int(_env("TIMEZONE_OFFSET", "5")))
    db_path: str = field(default_factory=lambda: _env("DB_PATH", "govita_bot.sqlite3"))
    pepper: str = field(default_factory=lambda: _env("CLUB_CODE_PEPPER", "dev-pepper"))
    sub_first_pct: int = field(default_factory=lambda: int(_env("SUB_FIRST_PCT", "10")))
    sub_next_pct: int = field(default_factory=lambda: int(_env("SUB_NEXT_PCT", "15")))
    course_lead_days: int = field(default_factory=lambda: int(_env("COURSE_END_LEAD_DAYS", "5")))
    free_delivery_from: int = 300_000


cfg = Config()
