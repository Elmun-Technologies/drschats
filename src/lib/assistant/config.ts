/*
  Which Claude model the admin assistant runs on. Pure, so the integrations
  form, the agent and the tests read one list.

  Haiku is the default: the cheapest model that still uses tools well, and
  the assistant's work is lookups and short form-filling, not long reasoning.
  The stronger models are here for when Haiku is not enough — switching is
  a select in /admin/integrations, not a deploy.
*/

export const ASSISTANT_MODELS = [
  { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 — arzon, tez (tavsiya)" },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 — kuchliroq, ~20× qimmat" },
] as const;

export type AssistantModel = (typeof ASSISTANT_MODELS)[number]["id"];

export const DEFAULT_ASSISTANT_MODEL: AssistantModel = "claude-haiku-5-5";

export function assistantModelOf(value: string | null | undefined): AssistantModel {
  return ASSISTANT_MODELS.find((m) => m.id === value)?.id ?? DEFAULT_ASSISTANT_MODEL;
}

/** Per million tokens, USD — for the cost readout only (prompts ≤ 100K tokens). */
export const MODEL_PRICES: Record<AssistantModel, { input: number; output: number }> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
};

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

/** Cache reads bill at 0.1× input, 5-minute cache writes at 1.25×. */
export function usageCostUsd(model: AssistantModel, u: TokenUsage): number {
  const p = MODEL_PRICES[model];
  return (u.input * p.input + u.cacheRead * p.input * 0.1 + u.cacheWrite * p.input * 1.25 + u.output * p.output) / 1_000_000;
}

/** A conversation stops taking new messages past this many turns — a new one is cheaper than an ever-longer history. */
export const MAX_USER_TURNS = 40;
/** Tool calls the agent may make for one message before it must answer. */
export const MAX_STEPS = 12;
/** Images per message, and the size of each after the browser downscales it. */
export const MAX_IMAGES = 4;
export const MAX_IMAGE_BASE64 = 1_500_000;
