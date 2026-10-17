import { readdir } from "node:fs/promises";
import path from "node:path";
import { REPO_IMAGE_DIRS, type RepoImage } from "./repo-images";

/*
  Read at request time, not from a generated manifest: the Fly image copies
  public/ next to server.js (Dockerfile, run stage) and the standalone server
  runs with /app as its working directory, so process.cwd()/public is the
  same folder in development, `next start` and production. A missing folder
  is an empty list, never an error page.
*/
export async function listRepoImages(): Promise<RepoImage[]> {
  const root = path.join(process.cwd(), "public");
  const groups = await Promise.all(
    REPO_IMAGE_DIRS.map(async ({ dir, kind, match }) => {
      try {
        const entries = await readdir(path.join(root, ...dir.split("/")), { withFileTypes: true });
        return entries
          .filter((e) => e.isFile() && match.test(e.name))
          .map((e) => ({ src: `/${dir}/${e.name}`, name: e.name, kind }))
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch {
        return [];
      }
    }),
  );
  return groups.flat();
}
