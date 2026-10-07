import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "./client";

/*
  The named export, not the default one. `@sanity/image-url` still ships a
  default export for backwards compatibility and prints a deprecation warning
  on every build when it is used — which meant two lines of noise in an
  otherwise clean build log, and a warning that reads as "someone should look
  at this" on every CI run until somebody does.
*/
const builder = createImageUrlBuilder(client);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
