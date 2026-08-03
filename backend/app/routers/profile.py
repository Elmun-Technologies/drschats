from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import delete

from app.deps import CurrentUser, SessionDep
from app.models import HouseholdMember
from app.schemas import (
    HouseholdMemberOut,
    ProfileOut,
    ProfileUpdate,
)

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

"""
The customer's own copy of what they told us.

The storefront keeps the same profile in the browser, which is what makes
personalisation work for visitors who never sign in. This endpoint exists so
that a customer who *does* sign in keeps their goals, their household and their
consent across devices — and so the marketing queue has something to read.

The browser is the source of truth for the fields it owns; a PATCH replaces
them wholesale rather than merging, because a merge across two devices produces
a household nobody typed.
"""


def _to_out(user, verified: bool) -> ProfileOut:
    return ProfileOut(
        email=user.email,
        emailVerified=verified,
        birthday=user.birthday,
        locale=user.locale,
        goals=list(user.goals or []),
        household=[
            HouseholdMemberOut(
                id=member.id,
                relation=member.relation,
                name=member.name,
                birthday=member.birthday,
            )
            for member in user.household
        ],
        marketingEmail=user.marketing_email,
        marketingTelegram=user.marketing_telegram,
    )


@router.get("/me", response_model=ProfileOut)
async def read_profile(user: CurrentUser) -> ProfileOut:
    return _to_out(user, user.email_verified_at is not None)


@router.patch("/me", response_model=ProfileOut)
async def update_profile(
    payload: ProfileUpdate, session: SessionDep, user: CurrentUser
) -> ProfileOut:
    # A changed address is an unverified address. Anything else would let a
    # profile edit move confirmed consent onto an inbox nobody proved they own.
    if payload.email and payload.email != user.email:
        user.email = str(payload.email)
        user.email_verified_at = None
    elif payload.email is None:
        user.email = None
        user.email_verified_at = None

    user.birthday = payload.birthday
    user.locale = payload.locale
    user.goals = payload.goals

    if (
        payload.marketingEmail != user.marketing_email
        or payload.marketingTelegram != user.marketing_telegram
    ):
        user.consent_updated_at = datetime.now(timezone.utc)
    user.marketing_email = payload.marketingEmail
    user.marketing_telegram = payload.marketingTelegram

    await session.execute(
        delete(HouseholdMember).where(HouseholdMember.user_id == user.id)
    )
    for member in payload.household:
        session.add(
            HouseholdMember(
                user_id=user.id,
                relation=member.relation,
                name=member.name,
                birthday=member.birthday,
            )
        )

    await session.commit()
    await session.refresh(user)
    return _to_out(user, user.email_verified_at is not None)
