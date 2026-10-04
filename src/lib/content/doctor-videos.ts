import generated from "./doctor-videos.generated.json";
import mapping from "./doctor-videos.map.json";
import type { Locale } from "@/lib/i18n/routing";

/*
  Doctor videos on product pages.

  Two files, two jobs:

    doctor-videos.generated.json   written by scripts/assets/fetch-doctor-videos.mjs
                                   (which video files exist, what they are called)
    doctor-videos.map.json         written by a person
                                   (which product, whose consent, is it OTC, caption)

  A downloaded clip renders nowhere until a person maps it. The client's own
  list sets two gates for that map entry, and both must be true:

    - CONSENT. The doctor appears by name next to a product, which is a medical
      endorsement of that product. That needs his written consent on file,
      separately from the consent to post the video at all.
    - OTC ONLY. A prescription product cannot carry a video recommendation at
      all, no matter who is in it.

  Keeping the machine-written list and the human decisions apart means the
  fetch script can be re-run any time (new reels, re-download after a failed
  one) without ever touching the published set by accident.
*/

const VIDEO_DIR_PREFIX = "/videos/doctor/";

export interface GeneratedVideo {
  id: string;
  title: string;
  url: string;
  file: string;
  poster: string | null;
  durationSeconds: number;
  uploadedAt: string;
  width: number | null;
  height: number | null;
}

export interface DoctorVideoMapEntry {
  /** Catalogue slug the clip belongs to. */
  productSlug: string;
  /** Doctor's name, as it should read under the video. */
  doctorName: string;
  /** Written consent from the doctor, on file. No consent → no video. */
  consentOnFile: boolean;
  /** Over-the-counter product. Prescription products never carry a video. */
  otc: boolean;
  /** One line under the video, in both languages. No health-outcome promises. */
  caption: Record<Locale, string>;
}

export interface DoctorVideo {
  id: string;
  productSlug: string;
  doctorName: string;
  caption: Record<Locale, string>;
  videoSrc: string;
  posterSrc: string | null;
  sourceUrl: string;
}

const generatedVideos = (generated as { videos?: GeneratedVideo[] }).videos ?? [];
const mapEntries = mapping as Record<string, DoctorVideoMapEntry>;

/**
 * The join, as a pure function so the gates can be tested without a network, a
 * video file or a build: a clip is publishable only when a human mapped it to a
 * product *and* put written consent on file *and* the product is OTC.
 */
export function selectDoctorVideos(
  videos: GeneratedVideo[],
  entries: Record<string, DoctorVideoMapEntry>,
): DoctorVideo[] {
  const out: DoctorVideo[] = [];
  for (const video of videos) {
    const entry = entries[video.id];
    if (!entry) continue; // not mapped by a human yet
    if (!entry.consentOnFile || !entry.otc) continue; // gate
    if (!video.file.startsWith(VIDEO_DIR_PREFIX)) continue; // defensive
    out.push({
      id: video.id,
      productSlug: entry.productSlug,
      doctorName: entry.doctorName,
      caption: entry.caption,
      videoSrc: video.file,
      posterSrc: video.poster,
      sourceUrl: video.url,
    });
  }
  return out;
}

/** Every publishable clip: downloaded, mapped, consented, OTC. */
export function listDoctorVideos(): DoctorVideo[] {
  return selectDoctorVideos(generatedVideos, mapEntries);
}

/** The clip for a product, or null when there is nothing publishable. */
export function doctorVideoFor(slug: string): DoctorVideo | null {
  return listDoctorVideos().find((v) => v.productSlug === slug) ?? null;
}

/**
 * Downloaded clips still waiting for a human decision — the worklist the fetch
 * script prints for whoever maps them.
 */
export function unmappedDoctorVideos(): GeneratedVideo[] {
  return generatedVideos.filter((v) => !mapEntries[v.id]);
}
