import logging

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from app import telegram
from app.config import get_settings
from app.deps import CurrentUser, SessionDep
from app.models import Order, Subscription, TelegramLink, User
from app.otp import OtpError, consume_code, issue_code
from app.schemas import (
    OtpRequest,
    OtpRequestResponse,
    OtpVerifyRequest,
    TokenResponse,
    UserOut,
)
from app.security import create_access_token, normalise_phone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/otp/request", response_model=OtpRequestResponse)
async def request_otp(
    payload: OtpRequest, session: SessionDep
) -> OtpRequestResponse:
    """
    Ask for a sign-in code.

    Two outcomes, and the second is not an error. If the phone has a linked
    Telegram chat, a code goes out. If it does not, no channel can reach this
    person yet, so the answer is a deep link that starts the bot — a bot cannot
    message a phone number it has never spoken to.
    """
    settings = get_settings()
    phone = normalise_phone(payload.phone)

    if len(phone) < 9:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "invalid_phone")

    link = await session.scalar(select(TelegramLink).where(TelegramLink.phone == phone))

    if link is None:
        # Nothing is issued here on purpose: a code nobody can receive is just a
        # spent slot against this phone's hourly budget.
        return OtpRequestResponse(
            status="link_required",
            channel="telegram",
            telegramLink=telegram.deep_link(phone),
            expiresIn=0,
        )

    try:
        code = await issue_code(session, phone, channel="telegram")
    except OtpError as exc:
        await session.commit()
        # On the exception, not on the injected Response: raising discards
        # whatever was set there, and the client needs the wait to show a timer.
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            exc.reason,
            headers={"Retry-After": str(exc.retry_after)} if exc.retry_after else None,
        ) from exc

    delivered = await telegram.send_message(link.chat_id, telegram.code_message(code))

    if settings.otp_debug_echo and not settings.is_production:
        logger.warning("otp debug: phone=%s code=%s", phone, code)
        delivered = True

    # Commit either way: the code was issued, and pretending it wasn't would
    # let an unlimited retry loop past the hourly cap.
    await session.commit()

    if not delivered:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "delivery_failed")

    return OtpRequestResponse(
        status="sent",
        channel="telegram",
        telegramLink=None,
        expiresIn=settings.otp_ttl_seconds,
    )


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(payload: OtpVerifyRequest, session: SessionDep) -> TokenResponse:
    """
    Exchange a code for a token, creating the account on a first visit.

    There is no separate registration step. The phone is the identity and the
    code proves it, so signing up and signing in are the same request — which is
    also why nothing here asks for a name.
    """
    phone = normalise_phone(payload.phone)

    try:
        await consume_code(session, phone, payload.code)
    except OtpError as exc:
        await session.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, exc.reason) from exc

    user = await session.scalar(select(User).where(User.phone == phone))

    if user is None:
        user = User(phone=phone, name="")
        session.add(user)
        await session.flush()

    # Orders placed before this account existed belong to the same person; the
    # phone is the only link, and claiming them here is what makes "my orders"
    # useful on day one instead of empty.
    await session.execute(
        update(Order)
        .where(Order.user_id.is_(None), Order.customer_phone == phone)
        .values(user_id=user.id)
    )
    # Subscriptions started at checkout are claimed on the same evidence. Left
    # unclaimed they would keep delivering with nobody able to pause them, and
    # nobody to notify before each delivery.
    await session.execute(
        update(Subscription)
        .where(Subscription.user_id.is_(None), Subscription.customer_phone == phone)
        .values(user_id=user.id)
    )
    await session.commit()

    return TokenResponse(accessToken=create_access_token(user.id))


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> UserOut:
    return UserOut(id=user.id, name=user.name, phone=user.phone)
