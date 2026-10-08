from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class ClubConfig(BaseModel):
    model_config = ConfigDict(extra='forbid')
    enabled: bool = True
    clubName: str = Field(default='GoVita VIP Salomatlik Klubi', min_length=1, max_length=120)
    shopUrl: HttpUrl = 'https://govita.uz'
    supportPhone: str = Field(default='+998 71 200 70 80', max_length=40)
    supportHours: str = Field(default='Du–Sha, 09:00–18:00', max_length=120)
    timezone: str = 'Asia/Tashkent'
    promoMaxPerWeek: int = Field(default=2, ge=0, le=7)
    quietFrom: str = '20:00'
    quietTo: str = '10:00'

    @field_validator('shopUrl')
    @classmethod
    def https_only(cls, value):
        if value.scheme != 'https' or value.username or value.password:
            raise ValueError('HTTPS URL required')
        return value

    @field_validator('timezone')
    @classmethod
    def timezone_valid(cls, value):
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError):
            raise ValueError('IANA timezone required')
        return value

    @field_validator('quietFrom', 'quietTo')
    @classmethod
    def time_valid(cls, value):
        import re
        if not re.fullmatch(r'([01]\d|2[0-3]):[0-5]\d', value):
            raise ValueError('HH:MM required')
        return value


class ContactIn(BaseModel):
    telegramUserId: int = Field(gt=0)
    contactUserId: int = Field(gt=0)
    chatId: int = Field(gt=0)
    phone: str = Field(min_length=9, max_length=32)
    name: str = Field(default='', max_length=120)
    username: str | None = Field(default=None, max_length=64)


class MemberIn(BaseModel):
    locale: Literal['uz', 'ru'] = 'uz'
    source: str | None = Field(default=None, max_length=64, pattern=r'^[A-Za-z0-9_-]+$')


class TicketIn(BaseModel):
    category: Literal['operator', 'consult', 'return', 'club-conflict'] = 'operator'
    text: str = Field(min_length=1, max_length=3000)


class ReplyIn(BaseModel):
    text: str = Field(min_length=1, max_length=3000)
    requestId: str = Field(min_length=8, max_length=64, pattern=r'^[A-Za-z0-9_-]+$')


class StageIn(BaseModel):
    stage: Literal['received', 'confirmed', 'onway', 'delivered', 'failed', 'cancelled', 'returned']


class ClaimIn(BaseModel):
    limit: int = Field(default=10, ge=1, le=25)


class ReceiptIn(BaseModel):
    leaseToken: str = Field(min_length=16, max_length=64)
    result: Literal['sent', 'retry', 'blocked']
    retryAfter: int = Field(default=60, ge=1, le=86400)


class LoginIn(BaseModel):
    password: str = Field(min_length=1, max_length=256)
