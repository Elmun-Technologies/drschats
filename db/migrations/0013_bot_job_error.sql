-- Why a bot message was never delivered. Until now the bot could only say
-- "retry" or "blocked": a message Telegram rejects for good (too long, bad
-- HTML entity, chat not found) was retried eight times at a minute's interval
-- and only then failed — eight minutes of a queue slot and a customer who
-- never heard anything. The bot now reports the failure with its reason on
-- the first attempt, and /admin/bot/outbox shows it next to "Yuborilmadi".
alter table bot_jobs add column error text;
