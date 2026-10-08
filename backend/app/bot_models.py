"""Bot administration tables; customer/order identity stays in existing models."""
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base
from app.models import BigIntPk, utcnow


class BotConfig(Base):
    __tablename__ = 'bot_config'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    data: Mapped[dict] = mapped_column(JSON, default=dict)


class BotTicket(Base):
    __tablename__ = 'bot_tickets'
    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    chat_id: Mapped[int] = mapped_column(BigInteger, index=True)
    category: Mapped[str] = mapped_column(String(24))
    text: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default='open')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class BotJob(Base):
    __tablename__ = 'bot_jobs'
    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    dedupe_key: Mapped[str] = mapped_column(String(200), unique=True)
    chat_id: Mapped[int] = mapped_column(BigInteger, index=True)
    kind: Mapped[str] = mapped_column(String(32))
    payload: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(16), default='pending', index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    lease_token: Mapped[str | None] = mapped_column(String(64), nullable=True)
    leased_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class BotMember(Base):
    __tablename__ = 'bot_members'
    chat_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    locale: Mapped[str] = mapped_column(String(8), default='uz')
    source: Mapped[str | None] = mapped_column(String(64), nullable=True)
    blocked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class BotOrderEvent(Base):
    __tablename__ = 'bot_order_events'
    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id', ondelete='CASCADE'), index=True)
    stage: Mapped[str] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class BotAdminAttempt(Base):
    __tablename__ = 'bot_admin_attempts'
    id: Mapped[int] = mapped_column(BigIntPk, primary_key=True, autoincrement=True)
    ip_hash: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
