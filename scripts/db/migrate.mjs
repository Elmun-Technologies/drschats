/*
  Applies db/migrations/*.sql in name order, each once, inside a transaction.
  Runs before `next build` (Vercel) or as Fly's release_command; without
  DATABASE_URL it does nothing, so CI and a database-less build are unchanged.
*/
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("[db:migrate] DATABASE_URL not set — skipped");
  process.exit(0);
}
// A Vercel preview build must not change the production schema before the PR is merged.
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
  console.log(`[db:migrate] VERCEL_ENV=${process.env.VERCEL_ENV} — skipped`);
  process.exit(0);
}

const dir = path.resolve("db/migrations");
// prepare: false — the URL may point at a transaction pooler (PgBouncer),
// where a prepared statement does not survive to the next query.
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });

// Any number on this database; two deploys racing take turns instead of both
// applying the same non-idempotent migration.
const LOCK_ID = 7_340_001;

/*
  One transaction for the whole run, holding a transaction-scoped advisory
  lock. A session lock (pg_advisory_lock) is unsafe behind a transaction
  pooler: lock and unlock can land on different server connections. Postgres
  DDL is transactional, so a failure leaves the schema exactly as it was.
*/
try {
  const applied = await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(${LOCK_ID})`;
    await tx`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
    const done = new Set((await tx`select name from schema_migrations`).map((r) => r.name));
    const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
    const ran = [];
    for (const file of files) {
      if (done.has(file)) continue;
      await tx.unsafe(await readFile(path.join(dir, file), "utf8"));
      await tx`insert into schema_migrations (name) values (${file})`;
      ran.push(file);
    }
    return ran;
  });
  for (const file of applied) console.log(`[db:migrate] applied ${file}`);
  console.log("[db:migrate] up to date");
} catch (err) {
  console.error("[db:migrate] failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
