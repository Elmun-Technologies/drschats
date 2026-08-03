"""telegram otp sign-in

Replaces password authentication with a phone number and a one-time code
delivered over Telegram.

Revision ID: a1b2c3d4e5f6
Revises: 133ddaf0f9ce
Create Date: 2026-08-03 03:10:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "133ddaf0f9ce"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

BigIntPk = sa.BigInteger().with_variant(sa.Integer(), "sqlite")


def upgrade() -> None:
    op.create_table(
        "telegram_links",
        sa.Column("id", BigIntPk, autoincrement=True, nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=False),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("username", sa.String(length=64), nullable=True),
        sa.Column("linked_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_telegram_links_phone", "telegram_links", ["phone"], unique=True)
    op.create_index("ix_telegram_links_chat_id", "telegram_links", ["chat_id"], unique=True)

    op.create_table(
        "otp_codes",
        sa.Column("id", BigIntPk, autoincrement=True, nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=False),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("channel", sa.String(length=16), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_otp_codes_phone", "otp_codes", ["phone"])
    op.create_index("ix_otp_codes_expires_at", "otp_codes", ["expires_at"])
    op.create_index("ix_otp_codes_created_at", "otp_codes", ["created_at"])

    # Nobody signs in with a password any more, so keeping the hashes would be
    # storing a liability with no reader.
    op.drop_column("users", "password_hash")
    # A code proves the phone, not the name — accounts now start nameless and
    # checkout fills it in.
    #
    # Wrapped in batch_alter_table because SQLite has no ALTER COLUMN: without
    # it the whole chain stops here, and `alembic upgrade head` is the first
    # thing anyone runs against a local file database.
    with op.batch_alter_table("users") as batch:
        batch.alter_column("name", existing_type=sa.String(length=120), server_default="")


def downgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.alter_column("name", existing_type=sa.String(length=120), server_default=None)
    # Restored empty: the original hashes are gone and cannot be recovered.
    op.add_column(
        "users",
        sa.Column("password_hash", sa.String(length=255), nullable=False, server_default=""),
    )

    op.drop_index("ix_otp_codes_created_at", table_name="otp_codes")
    op.drop_index("ix_otp_codes_expires_at", table_name="otp_codes")
    op.drop_index("ix_otp_codes_phone", table_name="otp_codes")
    op.drop_table("otp_codes")

    op.drop_index("ix_telegram_links_chat_id", table_name="telegram_links")
    op.drop_index("ix_telegram_links_phone", table_name="telegram_links")
    op.drop_table("telegram_links")
