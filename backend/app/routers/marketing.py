from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter
from sqlalchemy import or_, select, update

from app.config import get_settings
from app.deps import ServiceCaller, SessionDep
from app.models import (
    EmailSubscriber,
    MarketingMessage,
    Order,
    OrderItem,
    Subscription,
    TelegramLink,
    User,
)
from app.routers.orders import PUBLIC_ID_OFFSET
from app.schemas import (
    DueMessageOut,
    SentReport,
    SubscriberIn,
    SubscriptionRunOut,
    VerifyEmailIn,
)

router = APIRouter(prefix="/api/v1/marketing", tags=["marketing"])

"""
Who is due a message today.

This service decides; the storefront delivers. That split is on purpose — the
birthdays, the household, the subscriptions and the log of what has already
gone out all live here, and they are the only things that can answer "is this
person due something, and have they had it already". The templates, the mail
provider and the Telegram token live in the storefront, which is deployed.

Three rules hold for everything below:

- consent is checked here, not at the sender. A row only enters the queue if
  the person said yes and, for email, confirmed the address;
- every queued row carries a `reminder_id` that is unique to its occurrence, so
  running the cron twice cannot send the same greeting twice;
- a failed send is recorded as failed rather than deleted, so a permanently
  broken address is visible instead of silently retried every night.
"""

# Most packs on the shelf are a 30-day course.
COURSE_DAYS = 30
REORDER_LEAD_DAYS = 5
REORDER_WINDOW_DAYS = 120

# The weeks before the school year, which starts on 2 September here.
SCHOOL_SEASON = ((8, 10), (9, 10))
SCHOOL_MIN_AGE = 5
SCHOOL_MAX_AGE = 17


def _parse_birthday(value: str | None) -> tuple[int, int, int | None] | None:
    """Accepts `YYYY-MM-DD` and `MM-DD`. Returns (month, day, year|None)."""
    if not value:
        return None
    parts = value.split("-")
    try:
        if len(parts) == 3:
            year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
        elif len(parts) == 2:
            year, month, day = None, int(parts[0]), int(parts[1])
        else:
            return None
    except ValueError:
        return None
    if not (1 <= month <= 12 and 1 <= day <= 31):
        return None
    return month, day, year


def _next_anniversary(month: int, day: int, today: date) -> tuple[int, int] | None:
    """Days until the next occurrence, and the year it falls in."""
    try:
        this_year = date(today.year, month, day)
    except ValueError:
        # 29 February in a common year: the greeting waits for a year that has
        # the date rather than guessing at the 28th or the 1st.
        return None
    if this_year >= today:
        return (this_year - today).days, today.year
    try:
        next_year = date(today.year + 1, month, day)
    except ValueError:
        return None
    return (next_year - today).days, today.year + 1


def _age_on(birthday: str | None, today: date) -> int | None:
    parsed = _parse_birthday(birthday)
    if not parsed or parsed[2] is None:
        return None
    month, day, year = parsed
    age = today.year - year - ((today.month, today.day) < (month, day))
    return age if age >= 0 else None


def _in_school_season(today: date) -> bool:
    (start_month, start_day), (end_month, end_day) = SCHOOL_SEASON
    return (start_month, start_day) <= (today.month, today.day) <= (end_month, end_day)


def _channels(user: User, telegram_chats: dict[str, int]) -> list[tuple[str, dict]]:
    """
    The channels this user has actually agreed to.

    Email needs both consent *and* a verified address: an unverified address is
    a claim, and sending marketing to a claim is how a domain gets blocked.

    Telegram needs a linked chat, which only exists because the customer
    started the bot during sign-in — a bot cannot message a phone number it has
    never spoken to.
    """
    out: list[tuple[str, dict]] = []
    if user.marketing_email and user.email and user.email_verified_at is not None:
        out.append(("email", {"email": user.email}))
    chat_id = telegram_chats.get(user.phone)
    if user.marketing_telegram and chat_id is not None:
        out.append(("telegram", {"telegramChatId": str(chat_id)}))
    return out


@router.post("/subscribers", status_code=204)
async def upsert_subscriber(
    payload: SubscriberIn, session: SessionDep, _: ServiceCaller
) -> None:
    """Called when a double opt-in is confirmed, or an unsubscribe is clicked."""
    now = datetime.now(timezone.utc)
    email = payload.email.lower()

    subscriber = await session.scalar(
        select(EmailSubscriber).where(EmailSubscriber.email == email)
    )
    if subscriber is None:
        subscriber = EmailSubscriber(email=email, locale=payload.locale)
        session.add(subscriber)

    subscriber.status = payload.status
    subscriber.locale = payload.locale
    if payload.name:
        subscriber.name = payload.name
    if payload.status == "confirmed":
        subscriber.confirmed_at = now
        subscriber.unsubscribed_at = None
    else:
        subscriber.unsubscribed_at = now

    # An unsubscribe from the list is an unsubscribe everywhere. A customer who
    # clicks the link in a birthday email has not asked to keep getting the
    # other five kinds.
    await session.execute(
        update(User)
        .where(User.email == email)
        .values(
            marketing_email=payload.status == "confirmed",
            consent_updated_at=now,
        )
    )

    await session.commit()


@router.post("/verify-email", status_code=204)
async def verify_email(
    payload: VerifyEmailIn, session: SessionDep, _: ServiceCaller
) -> None:
    """
    The click on the confirmation link.

    The link is signed with both the account and the address, so clicking it
    proves the pair — which means this is also where the address gets *attached*
    to the account, not only stamped as verified. Requiring it to have been
    saved first would make verification depend on whether a background sync
    happened to land before the customer opened their inbox.

    An account that has since moved to a different address is the one case that
    is refused: that link is stale, and honouring it would resurrect an address
    the customer replaced.
    """
    user = await session.get(User, int(payload.userId))
    if user is None:
        return
    if user.email and user.email.lower() != payload.email.lower():
        return

    user.email = str(payload.email)
    user.email_verified_at = datetime.now(timezone.utc)
    await session.commit()


async def _already_queued(session, reminder_ids: list[str]) -> set[str]:
    if not reminder_ids:
        return set()
    rows = await session.scalars(
        select(MarketingMessage.reminder_id).where(
            MarketingMessage.reminder_id.in_(reminder_ids)
        )
    )
    return set(rows)


@router.post("/subscriptions/run", response_model=SubscriptionRunOut)
async def run_due_subscriptions(
    session: SessionDep, _: ServiceCaller
) -> SubscriptionRunOut:
    """
    Turn subscriptions that have come due into real orders, and advance them.

    Without this a subscription is a promise the shop never keeps: the schedule
    would sit on a date in the past and the second delivery would never happen.

    The order is created exactly as a manual repeat order would be — same
    table, same public id, `status="new"` — because delivery here is confirmed
    by an operator on the phone and paid on the doorstep. There is no card to
    charge, so "generate the order and let the operator call" *is* the
    fulfilment step, not a placeholder for one.

    Runs before the message queue is read, so the delivery notice a customer
    receives is about the schedule as it now stands.
    """
    now = datetime.now(timezone.utc)

    due = list(
        await session.scalars(
            select(Subscription).where(
                Subscription.status == "active",
                Subscription.next_delivery_at.is_not(None),
                Subscription.next_delivery_at <= now,
            )
        )
    )

    created: list[str] = []
    for subscription in due:
        if not subscription.items:
            # Nothing to deliver: cancel rather than roll an empty order
            # forward every interval for ever.
            subscription.status = "cancelled"
            subscription.next_delivery_at = None
            continue

        subtotal = sum(item.unit_price * item.quantity for item in subscription.items)
        order = Order(
            user_id=subscription.user_id,
            customer_name=subscription.customer_name,
            customer_phone=subscription.customer_phone,
            customer_email=subscription.customer_email,
            region=subscription.region,
            address=subscription.address,
            note=None,
            delivery_method="courier",
            locale=subscription.locale,
            subtotal=subtotal,
            discount=0,
            shipping=0,
            total=subtotal,
            applied_upsells=[],
            applied_promotions=["subscription"],
            attribution={"source": "subscription", "subscriptionId": subscription.id},
            public_id="",
            items=[
                OrderItem(
                    product_id=item.product_id,
                    slug=item.slug,
                    name=item.name,
                    quantity=item.quantity,
                    # Already the recurring price; the discount is in the number,
                    # not applied again on top of it.
                    unit_price=item.unit_price,
                    subscription_interval_days=subscription.interval_days,
                )
                for item in subscription.items
            ],
        )
        session.add(order)
        await session.flush()
        order.public_id = f"GV-{order.id + PUBLIC_ID_OFFSET}"
        created.append(order.public_id)

        # Advanced from the date that was due, not from now, so a cron that
        # runs late does not push every future delivery late with it.
        subscription.next_delivery_at = subscription.next_delivery_at + timedelta(
            days=subscription.interval_days
        )

    await session.commit()
    return SubscriptionRunOut(created=created)


@router.get("/due", response_model=list[DueMessageOut])
async def due_messages(
    session: SessionDep, _: ServiceCaller, limit: int = 50
) -> list[DueMessageOut]:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    today = now.date()
    candidates: list[DueMessageOut] = []

    # Only people who agreed to hear from us are even loaded. That is both the
    # correct filter and the cheap one — as the table grows, the users worth
    # considering stay a fraction of it.
    users = list(
        await session.scalars(
            select(User).where(
                or_(User.marketing_email.is_(True), User.marketing_telegram.is_(True))
            )
        )
    )
    telegram_chats = {
        link.phone: link.chat_id
        for link in await session.scalars(
            select(TelegramLink).where(
                TelegramLink.phone.in_([user.phone for user in users] or [""])
            )
        )
    }
    reachable = {user.id: _channels(user, telegram_chats) for user in users}

    def queue(user: User, reminder_id: str, campaign: str, data: dict) -> None:
        for channel, address in reachable.get(user.id, []):
            candidates.append(
                DueMessageOut(
                    reminderId=f"{reminder_id}:{channel}",
                    channel=channel,
                    campaign=campaign,
                    locale=user.locale,
                    name=user.name,
                    data=data,
                    **address,
                )
            )

    for user in users:
        if not reachable.get(user.id):
            continue

        own = _parse_birthday(user.birthday)
        upcoming = _next_anniversary(own[0], own[1], today) if own else None
        if upcoming and upcoming[0] <= settings.birthday_lead_days:
            queue(user, f"birthday:{user.id}:self:{upcoming[1]}", "birthday", {})

        for member in user.household:
            parsed = _parse_birthday(member.birthday)
            upcoming = _next_anniversary(parsed[0], parsed[1], today) if parsed else None
            if upcoming and upcoming[0] <= settings.birthday_lead_days:
                queue(
                    user,
                    f"birthday:{user.id}:{member.id}:{upcoming[1]}",
                    "birthday",
                    {"memberName": member.name} if member.name else {},
                )

            if member.relation == "child" and _in_school_season(today):
                age = _age_on(member.birthday, today)
                if age is None or SCHOOL_MIN_AGE <= age <= SCHOOL_MAX_AGE:
                    queue(
                        user,
                        f"child-season:{user.id}:{member.id}:{today.year}",
                        "child-season",
                        {"childName": member.name} if member.name else {},
                    )

    # Subscriptions: announced early enough that the delivery can still be
    # skipped or re-timed, which is the whole reason to announce it.
    horizon = now + timedelta(days=settings.subscription_notice_days)
    subscriptions = await session.scalars(
        select(Subscription).where(
            Subscription.status == "active",
            Subscription.next_delivery_at.is_not(None),
            Subscription.next_delivery_at <= horizon,
        )
    )
    by_id = {user.id: user for user in users}
    for subscription in subscriptions:
        user = by_id.get(subscription.user_id) if subscription.user_id else None
        if user is None or not reachable.get(user.id):
            continue
        delivery = subscription.next_delivery_at
        queue(
            user,
            f"subscription:{subscription.id}:{delivery.date().isoformat()}",
            "subscription-upcoming",
            {
                "deliveryDate": delivery.date().isoformat(),
                "daysUntil": max(0, (delivery.date() - today).days),
                "items": [
                    {"name": f"{item.name} × {item.quantity}", "url": f"/product/{item.slug}"}
                    for item in subscription.items
                ],
            },
        )

    """
    Reorder: the *latest* purchase of a product, one course ago.

    The window is applied first and the age test afterwards, in that order and
    not the other way round. Filtering on age in the query would hide a recent
    repurchase, leaving the older order looking like the latest one — and the
    customer would be told their course is running out days after they restocked.
    """
    window = now - timedelta(days=REORDER_WINDOW_DAYS)
    orders = await session.scalars(
        select(Order)
        .where(
            Order.user_id.is_not(None),
            Order.created_at >= window,
            Order.status != "cancelled",
        )
        .order_by(Order.created_at.asc())
    )

    latest_purchase: dict[tuple[int, str], tuple[date, str]] = {}
    for order in orders:
        if not reachable.get(order.user_id):
            continue
        for item in order.items:
            # Ascending order, so a later row simply overwrites an earlier one.
            latest_purchase[(order.user_id, item.slug)] = (order.created_at.date(), item.name)

    for (user_id, slug), (purchased_on, name) in latest_purchase.items():
        user = by_id.get(user_id)
        if user is None:
            continue
        elapsed = (today - purchased_on).days
        if elapsed < COURSE_DAYS - REORDER_LEAD_DAYS:
            continue
        runs_out = purchased_on + timedelta(days=COURSE_DAYS)
        queue(
            user,
            f"reorder:{user.id}:{slug}:{runs_out.strftime('%Y-%m')}",
            "reorder",
            {
                "productSlug": slug,
                "productName": name,
                "daysLeft": max(0, COURSE_DAYS - elapsed),
            },
        )

    seen = await _already_queued(session, [c.reminderId for c in candidates])
    fresh = [c for c in candidates if c.reminderId not in seen][:limit]

    # Recorded as queued *before* they are handed out. If the storefront dies
    # mid-batch the worst case is a message nobody received; the alternative —
    # recording after — has a worst case of a customer receiving the same
    # message every minute until the cron succeeds.
    for message in fresh:
        session.add(
            MarketingMessage(
                reminder_id=message.reminderId,
                campaign=message.campaign,
                channel=message.channel,
            )
        )
    await session.commit()

    return fresh


@router.post("/sent", status_code=204)
async def report_sent(
    payload: SentReport, session: SessionDep, _: ServiceCaller
) -> None:
    now = datetime.now(timezone.utc)
    for result in payload.results:
        await session.execute(
            update(MarketingMessage)
            .where(MarketingMessage.reminder_id == result.reminderId)
            .values(delivered=result.ok, sent_at=now)
        )
    await session.commit()
