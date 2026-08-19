import createImageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

const builder = createImageUrlBuilder(client);

// eslint-disable-next-line
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
