FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv

# Requirements first so a code change does not reinstall the world.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as a non-root user: a web process has no business owning its own image.
RUN useradd --create-home --uid 10001 govita && chown -R govita:govita /srv
USER govita

EXPOSE 8000

# Migrations run at start rather than at build: the database does not exist at
# build time, and a container that boots against an old schema is worse than
# one that waits.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
