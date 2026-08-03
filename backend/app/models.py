from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# SQLite has no autoincrementing BIGINT — only INTEGER PRIMARY KEY grows on its
# own. Without this variant the test suite cannot insert a row, which would
# mean the tests exercise a schema the application does not use.
BigIntPk = BigInteger().with_variant(Integer, "sqlite")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    # Phone, not email: in this market it is the identifier people actually
    # have and already type into checkout.
    phone: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Added later than the phone, and secondary to it: an address is something
    # a customer offers so we can write to them, not something they sign in
    # with. Indexed but not unique — two people share a family inbox, and until
    # `email_verified_at` is set the value is only a claim anyway.
    email: Mapped[str | None] = mapped_column(String(160), nullable=True, index=True)
    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # `YYYY-MM-DD`, or `MM-DD` when the year was not given. Stored as text
    # rather than a date because a birthday without a year is not a date, and
    # inventing one to fit the column would put a wrong age in a greeting.
    birthday: Mapped[str | None] = mapped_column(String(10), nullable=True)

    locale: Mapped[str] = mapped_column(String(8), default="uz")

    # Health signals the customer stated. Slugs, mirroring the storefront's
    # health topics; kept as JSON because the set changes with content, not
    # with schema.
    goals: Mapped[list[str]] = mapped_column(JSON, default=list)

    marketing_email: Mapped[bool] = mapped_column(Boolean, default=False)
    marketing_telegram: Mapped[bool] = mapped_column(Boolean, default=False)
    # Set on every consent decision, including a withdrawal — proving when
    # someone opted *out* matters more than proving when they opted in.
    consent_updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Only exists once the customer has started a chat with the bot.
    telegram_chat_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    household: Mapped[list["HouseholdMember"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )


class HouseholdMember(Base):
    """
    Who else the customer buys for.

    The single most useful thing a vitamin shop can be told: "for my child"
    changes the dose, the format and what should be shown at all — and a birth
    date here is what makes a reminder a service rather than an advert.
    """

    __tablename__ = "household_members"

    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    relation: Mapped[str] = mapped_column(String(16))
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    birthday: Mapped[str | None] = mapped_column(String(10), nullable=True)

    user: Mapped["User"] = relationship(back_populates="household")


class EmailSubscriber(Base):
    """
    The marketing list, including people who have no account.

    Separate from `users` on purpose: someone who typed their address into the
    newsletter box has consented to a mailing list, not created a relationship
    with a pharmacy, and the two should not be conflated in either direction.
    """

    __tablename__ = "email_subscribers"

    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    locale: Mapped[str] = mapped_column(String(8), default="uz")

    # "pending" until the double opt-in link is clicked. Nothing is ever sent
    # to a pending address except the confirmation itself.
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    unsubscribed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Subscription(Base):
    """
    A repeating order — Subscribe & Save.

    Nullable `user_id`, like orders: checkout has no login, and a subscription
    that could only be created by a signed-in customer would be a subscription
    almost nobody starts. The phone claims it later.
    """

    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    customer_phone: Mapped[str] = mapped_column(String(32), index=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    customer_email: Mapped[str | None] = mapped_column(String(160), nullable=True)

    # active | paused | cancelled
    status: Mapped[str] = mapped_column(String(16), default="active", index=True)
    interval_days: Mapped[int] = mapped_column(Integer)
    next_delivery_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )

    locale: Mapped[str] = mapped_column(String(8), default="uz")
    region: Mapped[str] = mapped_column(String(120))
    address: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    items: Mapped[list["SubscriptionItem"]] = relationship(
        back_populates="subscription", cascade="all, delete-orphan", lazy="selectin"
    )


class SubscriptionItem(Base):
    __tablename__ = "subscription_items"

    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    subscription_id: Mapped[int] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="CASCADE"), index=True
    )

    product_id: Mapped[str] = mapped_column(String(64))
    slug: Mapped[str] = mapped_column(String(160))
    name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer)
    # The recurring price, already discounted — what the customer was shown
    # before subscribing, and therefore what they agreed to pay.
    unit_price: Mapped[int] = mapped_column(BigInteger)

    subscription: Mapped["Subscription"] = relationship(back_populates="items")


class MarketingMessage(Base):
    """
    What has already been sent.

    The whole point is `reminder_id`: it is unique per occurrence, so a cron
    that runs twice, or a deploy that replays a batch, cannot wish anyone a
    happy birthday twice in one morning.
    """

    __tablename__ = "marketing_messages"

    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    reminder_id: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    campaign: Mapped[str] = mapped_column(String(64), index=True)
    channel: Mapped[str] = mapped_column(String(16))
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    # False when delivery failed; the row still exists so a permanently broken
    # address is visible rather than silently retried forever.
    delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    queued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    # Shown to the customer and quoted on the phone; never the raw row id.
    public_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)

    # Nullable on purpose: checkout has no login, and requiring one to place an
    # order would trade a working funnel for a database column. Guest orders are
    # claimed later by matching the phone.
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)

    customer_name: Mapped[str] = mapped_column(String(120))
    customer_phone: Mapped[str] = mapped_column(String(32), index=True)
    # Optional at checkout, so optional here. Present means a confirmation was
    # emailed and a reorder reminder has somewhere to go.
    customer_email: Mapped[str | None] = mapped_column(String(160), nullable=True)

    region: Mapped[str] = mapped_column(String(120))
    address: Mapped[str] = mapped_column(Text)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    delivery_method: Mapped[str] = mapped_column(String(64))

    locale: Mapped[str] = mapped_column(String(8))
    status: Mapped[str] = mapped_column(String(32), default="new", index=True)

    # Integer so'm throughout — the storefront never sends fractional money.
    subtotal: Mapped[int] = mapped_column(BigInteger)
    discount: Mapped[int] = mapped_column(BigInteger)
    shipping: Mapped[int] = mapped_column(BigInteger)
    total: Mapped[int] = mapped_column(BigInteger)

    applied_upsells: Mapped[list[str]] = mapped_column(JSON, default=list)
    applied_promotions: Mapped[list[str]] = mapped_column(JSON, default=list)
    # UTM/referrer as sent; kept whole so ad reporting is not limited to the
    # fields anyone thought of today.
    attribution: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

    user: Mapped["User | None"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", lazy="selectin"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)

    product_id: Mapped[str] = mapped_column(String(64))
    slug: Mapped[str] = mapped_column(String(160))
    # Name and price are copied, not referenced: an order is a record of what
    # was agreed, and it must not change when the catalogue does.
    name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[int] = mapped_column(BigInteger)
    # Set when this line was bought as a repeating delivery; the recurring
    # order itself lives in `subscriptions`.
    subscription_interval_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    order: Mapped["Order"] = relationship(back_populates="items")
