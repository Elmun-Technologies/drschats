"""Shared bot domain operations. No storefront routes are replaced."""
from datetime import timedelta
from html import escape
import secrets

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.bot_models import BotConfig, BotJob, BotMember, BotTicket
from app.bot_schemas import ClubConfig, ContactIn
from app.models import Order, Subscription, TelegramLink, User, utcnow
from app.security import normalise_phone


async def club_config(session):
    record = await session.get(BotConfig, 1)
    return ClubConfig.model_validate(record.data if record else {})


async def linked_user(session, chat_id):
    link = await session.scalar(select(TelegramLink).where(TelegramLink.chat_id == chat_id))
    user = await session.scalar(select(User).where(User.phone == link.phone)) if link else None
    if user is None:
        raise HTTPException(404, 'customer_not_linked')
    return user


async def link_contact(session: AsyncSession, payload: ContactIn):
    from sqlalchemy.exc import IntegrityError
    from sqlalchemy import update
    if payload.contactUserId != payload.telegramUserId or payload.chatId != payload.telegramUserId:
        raise HTTPException(422, 'contact_not_own_private_chat')
    phone = normalise_phone(payload.phone)
    if len(phone) == 9:
        phone = '998' + phone
    if len(phone) != 12 or not phone.startswith('998'):
        raise HTTPException(422, 'invalid_phone')
    old = await session.scalar(select(TelegramLink).where(TelegramLink.phone == phone))
    chat_link = await session.scalar(select(TelegramLink).where(TelegramLink.chat_id == payload.chatId))
    if (old and old.chat_id != payload.chatId) or (chat_link and chat_link.phone != phone):
        session.add(BotTicket(chat_id=payload.chatId, category='club-conflict',
                              text='Telegram identity/phone conflict. Manual review required.'))
        await session.commit()
        raise HTTPException(409, 'identity_conflict')
    try:
        if old is None:
            old = TelegramLink(phone=phone, chat_id=payload.chatId, username=payload.username)
            session.add(old)
        else:
            old.username = payload.username
        user = await session.scalar(select(User).where(User.phone == phone))
        if user is None:
            user = User(phone=phone, name=payload.name)
            session.add(user)
        elif not user.name:
            user.name = payload.name
        await session.flush()
        for model in (Order, Subscription):
            await session.execute(update(model).where(
                model.user_id.is_(None), model.customer_phone == phone).values(user_id=user.id))
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(409, 'identity_conflict') from exc
    return user


def order_out(o):
    aliases = {'new': 'received', 'processing': 'confirmed', 'shipped': 'onway',
               'completed': 'delivered'}
    return {'code': o.public_id, 'status': o.status, 'stage': aliases.get(o.status, o.status),
            'createdAt': o.created_at, 'total': o.total, 'shipping': o.shipping,
            'delivery': {'region': o.region, 'address': o.address, 'method': o.delivery_method},
            'items': [{'productId': i.product_id, 'slug': i.slug, 'name': i.name,
                       'qty': i.quantity, 'unitPrice': i.unit_price} for i in o.items]}


async def enqueue(session, chat_id, text, *, kind='support', dedupe_key=None, buttons=None):
    key = dedupe_key or secrets.token_hex(32)
    old = await session.scalar(select(BotJob).where(BotJob.dedupe_key == key))
    if old:
        return old
    job = BotJob(chat_id=chat_id, kind=kind, dedupe_key=key,
                 payload={'text': text, 'buttons': buttons or []})
    session.add(job)
    await session.flush()
    return job


async def login_code(session, chat_id):
    # OTP uses the existing backend HMAC/verify flow. It is sent directly,
    # never saved in the outbox, returned in a service response or logged.
    from app import telegram
    from app.otp import issue_code, OtpError
    user = await linked_user(session, chat_id)
    try:
        code = await issue_code(session, user.phone, 'telegram')
    except OtpError as exc:
        raise HTTPException(429, exc.reason, headers={'Retry-After': str(exc.retry_after or 60)}) from exc
    await session.commit()
    if not await telegram.send_message(chat_id, telegram.code_message(code)):
        raise HTTPException(502, 'delivery_failed')
    return {'ok': True}
