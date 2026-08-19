"""
Sign-in by phone and a Telegram code.

Most of these test the limits rather than the happy path: a six-digit code is
only 20 bits, so what keeps it safe is the expiry, the attempt cap and the
per-phone rate limit. A suite that only proved "the right code works" would
pass just as happily against a version with none of them.
"""

import pytest
from sqlalchemy import select

from app.models import OtpCode, TelegramLink

pytestmark = pytest.mark.asyncio

PHONE = "998901234567"
CHAT_ID = 555000111


async def link_phone(db, phone: str = PHONE, chat_id: int = CHAT_ID) -> None:
    """Pretend the customer has already started the bot and shared their contact."""
    db.add(TelegramLink(phone=phone, chat_id=chat_id))
    await db.commit()


async def last_code_for(db, phone: str = PHONE) -> OtpCode | None:
    return await db.scalar(
        select(OtpCode).where(OtpCode.phone == phone).order_by(OtpCode.created_at.desc())
    )


async def request_code(client, phone: str = PHONE):
    return await client.post("/api/v1/auth/otp/request", json={"phone": phone})


async def test_unlinked_phone_gets_a_deep_link_not_a_code(client, db):
    """
    A bot cannot message a phone it has never spoken to, so this is the honest
    answer rather than a silent failure — and no code is burned.
    """
    res = await request_code(client)
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "link_required"
    assert body["expiresIn"] == 0
    assert await last_code_for(db) is None


async def test_linked_phone_receives_a_code_and_can_sign_in(client, db, telegram_stub):
    await link_phone(db)

    res = await request_code(client)
    assert res.status_code == 200
    assert res.json()["status"] == "sent"

    verify = await client.post(
        "/api/v1/auth/otp/verify", json={"phone": PHONE, "code": telegram_stub.last_code}
    )
    assert verify.status_code == 200

    token = verify.json()["accessToken"]
    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["phone"] == PHONE


async def test_the_same_code_cannot_be_used_twice(client, db, telegram_stub):
    await link_phone(db)
    await request_code(client)
    code = telegram_stub.last_code

    first = await client.post("/api/v1/auth/otp/verify", json={"phone": PHONE, "code": code})
    assert first.status_code == 200

    second = await client.post("/api/v1/auth/otp/verify", json={"phone": PHONE, "code": code})
    assert second.status_code == 401


async def test_wrong_code_is_rejected_and_counted(client, db, telegram_stub):
    await link_phone(db)
    await request_code(client)

    bad = await client.post("/api/v1/auth/otp/verify", json={"phone": PHONE, "code": "000000"})
    assert bad.status_code == 401

    record = await last_code_for(db)
    assert record.attempts == 1


async def test_code_dies_after_the_attempt_cap(client, db, telegram_stub):
    """Guessing must be bounded, or twenty bits is not a secret at all."""
    await link_phone(db)
    await request_code(client)
    code = telegram_stub.last_code

    for _ in range(5):
        await client.post("/api/v1/auth/otp/verify", json={"phone": PHONE, "code": "000000"})

    # Even the genuine code is dead once the budget is spent.
    res = await client.post("/api/v1/auth/otp/verify", json={"phone": PHONE, "code": code})
    assert res.status_code == 401


async def test_expired_code_is_rejected(client, db, telegram_stub, monkeypatch):
    from app.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "otp_ttl_seconds", -1)

    await link_phone(db)
    await request_code(client)

    res = await client.post(
        "/api/v1/auth/otp/verify", json={"phone": PHONE, "code": telegram_stub.last_code}
    )
    assert res.status_code == 401


async def test_resend_is_rate_limited(client, db, telegram_stub):
    await link_phone(db)
    first = await request_code(client)
    assert first.status_code == 200

    again = await request_code(client)
    assert again.status_code == 429
    assert "Retry-After" in again.headers


async def test_a_new_code_retires_the_previous_one(client, db, telegram_stub, monkeypatch):
    from app.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "otp_resend_cooldown_seconds", 0)

    await link_phone(db)
    await request_code(client)
    stale = telegram_stub.last_code

    await request_code(client)
    fresh = telegram_stub.last_code
    assert stale != fresh

    old = await client.post("/api/v1/auth/otp/verify", json={"phone": PHONE, "code": stale})
    assert old.status_code == 401

    new = await client.post("/api/v1/auth/otp/verify", json={"phone": PHONE, "code": fresh})
    assert new.status_code == 200


async def test_phone_is_normalised_across_the_flow(client, db, telegram_stub):
    """+998 90 123 45 67 and 998901234567 are one person, not two accounts."""
    await link_phone(db)
    await request_code(client, "+998 90 123 45 67")

    res = await client.post(
        "/api/v1/auth/otp/verify",
        json={"phone": "+998 (90) 123-45-67", "code": telegram_stub.last_code},
    )
    assert res.status_code == 200


async def test_short_phone_is_refused(client):
    res = await request_code(client, "12345")
    assert res.status_code == 422
