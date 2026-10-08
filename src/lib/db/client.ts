import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/*
  One pool per server process. In development the module is re-evaluated on
  every edit, so the pool is parked on globalThis or each reload would leak a
  connection set. Serverless functions get a small pool: many instances, each
  with a few connections, is what the database actually sees.
*/
const url = process.env.DATABASE_URL?.trim();

export const isDbConfigured = Boolean(url);

type Db = PostgresJsDatabase<typeof schema>;
const holder = globalThis as unknown as { __govitaDb?: Db };

export function getDb(): Db {
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!holder.__govitaDb) {
    const sql = postgres(url, {
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: () => {},
    });
    holder.__govitaDb = drizzle(sql, { schema });
  }
  return holder.__govitaDb;
}
