from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter
from sqlalchemy import or_, select, update

from app.config import get_settings
from app.deps import ServiceCaller, SessionDep
from app.models import (
    EmailSubscriber,
    MarketingMessage,
    Order,
    Subscription,
    User,
)
from app.schemas import DueMessageOut, SentReport, SubscriberIn, VerifyEmailIn

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


def _channels(user: User) -> list[tuple[str, dict]]:
    """
    The channels this user has actually agreed to, in order of preference.

    Email needs both consent *and* a verified address: an unverified address is
    a claim, and sending marketing to a claim is how a domain gets blocked.
    """
    out: list[tuple[str, dict]] = []
    if user.marketing_email and user.email and user.email_verified_at is not None:
        out.append(("email", {"email": user.email}))
    if user.marketing_telegram and user.telegram_chat_id:
        out.append(("telegram", {"telegramChatId": user.telegram_chat_id}))
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
    """The click on the registration confirmation link."""
    user = await session.get(User, int(payload.userId))
    # The address must still be the one the link was issued for; changing it in
    # between invalidates the link rather than verifying the new value.
    if user is not None and user.email and user.email.lower() == payload.email.lower():
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
    reachable = {user.id: _channels(user) for user in users}

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

    # Reorder: the last order of a product, one course ago.
    cutoff = now - timedelta(days=COURSE_DAYS - REORDER_LEAD_DAYS)
    window = now - timedelta(days=REORDER_WINDOW_DAYS)
    orders = await session.scalars(
        select(Order).where(
            Order.user_id.is_not(None),
            Order.created_at <= cutoff,
            Order.created_at >= window,
            Order.status != "cancelled",
        )
    )
    reminded_products: set[tuple[int, str]] = set()
    for order in orders:
        user = by_id.get(order.user_id)
        if user is None or not reachable.get(user.id):
            continue
        elapsed = (today - order.created_at.date()).days
        for item in order.items:
            # A product bought twice gets one reminder, from whichever order
            # the loop reaches first; both are past the same course length.
            key = (user.id, item.slug)
            if key in reminded_products:
                continue
            reminded_products.add(key)
            runs_out = order.created_at.date() + timedelta(days=COURSE_DAYS)
            queue(
                user,
                f"reorder:{user.id}:{item.slug}:{runs_out.strftime('%Y-%m')}",
                "reorder",
                {
                    "productSlug": item.slug,
                    "productName": item.name,
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
