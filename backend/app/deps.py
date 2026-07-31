from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

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
