"""Sof biznes-logika (Telegramsiz, test qilinadi)."""
from __future__ import annotations

import hashlib
import re
import secrets
from datetime import date, datetime, timedelta

PAYLOAD_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
MONTHS_UZ = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul",
             "avgust", "sentabr", "oktabr", "noyabr", "dekabr"]

STAGES = ["received", "confirmed", "onway", "delivered"]
STAGE_LABEL = {"received": "Qabul qilindi", "confirmed": "Tasdiqlandi",
               "onway": "Yoʻlda", "delivered": "Yetkazildi",
               "failed": "Yetkazilmadi", "cancelled": "Bekor qilindi",
               "returned": "Qaytarildi"}
STAGE_SHORT = {"received": "Qabul qilindi", "confirmed": "Tasdiqlandi",
               "onway": "Yoʻlda", "delivered": "Yetkazildi",
               "failed": "Yetkazilmadi", "cancelled": "Bekor", "returned": "Qaytarildi"}


def parse_payload(text: str | None) -> tuple[str, str] | None:
    """`/start <payload>` → (tur, qiymat). Notoʻgʻri boʻlsa None."""
    if not text:
        return None
    parts = text.split(maxsplit=1)
    if len(parts) < 2:
        return None
    p = parts[1].strip()
    if not PAYLOAD_RE.match(p):
        return None
    if p in ("login", "club"):
        return p, ""
    for pre in ("o_", "r_", "s_", "sub_"):
        if p.startswith(pre) and len(p) > len(pre):
            return pre[:-1], p[len(pre):]
    return None


def canonical_phone(raw: str) -> str:
    d = re.sub(r"\D", "", raw or "")
    if len(d) == 9:
        d = "998" + d
    return "+" + d if d else ""


def fmt_phone(p: str) -> str:
    d = re.sub(r"\D", "", p)
    if len(d) == 12 and d.startswith("998"):
        return f"+998 {d[3:5]} {d[5:8]} {d[8:10]} {d[10:12]}"
    return p


def mask_phone(p: str) -> str:
    d = re.sub(r"\D", "", p)
    return f"+{d[:5]}***{d[-2:]}" if len(d) >= 7 else "***"


def som(n: int | float) -> str:
    return f"{int(round(n)):,}".replace(",", " ") + " soʻm"


def fmt_day(d: date) -> str:
    return f"{d.day} {MONTHS_UZ[d.month - 1]}"


def contact_is_own(contact_user_id: int | None, from_id: int) -> bool:
    return contact_user_id is not None and contact_user_id == from_id


def course_days(servings_per_pack: int | None, qty: int, servings_per_day: float | None) -> int | None:
    if not servings_per_pack or not servings_per_day or servings_per_day <= 0:
        return None
    return int(servings_per_pack * qty // servings_per_day)


def course_end(start: date, days: int) -> date:
    return start + timedelta(days=days)


def stage_changed(old: str | None, new: str) -> bool:
    return old != new


def sub_price(price: int, pct: int) -> int:
    return int(round(price * (100 - pct) / 100))


def best_discount(*pcts: int) -> int:
    """Chegirmalar qoʻshilmaydi — eng kattasi."""
    return max([p for p in pcts if p] or [0])


def gen_code() -> str:
    return f"{secrets.randbelow(10**6):06d}"


def hash_code(code: str, phone: str, pepper: str) -> str:
    return hashlib.sha256(f"{code}|govita|{phone}|{pepper}".encode()).hexdigest()


def in_quiet_hours(now_local: datetime, start: int = 10, end: int = 20) -> bool:
    return not (start <= now_local.hour < end)


def slot_key(d: date, hhmm: str) -> str:
    return f"{d.isoformat()}T{hhmm}"


def cb_ok(data: str) -> bool:
    return len(data.encode()) <= 64
