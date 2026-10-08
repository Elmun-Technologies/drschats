import { Onest, Playfair_Display } from "next/font/google";

/*
  V3 design faces. next/font/google downloads them at build time and serves
  them from our own origin, so there is no runtime request to Google and the
  CSP needs no font host. Onest is the whole UI and Playfair draws the
  wordmark in the header, so both are on every page and both are preloaded.
*/
export const onest = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest-face",
  display: "swap",
});

export const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["500"],
  variable: "--font-playfair-face",
  display: "swap",
});
