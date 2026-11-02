import { createHash } from "node:crypto";
import { decryptIntegrationValue, encryptIntegrationValue } from "@/lib/integrations/crypto";

/*
  The TOTP secret is stored encrypted (AES-256-GCM) with a key derived from
  ADMIN_SESSION_SECRET — present on every deploy that has an admin panel, so
  two-factor sign-in needs no extra key. Rotating ADMIN_SESSION_SECRET signs
  everyone out and also voids these secrets: each admin then signs in with a
  recovery code and enrols again.
*/
function key(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || (process.env.NODE_ENV === "production" ? "" : "dev-only-admin-session-secret-not-for-production");
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is required for two-factor sign-in");
  return createHash("sha256").update(`govita:admin-totp:v1:${secret}`).digest();
}

export function sealTotpSecret(secret: string, adminId: number): string {
  return encryptIntegrationValue(secret, `admin-totp:${adminId}`, key());
}

export function openTotpSecret(sealed: string, adminId: number): string | null {
  try {
    return decryptIntegrationValue(sealed, `admin-totp:${adminId}`, key());
  } catch {
    return null;
  }
}
