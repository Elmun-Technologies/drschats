/*
  Photos and subtitles for the quiz's first question ("who"). The home page
  audience row and the quiz's first screen both draw these doors, so they read
  one table and cannot drift.
*/
export const AUDIENCE_PHOTOS: Record<string, { src: string; position: string }> = {
  "self-woman": { src: "/images/stock/st-aud-woman.webp", position: "center 30%" },
  "self-man": { src: "/images/stock/st-aud-man.webp", position: "70% center" },
  child: { src: "/images/stock/st-aud-child.webp", position: "center" },
  expectant: { src: "/images/stock/st-aud-pregnancy.webp", position: "60% center" },
  parent: { src: "/images/stock/st-aud-senior.webp", position: "center" },
  recovery: { src: "/images/stock/st-aud-recovery.webp", position: "center" },
};

/** Key under `home.audience`. */
export function audienceSubtitleKey(optionId: string): string {
  return AUDIENCE_SUBTITLES[optionId] ?? "subtitleFallback";
}

const AUDIENCE_SUBTITLES: Record<string, string> = {
  "self-woman": "subSelfWoman",
  "self-man": "subSelfMan",
  expectant: "subExpectant",
  child: "subChild",
  parent: "subSenior",
  recovery: "subIllness",
};
