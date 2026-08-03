"""
One-time sign-in codes.

The rules here are the whole security of the flow, because a six-digit code is
only 20 bits: guessing is cheap unless guessing is *limited*. So a code is
short-lived, single-use, capped at a handful of attempts, and rate-limited per
phone. Take any one of those away and the rest stop mattering.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models import OtpCode

CODE_LENGTH = 6


def generate_code() -> str:
    """A uniformly random six-digit code, zero-padded."""
    return f"{secrets.randbelow(10**CODE_LENGTH):0{CODE_LENGTH}d}"


def hash_code(phone: str, code: str) -> str:
    """
    HMAC rather than a bare hash, and salted with the phone.

    A bare SHA-256 of a six-digit code is a lookup table with a million rows —
    anyone with a copy of the table recovers every live code instantly. Keying
    it with the server secret means the stored value is worthless without that
    secret, and mixing in the phone stops one rainbow table covering everyone.
    """
    settings = get_settings()
    message = f"{phone}:{code}".encode()
    return hmac.new(settings.jwt_secret.encode(), message, hashlib.sha256).hexdigest()


def verify_code_hash(phone: str, code: str, code_hash: str) -> bool:
    return hmac.compare_digest(hash_code(phone, code), code_hash)


def as_utc(value: datetime) -> datetime:
    """
    Timestamps read back from the database, made comparable.

    Postgres returns aware datetimes and SQLite returns naive ones, so anything
    that subtracts one from `now` has to go through here or it raises on the
    test database and works in production — the worst way round.
    """
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


class OtpError(Exception):
    """Something the caller should turn into a 4xx, with a stable reason code."""

    def __init__(self, reason: str, retry_after: int | None = None) -> None:
        super().__init__(reason)
        self.reason = reason
        self.retry_after = retry_after


async def recent_codes(session: AsyncSession, phone: str, since: datetime) -> list[OtpCode]:
    result = await session.scalars(
        select(OtpCode).where(OtpCode.phone == phone, OtpCode.created_at >= since)
    )
    return list(result)


async def issue_code(session: AsyncSession, phone: str, channel: str) -> str:
    """
    Create a code for this phone, enforcing the cooldown and the hourly cap.

    Returns the plaintext code, which exists only long enough to be delivered —
    it is never returned to the caller of the API and never written down.
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)

    window_start = now - timedelta(hours=1)
    recent = await recent_codes(session, phone, window_start)

    if len(recent) >= settings.otp_max_per_hour:
        oldest = min(as_utc(c.created_at) for c in recent)
        retry_after = int((oldest + timedelta(hours=1) - now).total_seconds())
        raise OtpError("too_many_requests", max(retry_after, 1))

    if recent:
        newest = max(as_utc(c.created_at) for c in recent)
        elapsed = (now - newest).total_seconds()
        if elapsed < settings.otp_resend_cooldown_seconds:
            raise OtpError("cooldown", int(settings.otp_resend_cooldown_seconds - elapsed) + 1)

    # A new code retires the previous one. Two live codes would double an
    # attacker's chances for no gain to the customer.
    for previous in recent:
        if previous.consumed_at is None:
            previous.consumed_at = now

    code = generate_code()
    session.add(
        OtpCode(
            phone=phone,
            code_hash=hash_code(phone, code),
            channel=channel,
            expires_at=now + timedelta(seconds=settings.otp_ttl_seconds),
        )
    )
    await session.flush()
    return code


async def consume_code(session: AsyncSession, phone: str, code: str) -> None:
    """
    Check a submitted code and burn it. Raises OtpError on any failure.

    Every failure path says the same thing to the caller. Distinguishing
    "expired" from "wrong" would confirm that a code was issued for that phone,
    which is a free oracle for anyone probing numbers.
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)

    record = await session.scalar(
        select(OtpCode)
        .where(OtpCode.phone == phone, OtpCode.consumed_at.is_(None))
        .order_by(OtpCode.created_at.desc())
        .limit(1)
    )

    if record is None:
        raise OtpError("invalid_code")

    if as_utc(record.expires_at) <= now:
        record.consumed_at = now
        await session.flush()
        raise OtpError("invalid_code")

    if record.attempts >= settings.otp_max_attempts:
        record.consumed_at = now
        await session.flush()
        raise OtpError("invalid_code")

    if not verify_code_hash(phone, code, record.code_hash):
        record.attempts += 1
        # Burn the code on the last allowed miss rather than leaving one guess
        # on the table for the next request.
        if record.attempts >= settings.otp_max_attempts:
            record.consumed_at = now
        await session.flush()
        raise OtpError("invalid_code")

    record.consumed_at = now
    await session.flush()
