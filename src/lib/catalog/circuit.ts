/*
  A minimal circuit breaker. After a failure the circuit stays open for
  `cooldownMs`: callers skip the dependency and use their fallback at once,
  instead of each waiting out the same connection timeout again.
*/
export interface Circuit {
  isOpen(): boolean;
  fail(): void;
  succeed(): void;
}

export function createCircuit(cooldownMs: number, now: () => number = Date.now): Circuit {
  let openUntil = 0;
  return {
    isOpen: () => now() < openUntil,
    fail: () => {
      openUntil = now() + cooldownMs;
    },
    succeed: () => {
      openUntil = 0;
    },
  };
}
