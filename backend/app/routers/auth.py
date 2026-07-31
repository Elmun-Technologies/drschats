from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from app.deps import CurrentUser, SessionDep
from app.models import Order, User
from app.schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut
from app.security import (
    create_access_token,
    hash_password,
    normalise_phone,
    verify_password,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: SessionDep) -> TokenResponse:
    phone = normalise_phone(payload.phone)

    existing = await session.scalar(select(User).where(User.phone == phone))
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Phone already registered")

    user = User(phone=phone, name=payload.name, password_hash=hash_password(payload.password))
    session.add(user)
    await session.flush()

    # Orders placed before this account existed belong to the same person; the
    # phone is the only link, and claiming them here is what makes "my orders"
    # useful on day one instead of empty.
    await session.execute(
        update(Order)
        .where(Order.user_id.is_(None), Order.customer_phone == phone)
        .values(user_id=user.id)
    )
    await session.commit()

    return TokenResponse(accessToken=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: SessionDep) -> TokenResponse:
    phone = normalise_phone(payload.phone)
    user = await session.scalar(select(User).where(User.phone == phone))

    # One message for both "no such phone" and "wrong password": splitting them
    # turns the endpoint into a way to test which phone numbers are registered.
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid phone or password")

    return TokenResponse(accessToken=create_access_token(user.id))


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> UserOut:
    return UserOut(id=user.id, name=user.name, phone=user.phone)
