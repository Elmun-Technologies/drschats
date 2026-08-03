from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field

# The order payload mirrors src/lib/shopflow/schemas.ts on the storefront.
# It is a contract, not a preference: the frontend already validates against
# that shape, so anything renamed here silently breaks checkout.


class Customer(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=32)
    email: EmailStr | None = None
    marketingOptIn: bool = False


class Delivery(BaseModel):
    region: str = Field(min_length=1, max_length=120)
    address: str = Field(min_length=3)
    note: str | None = None
    method: str


class LineSubscription(BaseModel):
    intervalDays: int = Field(ge=7, le=365)


class OrderLine(BaseModel):
    productId: str
    slug: str
    name: str
    quantity: int = Field(gt=0)
    unitPrice: int = Field(ge=0)
    # Present when the line was bought as a repeating delivery.
    subscription: LineSubscription | None = None


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


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=32)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    phone: str


# --- profile ------------------------------------------------------------


class HouseholdMemberIn(BaseModel):
    relation: Literal["child", "partner", "parent", "other"]
    name: str | None = Field(default=None, max_length=120)
    # `YYYY-MM-DD` or `MM-DD`; validated by the reminder rules, not by a date
    # type, because a birthday without a year is not a date.
    birthday: str | None = Field(default=None, max_length=10)


class ProfileUpdate(BaseModel):
    email: EmailStr | None = None
    birthday: str | None = Field(default=None, max_length=10)
    locale: Literal["ru", "uz"] = "uz"
    goals: list[str] = Field(default_factory=list, max_length=12)
    household: list[HouseholdMemberIn] = Field(default_factory=list, max_length=8)
    marketingEmail: bool = False
    marketingTelegram: bool = False


class HouseholdMemberOut(HouseholdMemberIn):
    id: int


class ProfileOut(BaseModel):
    email: str | None
    emailVerified: bool
    birthday: str | None
    locale: str
    goals: list[str]
    household: list[HouseholdMemberOut]
    marketingEmail: bool
    marketingTelegram: bool


# --- subscriptions ------------------------------------------------------


class SubscriptionOut(BaseModel):
    id: int
    status: Literal["active", "paused", "cancelled"]
    intervalDays: int
    nextDeliveryAt: datetime | None
    items: list[OrderLineOut]
    total: int


class SubscriptionUpdate(BaseModel):
    status: Literal["active", "paused", "cancelled"] | None = None
    intervalDays: int | None = Field(default=None, ge=7, le=365)
    # Push the next delivery out by one interval, without changing anything
    # else. "Not this month" is the most common request a subscription gets.
    skipNext: bool = False


# --- marketing ----------------------------------------------------------


class SubscriberIn(BaseModel):
    email: EmailStr
    status: Literal["confirmed", "unsubscribed"]
    locale: Literal["ru", "uz"] = "uz"
    name: str | None = Field(default=None, max_length=120)


class VerifyEmailIn(BaseModel):
    userId: str
    email: EmailStr


class DueMessageOut(BaseModel):
    reminderId: str
    channel: Literal["email", "telegram"]
    campaign: str
    locale: str
    email: str | None = None
    telegramChatId: str | None = None
    name: str | None = None
    data: dict[str, Any] = Field(default_factory=dict)


class SentResult(BaseModel):
    reminderId: str
    channel: str
    ok: bool


class SentReport(BaseModel):
    results: list[SentResult]
