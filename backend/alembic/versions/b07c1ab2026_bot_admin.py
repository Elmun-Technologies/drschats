"""Bot admin, verified service API and durable outbox.

Revision ID: b07c1ab2026
Revises: 2f1c74a90b31
"""
from alembic import op
import sqlalchemy as sa
revision = 'b07c1ab2026'
down_revision = '2f1c74a90b31'
branch_labels = None
depends_on = None
BIG_PK = sa.BigInteger().with_variant(sa.Integer(), "sqlite")

def upgrade():
    op.create_table('bot_config',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('data', sa.JSON(), primary_key=False, nullable=False),
    )
    op.create_table('bot_members',
        sa.Column('chat_id', sa.BigInteger(), primary_key=True, nullable=False),
        sa.Column('locale', sa.String(length=8), primary_key=False, nullable=False),
        sa.Column('source', sa.String(length=64), primary_key=False, nullable=True),
        sa.Column('blocked_at', sa.DateTime(timezone=True), primary_key=False, nullable=True),
    )
    op.create_table('bot_tickets',
        sa.Column('id', BIG_PK, primary_key=True, nullable=False),
        sa.Column('chat_id', sa.BigInteger(), primary_key=False, nullable=False),
        sa.Column('category', sa.String(length=24), primary_key=False, nullable=False),
        sa.Column('text', sa.Text(), primary_key=False, nullable=False),
        sa.Column('status', sa.String(length=16), primary_key=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), primary_key=False, nullable=False),
    )
    op.create_index('ix_bot_tickets_chat_id', 'bot_tickets', ['chat_id'], unique=False)
    op.create_table('bot_jobs',
        sa.Column('id', BIG_PK, primary_key=True, nullable=False),
        sa.Column('dedupe_key', sa.String(length=200), primary_key=False, nullable=False),
        sa.Column('chat_id', sa.BigInteger(), primary_key=False, nullable=False),
        sa.Column('kind', sa.String(length=32), primary_key=False, nullable=False),
        sa.Column('payload', sa.JSON(), primary_key=False, nullable=False),
        sa.Column('status', sa.String(length=16), primary_key=False, nullable=False),
        sa.Column('attempts', sa.Integer(), primary_key=False, nullable=False),
        sa.Column('due_at', sa.DateTime(timezone=True), primary_key=False, nullable=False),
        sa.Column('lease_token', sa.String(length=64), primary_key=False, nullable=True),
        sa.Column('leased_until', sa.DateTime(timezone=True), primary_key=False, nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), primary_key=False, nullable=True),
        sa.Column('error', sa.String(length=64), primary_key=False, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), primary_key=False, nullable=False),
    )
    op.create_index('ix_bot_jobs_status', 'bot_jobs', ['status'], unique=False)
    op.create_index('ix_bot_jobs_chat_id', 'bot_jobs', ['chat_id'], unique=False)
    op.create_index('ix_bot_jobs_due_at', 'bot_jobs', ['due_at'], unique=False)
    op.create_index('ux_bot_jobs_dedupe_key', 'bot_jobs', ['dedupe_key'], unique=True)
    op.create_table('bot_order_events',
        sa.Column('id', BIG_PK, primary_key=True, nullable=False),
        sa.Column('order_id', sa.BigInteger(), sa.ForeignKey('orders.id', ondelete='CASCADE'), primary_key=False, nullable=False),
        sa.Column('stage', sa.String(length=32), primary_key=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), primary_key=False, nullable=False),
    )
    op.create_index('ix_bot_order_events_order_id', 'bot_order_events', ['order_id'], unique=False)
    op.create_table('bot_admin_attempts',
        sa.Column('id', BIG_PK, primary_key=True, nullable=False),
        sa.Column('ip_hash', sa.String(length=64), primary_key=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), primary_key=False, nullable=False),
    )
    op.create_index('ix_bot_admin_attempts_ip_hash', 'bot_admin_attempts', ['ip_hash'], unique=False)
    op.create_index('ix_bot_admin_attempts_created_at', 'bot_admin_attempts', ['created_at'], unique=False)

def downgrade():
    op.drop_table('bot_admin_attempts')
    op.drop_table('bot_order_events')
    op.drop_table('bot_jobs')
    op.drop_table('bot_tickets')
    op.drop_table('bot_members')
    op.drop_table('bot_config')
