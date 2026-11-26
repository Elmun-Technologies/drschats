/*
  Photos and subtitles for the quiz's first question ("who"). The home page
  audience row and the quiz's first screen both draw these doors, so they read
  one table and cannot drift.
*/
export const AUDIENCE_PHOTOS: Record<string, { src: string; position: string }> = {
  "self-woman": { src: "/images/bank/asian-woman-smiling.webp", position: "center 25%" },
  "self-man": { src: "/images/bank/man-young-smiling.webp", position: "center 25%" },
  child: { src: "/images/bank/girl-oranges-yellow.webp", position: "center 30%" },
  expectant: { src: "/images/bank/pregnant-window.webp", position: "center 35%" },
  parent: { src: "/images/bank/senior-woman-yellow.webp", position: "center 25%" },
  recovery: { src: "/images/bank/tea-lemon-honey.webp", position: "center" },
};

/*
  Where the home page's "who" cards lead: the audience pages built as their own
  worlds (topic-worlds.ts). An option without a page of its own goes to the quiz,
  with the answer filled in.
*/
export const AUDIENCE_PAGES: Record<string, string> = {
  "self-woman": "/goals/women",
  "self-man": "/goals/men",
  child: "/goals/kids",
  expectant: "/care/mom",
  parent: "/goals/seniors",
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
