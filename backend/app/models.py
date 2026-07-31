from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
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

    orders: Mapped[list["Order"]] = relationship(back_populates="user")


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

    order: Mapped["Order"] = relationship(back_populates="items")
