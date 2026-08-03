import os
import tempfile
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

# Point the settings at a throwaway file before app modules import them.
_DB_FILE = os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_DB_FILE}"
os.environ["JWT_SECRET"] = "test-secret"

from app.db import Base, get_session  # noqa: E402
from app.main import app  # noqa: E402

engine = create_async_engine(os.environ["DATABASE_URL"])
TestSession = async_sessionmaker(engine, expire_on_commit=False)


@pytest_asyncio.fixture(autouse=True)
async def _schema() -> AsyncIterator[None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncIterator[AsyncClient]:
    async def override() -> AsyncIterator:
        async with TestSession() as session:
            yield session

    app.dependency_overrides[get_session] = override
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def db() -> AsyncIterator:
    """
    A session on the same database the app under test is using.

    Offered as a fixture rather than by importing TestSession directly:
    `from tests.conftest import ...` loads this file a second time under a
    different module name, and `mkdtemp()` runs again with it — so the caller
    ends up talking to an empty database in another directory.
    """
    async with TestSession() as session:
        yield session


class TelegramStub:
    """
    Stands in for the Bot API and remembers what was sent.

    The code only ever exists in transit — it is hashed before it is stored —
    so intercepting delivery is the only way a test can learn it. That is also
    the point: if this stub could read the code out of the database instead,
    so could anyone who copied the database.
    """

    def __init__(self) -> None:
        self.messages: list[tuple[int, str]] = []

    async def send_message(self, chat_id: int, text: str) -> bool:
        self.messages.append((chat_id, text))
        return True

    @property
    def last_code(self) -> str:
        import re

        for _, text in reversed(self.messages):
            match = re.search(r"\b(\d{6})\b", text)
            if match:
                return match.group(1)
        raise AssertionError("no code was sent")


@pytest.fixture
def telegram_stub(monkeypatch) -> TelegramStub:
    from app import telegram

    stub = TelegramStub()
    monkeypatch.setattr(telegram, "send_message", stub.send_message)
    return stub


@pytest_asyncio.fixture
async def sign_in(client, db, telegram_stub):
    """
    Sign a phone in the way the product actually does, and hand back its token.

    Tests that only need "a logged-in customer" shouldn't have to restate the
    link-bot-then-code dance; when that flow changes, it changes here once.
    """
    from app.models import TelegramLink

    chat_ids = iter(range(900_000_001, 900_001_000))

    async def _sign_in(phone: str = "998901234567") -> str:
        from app.security import normalise_phone

        normalised = normalise_phone(phone)
        existing = await db.scalar(
            select(TelegramLink).where(TelegramLink.phone == normalised)
        )
        if existing is None:
            db.add(TelegramLink(phone=normalised, chat_id=next(chat_ids)))
            await db.commit()

        await client.post("/api/v1/auth/otp/request", json={"phone": phone})
        res = await client.post(
            "/api/v1/auth/otp/verify",
            json={"phone": phone, "code": telegram_stub.last_code},
        )
        assert res.status_code == 200, res.text
        return res.json()["accessToken"]

    return _sign_in


@pytest.fixture
def order_payload() -> dict:
    """The exact shape src/lib/shopflow/schemas.ts sends."""
    return {
        "customer": {"name": "Aziz Karimov", "phone": "+998 90 123 45 67"},
        "delivery": {
            "region": "Toshkent",
            "address": "Chilonzor 12-45",
            "note": None,
            "method": "courier",
        },
        "items": [
            {
                "productId": "p1",
                "slug": "vitamin-d3",
                "name": "Vitamin D3 2000 IU",
                "quantity": 2,
                "unitPrice": 96750,
            }
        ],
        "appliedUpsells": [],
        "appliedPromotions": ["free_shipping"],
        "totals": {"subtotal": 193500, "discount": 0, "shipping": 0, "total": 193500},
        "locale": "uz",
        "attribution": {"utmSource": "google", "utmCampaign": "winter"},
    }
