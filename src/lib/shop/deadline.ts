const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Calls `fn` once `at` (epoch ms) has passed. setTimeout fires immediately
 * for delays past ~24.8 days, so a far deadline is reached in steps.
 * Returns a cancel function.
 */
export function onDeadline(at: number, fn: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    const wait = at - Date.now();
    if (wait <= 0) return fn();
    timer = setTimeout(arm, Math.min(wait + 50, MAX_TIMEOUT_MS));
  };
  arm();
  return () => clearTimeout(timer);
}
