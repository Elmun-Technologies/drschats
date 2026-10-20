"""Settings an admin writes in /admin/bot, applied without restarting the bot.

The panel owns the Mini App address, the club name, the support phone and the
working hours. The bot used to copy them once, at startup: an admin who
changed the shop address had to restart the process, and the support phone
and hours never reached the bot at all — «Yordam» kept printing the values
compiled into it. `refresh()` re-reads `GET /config` at most once every few
minutes (the outbox loop, which already ticks, calls it) and copies the values
onto `cfg`. A failed fetch keeps the last good ones: a flaky site must not
blank a customer-facing phone number.
"""
import logging
import time

from .config import cfg

log = logging.getLogger("govita.settings")

DEFAULT_MAX_AGE_S = 300.0
_last_read = 0.0

#: Panel field → attribute on `cfg`.
FIELDS = {
    "shopUrl": "shop_url",
    "clubName": "club_name",
    "supportPhone": "operator_phone",
    "supportHours": "support_hours",
}

#: The menu switches are booleans, not text, so they travel separately.
MENU_KEY = "menu"
MENU_BUTTONS = ("miniApp", "catalog", "search", "cart", "orders", "promo", "help")


def apply(settings: dict) -> set[str]:
    """Copy the panel's values onto `cfg`; return the names that changed.

    Blanks and non-strings are ignored: an admin who clears a field gets the
    previous value rather than an empty link in a customer's menu.
    """
    changed: set[str] = set()
    if not isinstance(settings, dict):
        return changed
    for key, attr in FIELDS.items():
        value = settings.get(key)
        if not isinstance(value, str):
            continue
        value = value.strip()
        if attr == "shop_url":
            value = value.rstrip("/")
        if not value:
            continue
        if getattr(cfg, attr, None) != value:
            setattr(cfg, attr, value)
            changed.add(attr)
    menu = settings.get(MENU_KEY)
    if isinstance(menu, dict):
        # A switch the panel did not send keeps its current value: a partial
        # payload (an older panel) must not blank the rest of the menu.
        merged = dict(getattr(cfg, "menu", None) or {})
        for key in MENU_BUTTONS:
            if isinstance(menu.get(key), bool):
                merged[key] = menu[key]
        if merged != getattr(cfg, "menu", None):
            setattr(cfg, "menu", merged)
            changed.add("menu")
    return changed


async def refresh(api, max_age: float = DEFAULT_MAX_AGE_S, now: float | None = None) -> set[str]:
    """Re-read the panel's settings if the cached copy is older than `max_age`.

    Returns the attributes that changed (empty when nothing was due, when the
    fetch failed, or when the values are the same). Never raises.
    """
    global _last_read
    clock = time.monotonic() if now is None else now
    if _last_read and clock - _last_read < max_age:
        return set()
    _last_read = clock
    try:
        settings = await api.request("GET", "/config")
    except Exception as e:  # noqa: BLE001 — keep the last known good settings
        log.warning("config unavailable, keeping the last known settings: %s", type(e).__name__)
        return set()
    return apply(settings or {})


def reset() -> None:
    """Forget the cache (tests, and a re-login that must re-read at once)."""
    global _last_read
    _last_read = 0.0
