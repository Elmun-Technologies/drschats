import { describe, expect, it } from "vitest";
import { createCircuit } from "./circuit";

describe("createCircuit", () => {
  it("opens after a failure and closes once the cooldown has passed", () => {
    let t = 1_000;
    const circuit = createCircuit(30_000, () => t);
    expect(circuit.isOpen()).toBe(false);
    circuit.fail();
    expect(circuit.isOpen()).toBe(true);
    t += 29_999;
    expect(circuit.isOpen()).toBe(true);
    t += 1;
    expect(circuit.isOpen()).toBe(false);
  });

  it("closes at once on success", () => {
    const circuit = createCircuit(30_000);
    circuit.fail();
    circuit.succeed();
    expect(circuit.isOpen()).toBe(false);
  });
});
