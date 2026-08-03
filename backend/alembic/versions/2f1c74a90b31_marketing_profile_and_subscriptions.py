"""marketing profile and subscriptions

Adds everything the personalisation and marketing programme needs: the fields a
customer volunteers about themselves, who else they buy for, the newsletter
list, repeating orders, and the log that stops a reminder being sent twice.

Revision ID: 2f1c74a90b31
Revises: 133ddaf0f9ce
Create Date: 2026-08-03 07:10:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '2f1c74a90b31'
down_revision: str | None = '133ddaf0f9ce'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# SQLite has no autoincrementing BIGINT, so primary keys carry the same variant
# the models use — otherwise the schema the tests run against is not the schema
# the application ships.
BIG_PK = sa.BigInteger().with_variant(sa.Integer(), 'sqlite')


def upgrade() -> None:
    # --- users: the volunteered profile -----------------------------------
    op.add_column('users', sa.Column('email', sa.String(length=160), nullable=True))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('birthday', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('locale', sa.String(length=8), nullable=False, server_default='uz'))
    op.add_column('users', sa.Column('goals', sa.JSON(), nullable=False, server_default='[]'))
    op.add_column('users', sa.Column('marketing_email', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('users', sa.Column('marketing_telegram', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('users', sa.Column('consent_updated_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('telegram_chat_id', sa.String(length=64), nullable=True))
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)

    # --- orders: the address a confirmation goes to -----------------------
    op.add_column('orders', sa.Column('customer_email', sa.String(length=160), nullable=True))
    op.add_column('order_items', sa.Column('subscription_interval_days', sa.Integer(), nullable=True))

    op.create_table(
        'household_members',
        sa.Column('id', BIG_PK, autoincrement=True, nullable=False),
        sa.Column('user_id', BIG_PK, nullable=False),
        sa.Column('relation', sa.String(length=16), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=True),
        sa.Column('birthday', sa.String(length=10), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_household_members_user_id'), 'household_members', ['user_id'], unique=False)

    op.create_table(
        'email_subscribers',
        sa.Column('id', BIG_PK, autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=160), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=True),
        sa.Column('locale', sa.String(length=8), nullable=False, server_default='uz'),
        sa.Column('status', sa.String(length=16), nullable=False, server_default='pending'),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('unsubscribed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_email_subscribers_email'), 'email_subscribers', ['email'], unique=True)
    op.create_index(op.f('ix_email_subscribers_status'), 'email_subscribers', ['status'], unique=False)

    op.create_table(
        'subscriptions',
        sa.Column('id', BIG_PK, autoincrement=True, nullable=False),
        sa.Column('user_id', BIG_PK, nullable=True),
        sa.Column('customer_phone', sa.String(length=32), nullable=False),
        sa.Column('customer_name', sa.String(length=120), nullable=False),
        sa.Column('customer_email', sa.String(length=160), nullable=True),
        sa.Column('status', sa.String(length=16), nullable=False, server_default='active'),
        sa.Column('interval_days', sa.Integer(), nullable=False),
        sa.Column('next_delivery_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('locale', sa.String(length=8), nullable=False, server_default='uz'),
        sa.Column('region', sa.String(length=120), nullable=False),
        sa.Column('address', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=False)
    op.create_index(op.f('ix_subscriptions_customer_phone'), 'subscriptions', ['customer_phone'], unique=False)
    op.create_index(op.f('ix_subscriptions_status'), 'subscriptions', ['status'], unique=False)
    op.create_index(op.f('ix_subscriptions_next_delivery_at'), 'subscriptions', ['next_delivery_at'], unique=False)

    op.create_table(
        'subscription_items',
        sa.Column('id', BIG_PK, autoincrement=True, nullable=False),
        sa.Column('subscription_id', BIG_PK, nullable=False),
        sa.Column('product_id', sa.String(length=64), nullable=False),
        sa.Column('slug', sa.String(length=160), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(['subscription_id'], ['subscriptions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_subscription_items_subscription_id'), 'subscription_items', ['subscription_id'], unique=False)

    op.create_table(
        'marketing_messages',
        sa.Column('id', BIG_PK, autoincrement=True, nullable=False),
        sa.Column('reminder_id', sa.String(length=200), nullable=False),
        sa.Column('campaign', sa.String(length=64), nullable=False),
        sa.Column('channel', sa.String(length=16), nullable=False),
        sa.Column('user_id', BIG_PK, nullable=True),
        sa.Column('delivered', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('queued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    # Unique: this index is the thing that stops a customer being wished a
    # happy birthday twice in one morning.
    op.create_index(op.f('ix_marketing_messages_reminder_id'), 'marketing_messages', ['reminder_id'], unique=True)
    op.create_index(op.f('ix_marketing_messages_campaign'), 'marketing_messages', ['campaign'], unique=False)
    op.create_index(op.f('ix_marketing_messages_user_id'), 'marketing_messages', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_marketing_messages_user_id'), table_name='marketing_messages')
    op.drop_index(op.f('ix_marketing_messages_campaign'), table_name='marketing_messages')
    op.drop_index(op.f('ix_marketing_messages_reminder_id'), table_name='marketing_messages')
    op.drop_table('marketing_messages')

    op.drop_index(op.f('ix_subscription_items_subscription_id'), table_name='subscription_items')
    op.drop_table('subscription_items')

    op.drop_index(op.f('ix_subscriptions_next_delivery_at'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_status'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_customer_phone'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_user_id'), table_name='subscriptions')
    op.drop_table('subscriptions')

    op.drop_index(op.f('ix_email_subscribers_status'), table_name='email_subscribers')
    op.drop_index(op.f('ix_email_subscribers_email'), table_name='email_subscribers')
    op.drop_table('email_subscribers')

    op.drop_index(op.f('ix_household_members_user_id'), table_name='household_members')
    op.drop_table('household_members')

    op.drop_column('order_items', 'subscription_interval_days')
    op.drop_column('orders', 'customer_email')

    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_column('users', 'telegram_chat_id')
    op.drop_column('users', 'consent_updated_at')
    op.drop_column('users', 'marketing_telegram')
    op.drop_column('users', 'marketing_email')
    op.drop_column('users', 'goals')
    op.drop_column('users', 'locale')
    op.drop_column('users', 'birthday')
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'email')
