import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/*
  Vitest needs the same `@/…` alias the app is written against.

  Until now the unit tests only imported types across that boundary, which
  TypeScript erases, so no config was needed. The moment a tested module
  imports another module by alias at runtime — cart pricing reading the
  subscription terms — the alias has to resolve here too.
*/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    /*
      Installs localStorage before the store modules are imported, which is
      the only point at which it can help: Zustand's persist middleware reads
      storage during module initialisation. See vitest.setup.ts.
    */
    setupFiles: [fileURLToPath(new URL("./vitest.setup.ts", import.meta.url))],
  },
});
