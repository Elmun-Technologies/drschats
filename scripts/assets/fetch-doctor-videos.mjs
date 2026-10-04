#!/usr/bin/env node
/**
 * Pulls the doctor's videos from @alimkhanov_pharm into this repo.
 *
 * Run this on a machine that can reach Instagram — a laptop, not the build
 * sandbox (the sandbox's egress allowlist closes the TLS connection to
 * instagram.com, which is why this is a script and not part of the build):
 *
 *     npm run videos:doctor                 # everything on the profile
 *     npm run videos:doctor -- --limit 20   # newest 20
 *     npm run videos:doctor -- --url <reel-url> --url <reel-url>
 *     npm run videos:doctor -- --cookies-from-browser chrome   # if IG asks
 *     npm run videos:doctor -- --manifest-only   # rebuild the list, no download
 *
 * What it does:
 *
 *   public/videos/doctor/<id>.mp4       the video, hosted by us
 *   public/videos/doctor/<id>.jpg       a poster frame for it
 *   src/lib/content/doctor-videos.generated.json   machine-written manifest
 *
 * What it deliberately does NOT do: decide where a video appears. Which
 * product a clip belongs to, whether the doctor's written consent is on file,
 * and whether the product is OTC are human facts — they go in
 * src/lib/content/doctor-videos.map.json, which a person edits. A downloaded
 * video with no map entry renders nowhere, on purpose: publishing is a
 * decision, not a side effect of downloading.
 *
 * Requires yt-dlp (https://github.com/yt-dlp/yt-dlp):
 *     brew install yt-dlp     |  pipx install yt-dlp  |  pip install yt-dlp
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const VIDEO_DIR = join(ROOT, "public/videos/doctor");
const MANIFEST = join(ROOT, "src/lib/content/doctor-videos.generated.json");
const PROFILE = "https://www.instagram.com/alimkhanov_pharm/";

// ── args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const urls = [];
let limit = 50;
let cookiesFromBrowser = null;
let cookiesFile = null;
let ytDlp = "yt-dlp";
let manifestOnly = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--url") urls.push(args[++i]);
  else if (a === "--limit") limit = Number(args[++i]);
  else if (a === "--cookies-from-browser") cookiesFromBrowser = args[++i];
  else if (a === "--cookies") cookiesFile = args[++i];
  else if (a === "--yt-dlp") ytDlp = args[++i];
  else if (a === "--manifest-only") manifestOnly = true;
  else if (a === "--help" || a === "-h") {
    console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0]);
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${a}`);
    process.exit(2);
  }
}

// ── yt-dlp present? ─────────────────────────────────────────────────────────
// Skipped with --manifest-only: that mode reads the .info.json files already
// in public/videos/doctor, so it works offline and on a machine without yt-dlp.
if (!manifestOnly) try {
  const version = execFileSync(ytDlp, ["--version"], { encoding: "utf8" }).trim();
  console.log(`yt-dlp ${version}`);
} catch {
  console.error(
    [
      "yt-dlp is not installed (or not on PATH).",
      "",
      "  brew install yt-dlp        # macOS",
      "  pipx install yt-dlp        # any OS, isolated",
      "  pip install yt-dlp         # plain pip",
      "",
      "Then run this script again.",
    ].join("\n"),
  );
  process.exit(1);
}

mkdirSync(VIDEO_DIR, { recursive: true });

// ── download ────────────────────────────────────────────────────────────────
const targets = urls.length > 0 ? urls : [PROFILE];
const dlArgs = [
  "--ignore-errors",
  "--no-warnings",
  "--no-progress",
  "--write-thumbnail",
  "--write-info-json",
  "--merge-output-format",
  "mp4",
  "-f",
  "best[ext=mp4]/best",
  "-o",
  join(VIDEO_DIR, "%(id)s.%(ext)s"),
];
if (!urls.length) dlArgs.push("--playlist-end", String(limit));
if (cookiesFromBrowser) dlArgs.push("--cookies-from-browser", cookiesFromBrowser);
if (cookiesFile) dlArgs.push("--cookies", cookiesFile);
dlArgs.push(...targets);

if (manifestOnly) {
  console.log(`\n--manifest-only: rebuilding the manifest from ${VIDEO_DIR} without downloading.\n`);
} else {
  console.log(`\nFetching: ${targets.join(", ")} (limit ${urls.length ? urls.length : limit})\n`);
  const started = spawnSync(ytDlp, dlArgs, { stdio: "inherit" });

  if (started.error) {
    console.error(`Could not run yt-dlp: ${started.error.message}`);
    process.exit(1);
  }
}

// ── build the manifest from the .info.json files yt-dlp leaves behind ────────
const infoFiles = readdirSync(VIDEO_DIR).filter((f) => f.endsWith(".info.json"));
const posterExts = ["jpg", "jpeg", "webp", "png"];

function posterFor(id) {
  for (const ext of posterExts) {
    const candidate = `${id}.${ext}`;
    if (existsSync(join(VIDEO_DIR, candidate))) return `/videos/doctor/${candidate}`;
  }
  return null;
}

const videos = infoFiles
  .map((file) => {
    const info = JSON.parse(readFileSync(join(VIDEO_DIR, file), "utf8"));
    const id = String(info.id ?? "").trim();
    if (!id) return null;
    const videoFile = `${id}.mp4`;
    if (!existsSync(join(VIDEO_DIR, videoFile))) return null;

    // Instagram descriptions are long and full of hashtags; the first line is
    // the only part usable as a label for a human to map.
    const description = String(info.description ?? info.title ?? "");
    const title = description.split("\n")[0].replace(/#\S+/g, "").trim().slice(0, 120);

    return {
      id,
      title,
      url: info.webpage_url ?? "",
      file: `/videos/doctor/${videoFile}`,
      poster: posterFor(id),
      durationSeconds: Math.round(info.duration ?? 0),
      uploadedAt: info.upload_date
        ? `${info.upload_date.slice(0, 4)}-${info.upload_date.slice(4, 6)}-${info.upload_date.slice(6, 8)}`
        : "",
      width: info.width ?? null,
      height: info.height ?? null,
    };
  })
  .filter(Boolean)
  .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));

writeFileSync(MANIFEST, `${JSON.stringify({ fetchedAt: new Date().toISOString(), videos }, null, 2)}\n`);

// ── report ──────────────────────────────────────────────────────────────────
console.log(`\n${videos.length} video(s) in public/videos/doctor/`);
console.log(`Manifest: src/lib/content/doctor-videos.generated.json\n`);

if (videos.length > 0) {
  console.log("Downloaded:");
  for (const v of videos) {
    const duration = v.durationSeconds ? `${v.durationSeconds}s` : "?";
    console.log(`  ${v.id.padEnd(14)} ${String(v.uploadedAt).padEnd(11)} ${duration.padStart(6)}  ${v.title}`);
  }

  const mapPath = join(ROOT, "src/lib/content/doctor-videos.map.json");
  const map = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, "utf8")) : {};
  const unmapped = videos.filter((v) => !map[v.id]);

  if (unmapped.length > 0) {
    console.log(
      [
        "",
        `${unmapped.length} of them are not mapped to a product yet, so they render nowhere.`,
        "Tell the developer (or edit src/lib/content/doctor-videos.map.json) which product",
        "each clip belongs to, for example:",
        "",
        '  "DQxYz12345": {',
        '    "productSlug": "delical-vanil-200ml",',
        '    "doctorName": "Dr. <ism>",',
        '    "consentOnFile": true,',
        '    "otc": true,',
        '    "caption": { "uz": "<bir qator>", "ru": "<одна строка>" }',
        "  }",
      ].join("\n"),
    );
  }
}
