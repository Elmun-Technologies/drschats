"""
The bot webhook.

Its job is to turn "someone shared a contact" into "this phone can be reached
at this chat", and the interesting cases are the ones where it must refuse:
an unauthenticated caller, and a contact card belonging to somebody else.
"""

import pytest
from sqlalchemy import select

from app.config import get_settings
from app.models import TelegramLink

pytestmark = pytest.mark.asyncio

WEBHOOK = "/api/v1/telegram/webhook"
SECRET = "test-webhook-secret"
CHAT_ID = 4242
SENDER_ID = 777
PHONE = "+998 90 123 45 67"
NORMALISED = "998901234567"


@pytest.fixture(autouse=True)
def _webhook_secret(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "telegram_webhook_secret", SECRET)
    monkeypatch.setattr(settings, "telegram_bot_token", "test-token")
    monkeypatch.setattr(settings, "telegram_bot_username", "govita_test_bot")


def contact_update(user_id: int = SENDER_ID, phone: str = PHONE) -> dict:
    return {
        "message": {
            "chat": {"id": CHAT_ID},
            "from": {"id": SENDER_ID, "username": "aziz"},
            "contact": {"phone_number": phone, "user_id": user_id},
        }
    }


async def post(client, body: dict, secret: str | None = SECRET):
    headers = {"X-Telegram-Bot-Api-Secret-Token": secret} if secret else {}
    return await client.post(WEBHOOK, json=body, headers=headers)


async def test_webhook_refuses_without_the_shared_secret(client):
    """The URL is the only thing hiding this endpoint; the secret is the lock."""
    res = await post(client, contact_update(), secret=None)
    assert res.status_code == 401

    wrong = await post(client, contact_update(), secret="not-it")
    assert wrong.status_code == 401


async def test_sharing_your_own_contact_links_the_phone(client, db, telegram_stub):
    res = await post(client, contact_update())
    assert res.status_code == 200

    link = await db.scalar(select(TelegramLink).where(TelegramLink.phone == NORMALISED))
    assert link is not None
    assert link.chat_id == CHAT_ID

    # They came to sign in, so the code follows immediately.
    assert telegram_stub.last_code


async def test_a_forwarded_contact_is_refused(client, db, telegram_stub):
    """
    Telegram only vouches for a contact whose user_id is the sender's. Binding
    a forwarded card would hand someone else's sign-in codes to this chat.
    """
    res = await post(client, contact_update(user_id=SENDER_ID + 1))
    assert res.status_code == 200

    link = await db.scalar(select(TelegramLink).where(TelegramLink.phone == NORMALISED))
    assert link is None


async def test_relinking_moves_the_phone_to_the_new_chat(client, db, telegram_stub):
    await post(client, contact_update())

    moved = {
        "message": {
            "chat": {"id": CHAT_ID + 1},
            "from": {"id": SENDER_ID, "username": "aziz"},
            "contact": {"phone_number": PHONE, "user_id": SENDER_ID},
        }
    }
    await post(client, moved)

    links = list(await db.scalars(select(TelegramLink).where(TelegramLink.phone == NORMALISED)))
    assert len(links) == 1
    assert links[0].chat_id == CHAT_ID + 1


async def test_start_asks_for_the_contact_rather_than_linking(client, db, telegram_stub):
    res = await post(
        client,
        {"message": {"chat": {"id": CHAT_ID}, "from": {"id": SENDER_ID}, "text": "/start abc.def"}},
    )
    assert res.status_code == 200

    link = await db.scalar(select(TelegramLink).where(TelegramLink.phone == NORMALISED))
    assert link is None


async def test_updates_without_a_chat_are_ignored(client):
    res = await post(client, {"edited_message": {}})
    assert res.status_code == 200
