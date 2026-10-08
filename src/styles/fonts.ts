import { Onest, Playfair_Display } from "next/font/google";

/*
  V3 design faces. next/font/google downloads them at build time and serves
  them from our own origin, so there is no runtime request to Google and the
  CSP needs no font host. Preload stays off until a page actually renders in
  these faces — until then they would be bytes nobody reads.
*/
export const onest = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest-face",
  display: "swap",
  preload: false,
});

export const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["500"],
  variable: "--font-playfair-face",
  display: "swap",
  preload: false,
});
