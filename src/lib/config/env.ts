import { z } from "zod";

/*
  The server's environment, typed and checked in one place.

  `process.env` is read in more than a hundred places, each with its own
  idea of "set": a blank string, a placeholder, a 10-character "secret". This
  module names the variables that decide whether a feature works, checks
  their shape once, and is what the admin's configuration card
  (/admin/integrations) and the boot check read. New code reads the value
  from here (`serverEnv()`), not from process.env.

  Every name here must be in .env.example — env-sync.test.ts holds both
  ways: a name the code reads that .env.example does not list fails the
  test, so the example file cannot drift.
*/

const optional = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : undefined));
const secret = (min: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine((v) => v === undefined || v.length >= min, `at least ${min} characters`);

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  GOVITA_PRODUCTION: optional,
  NEXT_PUBLIC_SITE_URL: optional.refine((v) => v === undefined || /^https?:\/\//.test(v), "must be an http(s) URL"),
  DATABASE_URL: optional.refine((v) => v === undefined || /^postgres(ql)?:\/\//.test(v), "must be a postgres:// URL"),
  DATABASE_POOL_MAX: optional,
  ADMIN_SESSION_SECRET: secret(32),
  INTEGRATION_ENCRYPTION_KEY: secret(32),
  MESSAGE_LINK_SECRET: secret(16),
  LOYALTY_SECRET: secret(16),
  EMAIL_TOKEN_SECRET: secret(16),
  CRON_SECRET: secret(16),
  BOT_API_KEY: secret(32),
  RATE_LIMIT_SALT: optional,
  TELEGRAM_BOT_TOKEN: optional,
  TELEGRAM_CHAT_ID: optional,
  TELEGRAM_CLUB_BOT_TOKEN: optional,
  RESEND_API_KEY: optional,
  ESKIZ_EMAIL: optional,
  ESKIZ_PASSWORD: optional,
  BUCKET_NAME: optional,
  AWS_ENDPOINT_URL_S3: optional,
  CSP_MODE: optional,
  CSP_REPORT_URI: optional,
  MESSAGE_WORKER: optional,
  SMS_FAKE: optional,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export interface EnvCheck {
  env: ServerEnv | null;
  /** "NAME: problem" — the value itself is never included. */
  issues: string[];
}

export function checkEnv(source: Record<string, string | undefined> = process.env): EnvCheck {
  const parsed = serverEnvSchema.safeParse(source);
  if (parsed.success) return { env: parsed.data, issues: [] };
  return { env: null, issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
}

/** The checked environment; a malformed variable reads as unset (and is listed by checkEnv). */
export function serverEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  const result = checkEnv(source);
  if (result.env) return result.env;
  const clean: Record<string, string | undefined> = { ...source };
  for (const issue of result.issues) delete clean[issue.split(":")[0]];
  return serverEnvSchema.parse(clean);
}

export function isLiveEnv(source: Record<string, string | undefined> = process.env): boolean {
  return source.GOVITA_PRODUCTION === "1" || source.VERCEL_ENV === "production";
}
