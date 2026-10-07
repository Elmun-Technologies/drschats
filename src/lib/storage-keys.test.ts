import { beforeEach, describe, expect, it, vi } from "vitest";

/*
  The rebrand migration, and the persistence underneath it.

  Renaming `alimkhanov-*` to `govita-*` touches data that already exists in
  real browsers: a returning visitor's cart, wishlist and quiz answers. Get
  this wrong and the shop quietly empties their basket on the first load after
  deploy, which reads to the customer as "the site lost my order". It ran
  untested because storage did not exist under the test environment; it does
  now (vitest.setup.ts).

  Each case re-imports the module, because the migration guards itself with a
  module-level flag and runs on import — testing it twice in one module
  instance would test the flag, not the migration.
*/

async function freshStorageKeys() {
  vi.resetModules();
  return import("./storage-keys");
}

beforeEach(() => {
  localStorage.clear();
});

describe("storage keys", () => {
  it("names every migrated store with the new prefix", async () => {
    const { STORAGE_KEYS } = await freshStorageKeys();
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(key.startsWith("govita-"), `${key} is not namespaced to the brand`).toBe(true);
    }
  });

  it("carries a pre-rebrand cart onto the new key", async () => {
    const saved = JSON.stringify({ state: { lines: [{ slug: "vitamin-d3", quantity: 2 }] }, version: 0 });
    localStorage.setItem("alimkhanov-cart", saved);

    await freshStorageKeys();

    expect(localStorage.getItem("govita-cart")).toBe(saved);
  });

  it("removes the legacy key once it has been copied", async () => {
    localStorage.setItem("alimkhanov-wishlist", '{"state":{"items":["a"]}}');

    await freshStorageKeys();

    // Left behind, the same value lives under two keys and the next migration
    // on another device profile resurrects a cart the customer already cleared.
    expect(localStorage.getItem("alimkhanov-wishlist")).toBeNull();
    expect(localStorage.getItem("govita-wishlist")).toBe('{"state":{"items":["a"]}}');
  });

  it("never overwrites data already created under the new key", async () => {
    /*
      The order that matters: someone used the old site, then used the new one,
      then this runs. The new cart is the current truth — copying the stale one
      over it would roll their basket back.
    */
    localStorage.setItem("govita-cart", '{"state":{"lines":["new"]}}');
    localStorage.setItem("alimkhanov-cart", '{"state":{"lines":["old"]}}');

    await freshStorageKeys();

    expect(localStorage.getItem("govita-cart")).toBe('{"state":{"lines":["new"]}}');
  });

  it("migrates every name it claims to, and leaves the rest alone", async () => {
    localStorage.setItem("alimkhanov-cart", "c");
    localStorage.setItem("alimkhanov-wishlist", "w");
    localStorage.setItem("alimkhanov-user", "u");
    localStorage.setItem("alimkhanov-quiz", "q");
    localStorage.setItem("alimkhanov-cookie-consent", "1");
    localStorage.setItem("alimkhanov-something-else", "untouched");

    await freshStorageKeys();

    for (const name of ["cart", "wishlist", "user", "quiz", "cookie-consent"]) {
      expect(localStorage.getItem(`govita-${name}`), `${name} did not migrate`).not.toBeNull();
    }
    // An unlisted legacy key is not ours to move, and moving it would be a guess.
    expect(localStorage.getItem("alimkhanov-something-else")).toBe("untouched");
  });

  it("treats a session with no legacy data as a no-op", async () => {
    await freshStorageKeys();
    expect(localStorage.length).toBe(0);
  });

  it("survives storage that throws, as in private mode or a full quota", async () => {
    /*
      Safari private browsing historically threw on setItem. The migration is
      a convenience, so it must lose the data rather than the page: an
      exception here happens at module import, which would take the whole
      store — and therefore the shop — down with it.

      The legacy value is written first, because the whole point is that the
      *copy* fails. Restoring in a finally block matters: setItem is replaced
      on the shared global, and a test that leaks a throwing storage takes
      every later test with it.
    */
    localStorage.setItem("alimkhanov-cart", '{"state":{"lines":["old"]}}');

    const realSetItem = Storage.prototype.setItem;
    try {
      Storage.prototype.setItem = () => {
        throw new Error("QuotaExceededError");
      };
      await expect(freshStorageKeys()).resolves.toBeDefined();
    } finally {
      Storage.prototype.setItem = realSetItem;
    }

    // The copy never happened, and nothing threw out of the import.
    expect(localStorage.getItem("govita-cart")).toBeNull();
  });
});

describe("cart persistence", () => {
  it("writes the cart to storage so a reload finds it", async () => {
    vi.resetModules();
    await import("./storage-keys");
    const { useCart } = await import("./cart/store");

    useCart.getState().add(
      { productId: "p1", slug: "omega-3-premium", name: "Omega-3", image: "", price: 420000 },
      1,
      { silent: true },
    );

    const raw = localStorage.getItem("govita-cart");
    expect(raw, "the cart was not persisted").not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.state.lines).toHaveLength(1);
    expect(parsed.state.lines[0].slug).toBe("omega-3-premium");
  });

  it("stamps the save time the 30-day TTL is checked against", async () => {
    vi.resetModules();
    await import("./storage-keys");
    const { useCart } = await import("./cart/store");

    useCart.getState().add(
      { productId: "p1", slug: "magnesium-b6", name: "Magnesium", image: "", price: 190000 },
      1,
      { silent: true },
    );

    const parsed = JSON.parse(localStorage.getItem("govita-cart") as string);
    // Without a timestamp the TTL cannot be evaluated, and a stale cart is
    // either kept for ever or dropped on every load.
    expect(parsed.state._savedAt).toBeGreaterThan(0);
  });
});
