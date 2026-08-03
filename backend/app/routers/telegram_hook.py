"""
The bot's side of the sign-in flow.

Three updates matter and everything else is ignored:
  /start <payload>  — someone arrived from the site; ask for their contact
  a shared contact  — bind phone to chat, then send the code they came for
  anything else     — a short explanation of what this bot is for
"""

import logging

from fastapi import APIRouter, Header, HTTPException, Request, status
from sqlalchemy import select

from app import telegram
from app.config import get_settings
from app.deps import SessionDep
from app.models import TelegramLink
from app.otp import OtpError, issue_code
from app.security import normalise_phone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/telegram", tags=["telegram"])

PROMPT = (
    "Kirish uchun telefon raqamingizni ulashing — kod shu yerga keladi.\n"
    "Поделитесь номером телефона — код придёт сюда."
)
CONTACT_BUTTON = "📱 Raqamni ulashish / Поделиться номером"
NOT_YOURS = (
    "Faqat o'z raqamingizni ulashishingiz mumkin.\n"
    "Можно поделиться только своим номером."
)
HELP = (
    "Bu bot Go Vita saytiga kirish kodini yuboradi.\n"
    "Kod olish uchun saytdan «Telegram orqali kirish» tugmasini bosing.\n\n"
    "Этот бот присылает код для входа на сайт Go Vita.\n"
    "Чтобы получить код, нажмите «Войти через Telegram» на сайте."
)


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def webhook(
    request: Request,
    session: SessionDep,
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
) -> dict[str, bool]:
    settings = get_settings()

    # The URL is the only thing hiding this endpoint, so without the shared
    # secret anyone who guesses it could bind arbitrary phones to their own
    # chat and receive other people's codes. Refuse rather than run unguarded.
    if not settings.telegram_webhook_secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "webhook_not_configured")
    if x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "bad_secret")

    update = await request.json()
    message = update.get("message") or {}
    chat_id = (message.get("chat") or {}).get("id")
    if not chat_id:
        return {"ok": True}

    contact = message.get("contact")
    if contact:
        await _handle_contact(session, chat_id, contact, message.get("from") or {})
        return {"ok": True}

    text = (message.get("text") or "").strip()
    if text.startswith("/start"):
        await telegram.request_contact(chat_id, PROMPT, CONTACT_BUTTON)
        return {"ok": True}

    await telegram.send_message(chat_id, HELP)
    return {"ok": True}


async def _handle_contact(
    session: SessionDep, chat_id: int, contact: dict, sender: dict
) -> None:
    # Telegram vouches for a contact only when user_id matches the sender.
    # A forwarded card carries someone else's number, and binding it would let
    # anyone receive codes for a phone they do not own.
    if contact.get("user_id") != sender.get("id"):
        await telegram.send_message(chat_id, NOT_YOURS)
        return

    phone = normalise_phone(contact.get("phone_number") or "")
    if len(phone) < 9:
        return

    link = await session.scalar(select(TelegramLink).where(TelegramLink.phone == phone))
    if link is None:
        # A chat can only vouch for one phone; rebinding it releases the old one.
        stale = await session.scalar(select(TelegramLink).where(TelegramLink.chat_id == chat_id))
        if stale is not None:
            await session.delete(stale)
            await session.flush()
        link = TelegramLink(phone=phone, chat_id=chat_id, username=sender.get("username"))
        session.add(link)
    else:
        link.chat_id = chat_id
        link.username = sender.get("username")

    await session.flush()

    # They came here to sign in, so send the code now rather than making them
    # go back to the site and ask again.
    try:
        code = await issue_code(session, phone, channel="telegram")
    except OtpError:
        await session.commit()
        return

    await session.commit()
    await telegram.send_message(chat_id, telegram.code_message(code))
