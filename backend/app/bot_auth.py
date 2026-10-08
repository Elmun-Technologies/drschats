from hmac import compare_digest
from typing import Annotated
import hashlib

from fastapi import Depends, Header, HTTPException, Request
import jwt

from app.config import get_settings

COOKIE = 'gv_bot_admin'


async def bot_caller(authorization: Annotated[str | None, Header()] = None):
    expected = get_settings().bot_api_key
    supplied = authorization[7:] if authorization and authorization.startswith('Bearer ') else ''
    if not expected or not supplied or not compare_digest(supplied, expected):
        raise HTTPException(401, 'invalid_bot_key')


BotCaller = Annotated[None, Depends(bot_caller)]


def credential_version():
    return hashlib.sha256(get_settings().bot_admin_key.encode()).hexdigest()


async def admin_caller(request: Request):
    settings = get_settings()
    if not settings.bot_admin_key or not settings.bot_admin_session_secret:
        raise HTTPException(503, 'bot_admin_not_configured')
    token = request.cookies.get(COOKIE)
    try:
        claims = jwt.decode(token or '', settings.bot_admin_session_secret,
                            algorithms=['HS256'], audience='govita-bot-admin',
                            options={'require': ['exp', 'iat', 'aud', 'sub', 'csrf', 'version']})
    except jwt.PyJWTError as exc:
        raise HTTPException(401, 'admin_login_required') from exc
    if claims['sub'] != 'bot-admin' or not compare_digest(claims['version'], credential_version()):
        raise HTTPException(401, 'admin_login_required')
    if request.method not in ('GET', 'HEAD', 'OPTIONS'):
        csrf = request.headers.get('X-CSRF-Token', '')
        if not csrf or not compare_digest(csrf, claims['csrf']):
            raise HTTPException(403, 'csrf_failed')
        origin = request.headers.get('origin')
        # Exact host match works through the preview reverse proxy as well.
        from urllib.parse import urlsplit
        if origin and urlsplit(origin).netloc != request.headers.get('host'):
            raise HTTPException(403, 'origin_failed')
    return claims


AdminCaller = Annotated[dict, Depends(admin_caller)]
