"""Server-to-server transport for GoVita's own admin backend.

No ShopFlow dependency. Endpoint paths/data models must be agreed with the
admin backend owner before a production adapter is enabled. See
 docs/GOVITA-ADMIN-HANDOFF.md. This transport alone is not an integration.
"""
from urllib.parse import urlsplit

import aiohttp


class BackendError(Exception):
    def __init__(self, status, code):
        self.status, self.code = status, code
        # Never include URL, keys, response bodies or customer data in errors.
        super().__init__(f"GoVita backend {status}: {code}")


class GoVitaBackend:
    def __init__(self, base_url, key, session=None):
        u = urlsplit(base_url)
        if (u.scheme != 'https' or not u.netloc or u.username or u.password
                or u.query or u.fragment):
            raise ValueError('GOVITA_API_URL must be a clean HTTPS base URL')
        if not key.strip() or any(c.isspace() for c in key):
            raise ValueError('GOVITA_API_KEY must be a nonempty service key without whitespace')
        self.base = base_url.rstrip('/')
        self.key = key
        self.session = session
        self.owned = session is None

    async def open(self):
        if self.session is None:
            self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=8))
        return self

    async def close(self):
        if self.owned and self.session:
            await self.session.close()

    async def request(self, method, path, *, body=None, params=None):
        if (not path.startswith('/') or path.startswith('//')
                or any(c in path for c in ('?', '#', '\\'))
                or '..' in path or any(ord(c) < 32 for c in path)):
            raise ValueError('Use a relative endpoint path; pass query parameters separately')
        if self.session is None:
            raise RuntimeError('Open the backend client before making requests')
        # No automatic retries, especially for order creation. An upstream
        # timeout can mean the order was already created. Reconcile by a
        # backend-supported idempotency key once the contract is agreed.
        try:
            async with self.session.request(method, self.base + path,
                    headers={'Authorization': f'Bearer {self.key}'},
                    json=body, params=params, allow_redirects=False) as response:
                if not 200 <= response.status < 300:
                    raise BackendError(response.status, 'request_failed')
                return await response.json()
        except (aiohttp.ClientError, TimeoutError, ValueError) as exc:
            raise BackendError(503, 'upstream_unavailable') from exc
