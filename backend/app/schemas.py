from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

# The order payload mirrors src/lib/shopflow/schemas.ts on the storefront.
# It is a contract, not a preference: the frontend already validates against
# that shape, so anything renamed here silently breaks checkout.


class Customer(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=32)


class Delivery(BaseModel):
    region: str = Field(min_length=1, max_length=120)
    address: str = Field(min_length=3)
    note: str | None = None
    method: str


class OrderLine(BaseModel):
    productId: str
    slug: str
    name: str
    quantity: int = Field(gt=0)
    unitPrice: int = Field(ge=0)


class Totals(BaseModel):
    subtotal: int
    discount: int
    shipping: int
    total: int


class Attribution(BaseModel):
    utmSource: str | None = None
    utmMedium: str | None = None
    utmCampaign: str | None = None
    landing: str | None = None
    referrer: str | None = None


class OrderRequest(BaseModel):
    customer: Customer
    delivery: Delivery
    items: list[OrderLine] = Field(min_length=1)
    appliedUpsells: list[str] = Field(default_factory=list)
    appliedPromotions: list[str] = Field(default_factory=list)
    totals: Totals
    locale: Literal["ru", "uz"]
    attribution: Attribution | None = None


class OrderResult(BaseModel):
    ok: bool
    orderId: str | None = None
    message: str | None = None


class OrderLineOut(BaseModel):
    slug: str
    name: str
    quantity: int
    unitPrice: int


class OrderOut(BaseModel):
    orderId: str
    status: str
    total: int
    createdAt: datetime
    items: list[OrderLineOut]


# --- auth ---------------------------------------------------------------


class OtpRequest(BaseModel):
    phone: str = Field(min_length=7, max_length=32)


class OtpRequestResponse(BaseModel):
    # "sent" — a code is on its way. "link_required" — the bot has never spoken
    # to this phone, so there is nowhere to send one until it has.
    status: Literal["sent", "link_required"]
    channel: Literal["telegram"]
    telegramLink: str | None
    expiresIn: int


class OtpVerifyRequest(BaseModel):
    phone: str = Field(min_length=7, max_length=32)
    code: str = Field(min_length=4, max_length=8)


class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    phone: str
