import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const CIPHER = "aes-256-gcm";
const VERSION = "v1";

export function isIntegrationEncryptionConfigured(): boolean {
  return /^[a-f\d]{64}$/i.test(process.env.INTEGRATION_ENCRYPTION_KEY?.trim() ?? "");
}

function configuredKey(): Buffer {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY?.trim() ?? "";
  if (!/^[a-f\d]{64}$/i.test(raw)) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY must be 64 hexadecimal characters (32 random bytes)");
  }
  return Buffer.from(raw, "hex");
}

function associatedData(context: string): Buffer {
  return Buffer.from(`govita:integration-setting:${context}:${VERSION}`, "utf8");
}

/** Encrypts one setting with a fresh nonce and binds its ciphertext to its key name. */
export function encryptIntegrationValue(value: string, context: string, key = configuredKey()): string {
  if (key.length !== 32) throw new Error("Integration encryption key must be exactly 32 bytes");
  const nonce = randomBytes(12);
  const cipher = createCipheriv(CIPHER, key, nonce);
  cipher.setAAD(associatedData(context));
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, nonce.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

/** Decrypts a value only when its version, authentication tag and setting name all match. */
export function decryptIntegrationValue(ciphertext: string, context: string, key = configuredKey()): string {
  if (key.length !== 32) throw new Error("Integration encryption key must be exactly 32 bytes");
  const [version, nonceText, tagText, valueText, ...extra] = ciphertext.split(".");
  if (version !== VERSION || !nonceText || !tagText || valueText == null || extra.length > 0) {
    throw new Error("Unsupported or malformed integration setting ciphertext");
  }
  const nonce = Buffer.from(nonceText, "base64url");
  const tag = Buffer.from(tagText, "base64url");
  const encrypted = Buffer.from(valueText, "base64url");
  if (nonce.length !== 12 || tag.length !== 16) throw new Error("Malformed integration setting ciphertext");

  const decipher = createDecipheriv(CIPHER, key, nonce);
  decipher.setAAD(associatedData(context));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
