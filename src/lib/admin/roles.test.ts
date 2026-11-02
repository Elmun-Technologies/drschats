import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { can, canOpen, permissionForPath } from "./roles";

describe("admin roles", () => {
  it("gives the owner everything and keeps users, keys and the audit log to the owner", () => {
    for (const p of ["users", "integrations", "audit", "commerce", "orders"] as const) expect(can("owner", p)).toBe(true);
    for (const p of ["users", "integrations", "audit"] as const) {
      expect(can("manager", p)).toBe(false);
      expect(can("operator", p)).toBe(false);
    }
  });

  it("lets an operator work orders, customers, the waiting list and support only", () => {
    expect(canOpen("operator", "/admin/orders/GV-000001")).toBe(true);
    expect(canOpen("operator", "/admin/print/orders/GV-000001")).toBe(true);
    expect(canOpen("operator", "/admin/customers/901234567")).toBe(true);
    expect(canOpen("operator", "/admin/bot/tickets")).toBe(true);
    expect(canOpen("operator", "/admin/security")).toBe(true);
    for (const path of ["/admin/bot", "/admin/products", "/admin/promocodes/new", "/admin/commerce", "/admin/analytics", "/admin/segments/1/export"]) {
      expect(canOpen("operator", path)).toBe(false);
    }
  });

  it("closes an unlisted page to everyone but the owner", () => {
    expect(permissionForPath("/admin/something-new")).toBe("users");
    expect(canOpen("manager", "/admin/something-new")).toBe(false);
    expect(permissionForPath("/admin")).toBe("dashboard");
    expect(permissionForPath("/admin/")).toBe("dashboard");
  });

  it("knows every admin page", () => {
    const root = join(process.cwd(), "src/app/admin/(panel)");
    const sections = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    // Every section is placed on purpose; only these are owner-only.
    const ownerOnly = new Set(["users", "integrations", "audit"]);
    for (const name of sections) {
      const permission = permissionForPath(`/admin/${name}`);
      if (ownerOnly.has(name)) expect(permission, name).not.toBe("dashboard");
      else expect(canOpen("manager", `/admin/${name}`) || canOpen("operator", `/admin/${name}`), name).toBe(true);
    }
  });
});

describe("admin server actions", () => {
  /*
    An action can be posted to any admin URL, so the path-based check would
    let an operator call an owner's action from the orders page. Every action
    names its permission.
  */
  const dir = join(process.cwd(), "src/app/admin/_actions");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))) {
    it(`${file}: every requireAdmin names a permission`, () => {
      const src = readFileSync(join(dir, file), "utf8");
      expect(src.match(/requireAdmin\(\)/g) ?? []).toEqual([]);
    });
  }
});
