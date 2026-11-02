-- A query that runs away (a bad plan, a lock queue) stops after 30 s instead
-- of holding a pooled connection until the pool is gone. Set on the role, so
-- it holds behind the transaction pooler too (a client startup parameter
-- would be refused by PgBouncer). scripts/db/migrate.mjs lifts it for its own
-- transaction, so a long migration is not cut off.
--
-- Managed Postgres may not let the app role change its own defaults; then this
-- is a no-op with a notice and nothing else changes.
do $$
begin
  execute format('alter role %I set statement_timeout = %L', current_user, '30s');
  execute format('alter role %I set idle_in_transaction_session_timeout = %L', current_user, '60s');
exception when others then
  raise notice 'statement_timeout not set on role %: %', current_user, sqlerrm;
end
$$;
