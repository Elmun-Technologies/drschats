import type { FlowStep, FlowTrigger } from "./types";

/*
  When a flow step is due — pure, `now` is an argument.

  Delays count from the trigger moment ("anchor": the cart's time, the
  delivery, the last order). A customer enters a flow once the first step is
  due, and only if that moment is recent: switching on the "lapsed" flow must
  not message every customer who stopped buying two years ago. The look-back
  window per trigger is ENROLL_WINDOW_MINUTES.
*/

const MIN = 60_000;

export const ENROLL_WINDOW_MINUTES: Record<FlowTrigger, number> = {
  cart_abandoned: 2 * 24 * 60,
  checkout_dropped: 2 * 24 * 60,
  first_order_delivered: 3 * 24 * 60,
  course_ending: 3 * 24 * 60,
  lapsed: 7 * 24 * 60,
  restock: 0,
  birthday: 0,
};

export function stepDueAt(step: Pick<FlowStep, "delayMinutes">, anchor: Date): Date {
  return new Date(anchor.getTime() + step.delayMinutes * MIN);
}

/** Anchors that may enroll now: the first step is due, and became due within the window. */
export function enrollmentWindow(trigger: FlowTrigger, firstDelayMinutes: number, now: Date): { from: Date; to: Date } {
  const to = new Date(now.getTime() - firstDelayMinutes * MIN);
  return { from: new Date(to.getTime() - ENROLL_WINDOW_MINUTES[trigger] * MIN), to };
}

export interface StepPick {
  /** Index of the step to send now, or null when nothing is due. */
  send: number | null;
  /** Steps passed over because a later one is already due — one message, not a burst. */
  skipped: number[];
  /** The step after this tick, or null when the flow is finished. */
  next: { step: number; at: Date } | null;
}

export function pickStep(steps: Pick<FlowStep, "delayMinutes">[], anchor: Date, current: number, now: Date): StepPick {
  if (current >= steps.length) return { send: null, skipped: [], next: null };
  let index = current;
  const skipped: number[] = [];
  while (index + 1 < steps.length && stepDueAt(steps[index + 1], anchor) <= now) {
    skipped.push(index);
    index++;
  }
  if (stepDueAt(steps[index], anchor) > now) return { send: null, skipped, next: { step: index, at: stepDueAt(steps[index], anchor) } };
  const following = index + 1 < steps.length ? { step: index + 1, at: stepDueAt(steps[index + 1], anchor) } : null;
  return { send: index, skipped, next: following };
}

/** Retry delay after a failed send: 5 min, then 30 min; the third failure is final. */
export const MAX_SEND_ATTEMPTS = 3;
export function retryDelayMinutes(attempts: number): number {
  return attempts <= 1 ? 5 : 30;
}
