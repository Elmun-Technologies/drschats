"""
The sign-in code key is not the JWT signing key.

Sharing one secret between two systems that protect different things means a
single leak breaks both. These tests pin the separation down, because it is the
kind of property that disappears silently: someone tidies `hash_code()`, passes
`settings.jwt_secret` because it is there and is a secret, and every test in the
suite still passes while the design guarantee is gone.

The last group covers the part that actually protects a live deployment. A
derived key separates the two *values* but not their *fates* — whoever holds
JWT_SECRET can recompute it — so production must supply a real independent
secret, and refuses to start otherwise.
"""

import hashlib
import hmac
import os
import secrets
import subprocess
import sys

import pytest

from app.config import Settings, get_settings
from app.otp import hash_code, otp_key, verify_code_hash

PHONE = "998901234567"
CODE = "482913"


# --- the key itself -------------------------------------------------------


def test_derived_key_is_not_the_jwt_secret():
    """
    The fallback must not simply be JWT_SECRET under another name.

    Checked against both forms it could take: the raw bytes, and a hex encoding
    an implementation might reach for instead.
    """
    settings = Settings(jwt_secret="test-secret", otp_hmac_key="")
    key = otp_key(settings)

    assert key != b"test-secret"
    assert key != settings.jwt_secret.encode()
    assert key != settings.jwt_secret.encode().hex().encode()
    # A digest, not a passphrase: fixed 32-byte output.
    assert len(key) == 32


def test_derived_key_is_stable():
    """Same inputs give the same key, so codes issued now still verify later."""
    a = otp_key(Settings(jwt_secret="test-secret", otp_hmac_key=""))
    b = otp_key(Settings(jwt_secret="test-secret", otp_hmac_key=""))
    assert a == b

    # A different JWT secret gives a different derived key.
    c = otp_key(Settings(jwt_secret="other-secret", otp_hmac_key=""))
    assert a != c


def test_explicit_key_overrides_the_derivation():
    """Setting OTP_HMAC_KEY changes the key, which is the point of having it."""
    derived = otp_key(Settings(jwt_secret="test-secret", otp_hmac_key=""))
    explicit = otp_key(Settings(jwt_secret="test-secret", otp_hmac_key="independent-secret"))

    assert explicit != derived
    assert explicit == b"independent-secret"


def test_explicit_key_decouples_the_two_secrets():
    """
    The property that matters: rotating JWT_SECRET does not rotate the code key.

    With a real OTP_HMAC_KEY the two are genuinely separate secrets, so changing
    one leaves the other — and everything hashed under it — untouched.
    """
    before = otp_key(Settings(jwt_secret="secret-one", otp_hmac_key="shared-otp-key"))
    after = otp_key(Settings(jwt_secret="secret-two", otp_hmac_key="shared-otp-key"))
    assert before == after

    # And the converse: without it the two move together. That coupling is
    # exactly what the production boot check exists to prevent.
    coupled_before = otp_key(Settings(jwt_secret="secret-one", otp_hmac_key=""))
    coupled_after = otp_key(Settings(jwt_secret="secret-two", otp_hmac_key=""))
    assert coupled_before != coupled_after


# --- through the public function -----------------------------------------


def test_a_stored_hash_does_not_verify_under_the_jwt_secret(monkeypatch):
    """
    The separation is observable through `hash_code()`, not just through the key.

    A hash produced by the real function must not be reproducible by someone
    holding only JWT_SECRET and a copy of the database. This is the assertion
    that fails if `hash_code()` is quietly reverted to keying directly off
    `settings.jwt_secret`.
    """
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.delenv("OTP_HMAC_KEY", raising=False)
    get_settings.cache_clear()
    try:
        stored = hash_code(PHONE, CODE)

        naive = hmac.new(
            b"test-secret", f"{PHONE}:{CODE}".encode(), hashlib.sha256
        ).hexdigest()
        assert stored != naive

        # The real code still verifies, so this is a re-keying and not a break
        # in the flow; a wrong code still does not.
        assert verify_code_hash(PHONE, CODE, stored)
        assert not verify_code_hash(PHONE, "000000", stored)
    finally:
        get_settings.cache_clear()


# --- the production boot check -------------------------------------------

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# A valid JWT secret throughout, so whichever check fires is the intended one.
BOOT_ENV = {
    "ENVIRONMENT": "production",
    "JWT_SECRET": "a-real-production-secret",
    "DATABASE_URL": "sqlite+aiosqlite:///:memory:",
}


def boot(**overrides: str) -> subprocess.CompletedProcess[str]:
    """
    Import the app the way a server does, and report whether it started.

    The guards live at module level, so importing *is* the thing under test —
    and a subprocess is the only way to run them more than once in a suite.
    """
    env = {k: v for k, v in os.environ.items() if k not in BOOT_ENV and k != "OTP_HMAC_KEY"}
    return subprocess.run(
        [sys.executable, "-c", "import app.main"],
        cwd=BACKEND_DIR,
        env={**env, **BOOT_ENV, **overrides},
        capture_output=True,
        text=True,
        timeout=180,
    )


def test_production_refuses_to_boot_without_an_otp_key():
    """No OTP_HMAC_KEY in production is a boot failure, not a silent fallback."""
    result = boot(OTP_HMAC_KEY="")

    assert result.returncode != 0, result.stderr[-2000:]
    assert "OTP_HMAC_KEY must be set in production" in result.stderr


def test_production_boots_with_an_otp_key():
    """The same import succeeds once the independent secret exists."""
    result = boot(OTP_HMAC_KEY="an-independent-otp-secret-value-0123456789")

    assert result.returncode == 0, result.stderr[-2000:]


def test_production_still_refuses_the_placeholder_jwt_secret():
    """
    The pre-existing guard, kept in view beside the new one.

    Both are "fail at boot rather than at the first forged token" checks and
    they are easy to break together, so the pair is tested as a pair.
    """
    result = boot(JWT_SECRET="dev-only-change-me", OTP_HMAC_KEY="an-independent-otp-secret-value-0123456789")

    assert result.returncode != 0, result.stderr[-2000:]
    assert "JWT_SECRET must be set in production" in result.stderr


def test_production_still_refuses_debug_echo():
    """The third boot guard, for the same reason as the one above."""
    result = boot(OTP_HMAC_KEY="an-independent-otp-secret-value-0123456789", OTP_DEBUG_ECHO="true")

    assert result.returncode != 0, result.stderr[-2000:]
    assert "OTP_DEBUG_ECHO must be off in production" in result.stderr


@pytest.mark.parametrize("explicit", ["", "an-independent-otp-secret-value-0123456789"])
def test_both_key_sources_are_usable(explicit):
    """
    Dev fallback and prod secret both yield a usable HMAC key.

    They differ in shape and that is intended: the derived key is a 32-byte
    digest, while an explicit secret is used exactly as the operator wrote it.
    A length requirement on the explicit one belongs at boot, where a human can
    read the error — see the production tests above — not in this function,
    which would otherwise have to invent a policy the caller did not ask for.
    """
    key = otp_key(Settings(jwt_secret="test-secret", otp_hmac_key=explicit))
    assert isinstance(key, bytes) and len(key) > 0
    if explicit:
        assert key == explicit.encode()
    else:
        assert len(key) == 32


def test_production_refuses_a_short_otp_key():
    """
    Present but weak is refused too.

    A one-word secret would pass a "is it set" check and then under-protect
    every stored code, so the boot guard measures it rather than trusting it.
    """
    result = boot(OTP_HMAC_KEY="short")

    assert result.returncode != 0, result.stderr[-2000:]
    assert "at least 32 bytes" in result.stderr
    assert "token_urlsafe" in result.stderr


def test_production_accepts_a_generated_key():
    """The command .env.example documents produces a key that passes."""
    generated = secrets.token_urlsafe(32)
    assert len(generated.encode()) >= 32

    result = boot(OTP_HMAC_KEY=generated)

    assert result.returncode == 0, result.stderr[-2000:]
