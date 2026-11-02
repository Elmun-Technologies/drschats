/*
  Stands in for the `server-only` marker under Vitest. Next resolves the
  package itself (it throws when a client bundle imports a server module);
  tests are plain Node and import server modules on purpose.
*/
export {};
