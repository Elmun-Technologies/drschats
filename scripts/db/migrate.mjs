/*
  Applies db/migrations/*.sql in name order, each once, inside a transaction.
  Runs before `next build`; without DATABASE_URL it does nothing, so CI and a
  database-less deploy build exactly as before.
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
const sql = postgres(url, { max: 1, onnotice: () => {} });

// Any number on this database; two builds racing take turns instead of both
// applying the same non-idempotent migration.
const LOCK_ID = 7_340_001;

try {
  await sql`select pg_advisory_lock(${LOCK_ID})`;
  await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const done = new Set((await sql`select name from schema_migrations`).map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (done.has(file)) continue;
    const body = await readFile(path.join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into schema_migrations (name) values (${file})`;
    });
    console.log(`[db:migrate] applied ${file}`);
  }
  console.log("[db:migrate] up to date");
} catch (err) {
  console.error("[db:migrate] failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql`select pg_advisory_unlock(${LOCK_ID})`.catch(() => {});
  await sql.end();
}
