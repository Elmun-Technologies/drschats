import os
import tempfile
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

# Point the settings at a throwaway file before app modules import them.
_DB_FILE = os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_DB_FILE}"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["MARKETING_API_KEY"] = "test-service-key"

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


@pytest.fixture
def db_sessions() -> async_sessionmaker:
    """
    Direct database access, for the few facts a test cannot state through the
    API — chiefly "this order was placed a month ago", which no endpoint
    accepts and no test can wait for.

    Handed out as a fixture rather than imported: pytest loads this file as
    `conftest`, so importing it as `tests.conftest` would build a second module
    pointed at a second, empty database.
    """
    return TestSession


@pytest.fixture
def service_headers() -> dict:
    """What the storefront sends when it calls as itself, not as a customer."""
    return {"X-Service-Key": os.environ["MARKETING_API_KEY"]}


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
