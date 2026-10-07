/*
  A browser's storage, and nothing else from a browser.

  Three of the stores here persist to localStorage, and Zustand's persist
  middleware reads it while the store module is initialising. Under a plain
  Node environment that read fails, so every cart test printed
  "[zustand persist middleware] Unable to update item 'govita-cart'" — twice
  per test. The assertions still passed, which is exactly the problem: a wall
  of warnings that can be ignored is a wall that hides the one that cannot.

  This is a real Map-backed implementation rather than a mock, so persistence
  genuinely round-trips and tests can assert on what a returning visitor would
  find. Deliberately not jsdom: these are logic tests, and a DOM would be a
  large dependency bought to satisfy a single global.

  `window` carries the same object because the codebase is inconsistent about
  which it reads — src/lib/storage-keys.ts and src/lib/quiz/engine.ts go
  through `window.localStorage`, while the Zustand stores read the bare
  global. Both have to resolve to the same storage or a test can write through
  one and fail to see it through the other.

  Cleared between tests, so nothing leaks from one into the next.
*/

class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
}

const storage = new MemoryStorage();

const globals = globalThis as Record<string, unknown>;
globals.localStorage = storage;
globals.sessionStorage = new MemoryStorage();
// Exposed as a global so a test can stub the prototype — the way you would
// simulate private mode or a full quota — and put it back afterwards.
globals.Storage = MemoryStorage;

// Only added when absent, so a future switch to a real DOM environment is not
// quietly overwritten by a stub.
if (typeof globals.window === "undefined") {
  globals.window = { localStorage: storage, sessionStorage: globals.sessionStorage };
}

export { storage };
