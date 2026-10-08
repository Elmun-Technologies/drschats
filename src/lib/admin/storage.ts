import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomBytes } from "node:crypto";

/*
  Product photos go to S3-compatible object storage — Tigris on Fly.io, which
  `fly storage create` provisions with exactly these variable names. Without
  them the panel still works and takes image URLs typed by hand.

  Public URL: STORAGE_PUBLIC_URL if set (a CDN in front), else Tigris's
  virtual-host form https://<bucket>.fly.storage.tigris.dev/<key>.
*/
const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const bucket = process.env.BUCKET_NAME;

export const isStorageConfigured = Boolean(
  endpoint && bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
);

export function storagePublicBase(): string | null {
  if (!bucket) return null;
  return (process.env.STORAGE_PUBLIC_URL?.replace(/\/+$/, "") || `https://${bucket}.fly.storage.tigris.dev`);
}

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

let client: S3Client | null = null;

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!isStorageConfigured) throw new Error("storage-not-configured");
  const ext = TYPES[file.type];
  if (!ext) throw new Error("unsupported-type");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("too-large");
  client ??= new S3Client({ region: process.env.AWS_REGION || "auto", endpoint });
  const key = `${folder}/${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${storagePublicBase()}/${key}`;
}
