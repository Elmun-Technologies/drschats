import "server-only";

import { sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { checkEnv, isLiveEnv } from "@/lib/config/env";
import { cspMode } from "@/lib/security/csp";
import { getIntegrationAdminOverview } from "@/lib/integrations/settings";
import { workerHealth, type WorkerHealth } from "./health";

/*
  One card on /admin/integrations that says what is switched on, from the
  environment and the panel together — "why does nobody get SMS" answered in
  one look instead of a shell on the server. Names and on/off only; never a
  value.
*/

export interface ConfigItem {
  name: string;
  on: boolean;
  detail: string;
}

export interface ConfigStatus {
  items: ConfigItem[];
  issues: string[];
  worker: WorkerHealth | null;
  csp: { directive: string; blocked: string; count: number }[];
}

export async function configStatus(): Promise<ConfigStatus> {
  const env = process.env;
  const { issues } = checkEnv(env);
  const live = isLiveEnv(env);
  const overview = await getIntegrationAdminOverview().catch(() => null);
  const [worker, csp] = await Promise.all([
    isDbConfigured ? workerHealth().catch(() => null) : Promise.resolve(null),
    isDbConfigured ? cspTop().catch(() => []) : Promise.resolve([]),
  ]);
  const has = (name: string) => Boolean(env[name]?.trim());
  const items: ConfigItem[] = [
    { name: "Maʼlumotlar bazasi", on: isDbConfigured, detail: isDbConfigured ? "DATABASE_URL" : "yoʻq — sayt oʻrnatilgan katalogda" },
    { name: "Operator Telegram guruhi", on: Boolean(overview?.operator.configured), detail: "buyurtma xabarlari" },
    { name: "Email (Resend)", on: Boolean(overview?.email.configured), detail: has("EMAIL_TOKEN_SECRET") ? "EMAIL_TOKEN_SECRET bor" : "EMAIL_TOKEN_SECRET yoʻq" },
    { name: "SMS (Eskiz)", on: Boolean(overview?.sms.configured), detail: "kodlar, buyurtma SMS, marketing" },
    {
      name: "Xabar ishchisi (worker)",
      on: worker?.state === "ok",
      detail: env.MESSAGE_WORKER === "off" ? "MESSAGE_WORKER=off" : worker?.lastTickAgoSec != null ? `oxirgi aylanish ${worker.lastTickAgoSec} s oldin` : "hali ishlamagan",
    },
    { name: "Cron endpoint", on: has("CRON_SECRET"), detail: "/api/cron/* — CRON_SECRET" },
    { name: "Integratsiya kalitlarini shifrlash", on: has("INTEGRATION_ENCRYPTION_KEY"), detail: "INTEGRATION_ENCRYPTION_KEY" },
    { name: "Xabar havolalari kaliti", on: has("MESSAGE_LINK_SECRET"), detail: live ? "MESSAGE_LINK_SECRET (live: majburiy)" : "MESSAGE_LINK_SECRET" },
    { name: "Sodiqlik kaliti", on: has("LOYALTY_SECRET"), detail: live ? "LOYALTY_SECRET (live: majburiy)" : "LOYALTY_SECRET" },
    { name: "Rasm yuklash (Tigris)", on: has("BUCKET_NAME") && has("AWS_ENDPOINT_URL_S3"), detail: "BUCKET_NAME, AWS_*" },
    { name: "Telegram klub boti", on: has("BOT_API_KEY") && has("TELEGRAM_CLUB_BOT_TOKEN"), detail: "BOT_API_KEY, TELEGRAM_CLUB_BOT_TOKEN" },
    { name: "Content-Security-Policy", on: cspMode(env.CSP_BUILD_MODE ?? env.CSP_MODE) === "enforce", detail: `rejim: ${env.CSP_BUILD_MODE ?? cspMode(env.CSP_MODE)} (build vaqtida)` },
  ];
  return { items, issues, worker, csp };
}

async function cspTop(): Promise<ConfigStatus["csp"]> {
  const rows = (await getDb().execute(sql`
    select directive, blocked, sum(count)::int as count from csp_reports
    where day > (now() - interval '7 days')::date
    group by directive, blocked order by count desc limit 8`)) as unknown as { directive: string; blocked: string; count: number }[];
  return rows.map((r) => ({ directive: r.directive, blocked: r.blocked, count: Number(r.count) }));
}
