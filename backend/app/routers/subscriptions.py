from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import or_, select

from app.deps import CurrentUser, SessionDep
from app.models import Subscription
from app.schemas import OrderLineOut, SubscriptionOut, SubscriptionUpdate

router = APIRouter(prefix="/api/v1/subscriptions", tags=["subscriptions"])

"""
Managing a repeating order.

Every control the buy box promised — pause, skip one, change the rhythm,
cancel — is here, and all of them are one PATCH. That is not laziness: to the
customer these are one thing ("change my subscription"), and splitting them
into five endpoints would give five chances for the next delivery date to end
up somewhere nobody intended.
"""


def _to_out(subscription: Subscription) -> SubscriptionOut:
    return SubscriptionOut(
        id=subscription.id,
        status=subscription.status,
        intervalDays=subscription.interval_days,
        nextDeliveryAt=subscription.next_delivery_at,
        items=[
            OrderLineOut(
                slug=item.slug,
                name=item.name,
                quantity=item.quantity,
                unitPrice=item.unit_price,
            )
            for item in subscription.items
        ],
        total=sum(item.unit_price * item.quantity for item in subscription.items),
    )


@router.get("/me", response_model=list[SubscriptionOut])
async def my_subscriptions(session: SessionDep, user: CurrentUser) -> list[SubscriptionOut]:
    # Account *or* phone, exactly like orders: a subscription started at
    # checkout without signing in belongs to whoever registers that number.
    result = await session.scalars(
        select(Subscription)
        .where(
            or_(Subscription.user_id == user.id, Subscription.customer_phone == user.phone)
        )
        .order_by(Subscription.created_at.desc())
    )
    return [_to_out(subscription) for subscription in result]


@router.patch("/{subscription_id}", response_model=SubscriptionOut)
async def update_subscription(
    subscription_id: int,
    payload: SubscriptionUpdate,
    session: SessionDep,
    user: CurrentUser,
) -> SubscriptionOut:
    subscription = await session.get(Subscription, subscription_id)
    # One message for "no such subscription" and "not yours": telling the
    # difference turns the id in the URL into a way to count other people's.
    if subscription is None or (
        subscription.user_id != user.id and subscription.customer_phone != user.phone
    ):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Subscription not found")

    if subscription.status == "cancelled" and payload.status != "active":
        raise HTTPException(status.HTTP_409_CONFLICT, "Subscription is cancelled")

    now = datetime.now(timezone.utc)

    if payload.intervalDays is not None:
        subscription.interval_days = payload.intervalDays
        # Re-time from today rather than from the old schedule: someone moving
        # from 30 to 90 days is saying "not so soon", and keeping next week's
        # delivery would answer the opposite.
        subscription.next_delivery_at = now + timedelta(days=payload.intervalDays)

    if payload.skipNext:
        base = subscription.next_delivery_at or now
        subscription.next_delivery_at = base + timedelta(days=subscription.interval_days)

    if payload.status is not None:
        subscription.status = payload.status
        if payload.status == "cancelled":
            subscription.cancelled_at = now
            # No date means nothing is queued; the row stays as history.
            subscription.next_delivery_at = None
        elif payload.status == "active":
            subscription.cancelled_at = None
            if subscription.next_delivery_at is None or subscription.next_delivery_at < now:
                # Resuming starts a fresh interval — a paused subscription must
                # not ship the moment it wakes up.
                subscription.next_delivery_at = now + timedelta(
                    days=subscription.interval_days
                )
        elif payload.status == "paused":
            subscription.next_delivery_at = None

    # A subscription touched by its owner is a subscription claimed by them.
    if subscription.user_id is None:
        subscription.user_id = user.id

    await session.commit()
    await session.refresh(subscription)
    return _to_out(subscription)
