import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from sqlalchemy import or_, select

from app.deps import CurrentUser, OptionalUser, SessionDep
from app.models import Order, OrderItem, Subscription, SubscriptionItem
from app.schemas import OrderLineOut, OrderOut, OrderRequest, OrderResult
from app.security import normalise_phone

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/orders", tags=["orders"])

# Public ids start well above zero so the first order does not advertise that
# it is the first order.
PUBLIC_ID_OFFSET = 10_000

# Mirrors RECURRING_PERCENT in src/lib/subscription/plans.ts. The storefront
# quotes it in the buy box; this is where the promise is written down.
RECURRING_DISCOUNT_PERCENT = 15


def _create_subscriptions(session, payload: OrderRequest, order: Order, user) -> None:
    """
    Turn the repeating lines of an order into standing subscriptions.

    Grouped by interval, so a customer who takes one thing monthly and another
    quarterly gets two schedules rather than one compromise. The first delivery
    is the order itself, so the next one is a full interval away.

    The recurring price is stored, not the price paid today: the buy box quoted
    a lower first-order discount and a higher recurring one, and the schedule
    has to hold the number the customer was actually promised.
    """
    by_interval: dict[int, list] = {}
    for line in payload.items:
        if line.subscription is None:
            continue
        by_interval.setdefault(line.subscription.intervalDays, []).append(line)

    now = datetime.now(timezone.utc)
    for interval_days, lines in by_interval.items():
        session.add(
            Subscription(
                user_id=user.id if user else None,
                customer_phone=order.customer_phone,
                customer_name=order.customer_name,
                customer_email=order.customer_email,
                interval_days=interval_days,
                next_delivery_at=now + timedelta(days=interval_days),
                locale=payload.locale,
                region=order.region,
                address=order.address,
                items=[
                    SubscriptionItem(
                        product_id=line.productId,
                        slug=line.slug,
                        name=line.name,
                        quantity=line.quantity,
                        unit_price=round(
                            line.unitPrice * (100 - RECURRING_DISCOUNT_PERCENT) / 100
                        ),
                    )
                    for line in lines
                ],
            )
        )


@router.post("", response_model=OrderResult)
async def create_order(
    payload: OrderRequest, session: SessionDep, user: OptionalUser
) -> OrderResult:
    phone = normalise_phone(payload.customer.phone)

    order = Order(
        user_id=user.id if user else None,
        customer_name=payload.customer.name,
        customer_phone=phone,
        customer_email=str(payload.customer.email) if payload.customer.email else None,
        region=payload.delivery.region,
        address=payload.delivery.address,
        note=payload.delivery.note,
        delivery_method=payload.delivery.method,
        locale=payload.locale,
        subtotal=payload.totals.subtotal,
        discount=payload.totals.discount,
        shipping=payload.totals.shipping,
        total=payload.totals.total,
        applied_upsells=payload.appliedUpsells,
        applied_promotions=payload.appliedPromotions,
        attribution=payload.attribution.model_dump() if payload.attribution else None,
        # Filled in below; the column is unique, so it cannot be left null.
        public_id="",
        items=[
            OrderItem(
                product_id=line.productId,
                slug=line.slug,
                name=line.name,
                quantity=line.quantity,
                unit_price=line.unitPrice,
                subscription_interval_days=(
                    line.subscription.intervalDays if line.subscription else None
                ),
            )
            for line in payload.items
        ],
    )

    session.add(order)
    # Flush to get the id the public id is derived from, still inside the same
    # transaction — an order and its number are never separately committed.
    await session.flush()
    order.public_id = f"GV-{order.id + PUBLIC_ID_OFFSET}"

    _create_subscriptions(session, payload, order, user)
    await session.commit()

    log.info("order %s stored (%s items)", order.public_id, len(payload.items))
    return OrderResult(ok=True, orderId=order.public_id)


@router.get("/me", response_model=list[OrderOut])
async def my_orders(session: SessionDep, user: CurrentUser) -> list[OrderOut]:
    # Match on the account *or* the phone: orders placed as a guest before
    # registering are the customer's too, and register() cannot claim orders
    # placed after it.
    result = await session.scalars(
        select(Order)
        .where(or_(Order.user_id == user.id, Order.customer_phone == user.phone))
        .order_by(Order.created_at.desc())
    )

    return [
        OrderOut(
            orderId=order.public_id,
            status=order.status,
            total=order.total,
            createdAt=order.created_at,
            items=[
                OrderLineOut(
                    slug=item.slug,
                    name=item.name,
                    quantity=item.quantity,
                    unitPrice=item.unit_price,
                )
                for item in order.items
            ],
        )
        for order in result
    ]
