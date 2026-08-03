"""
Telegram delivery for sign-in codes.

The constraint that shapes this whole flow: **a bot cannot start a conversation
with a phone number.** It can only reply inside a chat the person has already
opened with it. So a code can be delivered over Telegram only to someone who
has previously pressed Start and shared their contact — and until they have,
the API has to say so rather than pretend a message went out.

That is why /auth/otp/request has two possible answers: "sent" for a linked
phone, and "link the bot first, here is the deep link" for everyone else.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import logging
import time

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

API_BASE = "https://api.telegram.org"

# Telegram caps the /start payload at 64 characters and allows only
# [A-Za-z0-9_-], which is exactly base64url without padding.
START_PAYLOAD_TTL_SECONDS = 15 * 60


def _sign(value: str) -> str:
    settings = get_settings()
    digest = hmac.new(settings.jwt_secret.encode(), value.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")[:16]


def build_start_payload(phone: str) -> str:
    """
    A signed, self-contained token identifying the phone that asked to link.

    Stateless on purpose: the link step is idempotent — re-running it binds the
    same phone to the same chat — so there is nothing to gain from a
    single-use row in the database, and one less table to keep clean.
    """
    issued = int(time.time())
    body = base64.urlsafe_b64encode(f"{phone}:{issued}".encode()).decode().rstrip("=")
    return f"{body}.{_sign(body)}"


def parse_start_payload(payload: str) -> str | None:
    """Return the phone a start payload was issued for, or None if it doesn't hold up."""
    try:
        body, signature = payload.split(".", 1)
    except ValueError:
        return None

    if not hmac.compare_digest(_sign(body), signature):
        return None

    try:
        padded = body + "=" * (-len(body) % 4)
        phone, issued = base64.urlsafe_b64decode(padded).decode().split(":", 1)
    except (ValueError, UnicodeDecodeError):
        return None

    if not issued.isdigit() or time.time() - int(issued) > START_PAYLOAD_TTL_SECONDS:
        return None

    return phone


def deep_link(phone: str) -> str | None:
    """The t.me URL that opens the bot already carrying this phone's token."""
    settings = get_settings()
    if not settings.telegram_bot_username:
        return None
    return f"https://t.me/{settings.telegram_bot_username}?start={build_start_payload(phone)}"


def is_configured() -> bool:
    settings = get_settings()
    return bool(settings.telegram_bot_token and settings.telegram_bot_username)


async def send_message(chat_id: int, text: str) -> bool:
    """
    Send a message, reporting whether it actually went out.

    Returns a bool instead of raising because a delivery failure is a normal
    outcome the caller has to route around — the customer blocked the bot, or
    deleted the chat — not an exception.
    """
    settings = get_settings()
    if not settings.telegram_bot_token:
        logger.warning("telegram: no bot token configured, message not sent")
        return False

    url = f"{API_BASE}/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                url,
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            )
        if response.status_code != 200:
            logger.warning("telegram: sendMessage %s -> %s", chat_id, response.status_code)
            return False
        return True
    except httpx.HTTPError as exc:
        logger.warning("telegram: sendMessage failed: %s", exc)
        return False


async def request_contact(chat_id: int, prompt: str, button: str) -> bool:
    """
    Ask for the contact card, which is the only way to learn someone's phone.

    A typed-in number would prove nothing — Telegram vouches for the number on
    a shared contact, and that vouching is what lets the code be trusted.
    """
    settings = get_settings()
    if not settings.telegram_bot_token:
        return False

    url = f"{API_BASE}/bot{settings.telegram_bot_token}/sendMessage"
    keyboard = {
        "keyboard": [[{"text": button, "request_contact": True}]],
        "resize_keyboard": True,
        "one_time_keyboard": True,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                url,
                json={"chat_id": chat_id, "text": prompt, "reply_markup": keyboard},
            )
        return response.status_code == 200
    except httpx.HTTPError as exc:
        logger.warning("telegram: request_contact failed: %s", exc)
        return False


def code_message(code: str) -> str:
    return (
        f"<b>{code}</b> — Go Vita kirish kodi\n"
        f"Kod 5 daqiqa amal qiladi. Uni hech kimga bermang.\n\n"
        f"<b>{code}</b> — код входа Go Vita\n"
        f"Код действует 5 минут. Никому его не сообщайте."
    )
