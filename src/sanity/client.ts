import { createClient } from "next-sanity";

/*
  `.env.example` ships the Sanity vars as empty strings, and `?? ` only guards
  against undefined — so a blank projectId reached createClient and threw
  "Configuration must contain projectId" on every page. `||` treats the empty
  string as absent too, which is what "leave blank to use built-in static
  content" is supposed to mean.
*/
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN || undefined;

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: true,
  token,
});

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});
