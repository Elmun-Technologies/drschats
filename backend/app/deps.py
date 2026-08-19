from hmac import compare_digest
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_session
from app.models import User
from app.security import decode_access_token

SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def _user_from_header(
    session: AsyncSession, authorization: str | None
) -> User | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    user_id = decode_access_token(authorization.split(" ", 1)[1].strip())
    if user_id is None:
        return None
    return await session.get(User, user_id)


async def current_user_optional(
    session: SessionDep,
    authorization: Annotated[str | None, Header()] = None,
) -> User | None:
    """For endpoints that work signed in or out — checkout, above all."""
    return await _user_from_header(session, authorization)


async def current_user(
    session: SessionDep,
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    user = await _user_from_header(session, authorization)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


CurrentUser = Annotated[User, Depends(current_user)]
OptionalUser = Annotated[User | None, Depends(current_user_optional)]


async def service_caller(
    x_service_key: Annotated[str | None, Header()] = None,
) -> None:
    """
    Guards the endpoints the storefront calls as itself rather than as a
    customer: writing consent, marking an address verified, reading the send
    queue.

    An unset key locks the endpoints rather than opening them. Anything else
    would mean a service that can email every customer ships with no door.
    """
    expected = get_settings().marketing_api_key
    if not expected or not x_service_key or not compare_digest(x_service_key, expected):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid service key")


ServiceCaller = Annotated[None, Depends(service_caller)]
