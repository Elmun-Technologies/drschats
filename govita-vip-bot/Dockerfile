FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY bot ./bot
RUN useradd --uid 10001 --create-home bot && mkdir /data && chown bot:bot /data
USER bot
ENV DB_PATH=/data/govita.sqlite3 PYTHONUNBUFFERED=1
CMD ["python", "-m", "bot"]
