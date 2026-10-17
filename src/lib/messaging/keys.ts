/*
  Dedupe keys: one message per (flow, enrollment, step) and per (campaign,
  phone). outbound_messages.dedupe_key is unique, so queueing the same thing
  twice — a worker restart, an overlapping cron call, a double-clicked
  "send" — inserts nothing the second time.
*/

export function flowMessageKey(flowId: string, enrollmentId: number, step: number): string {
  return `flow:${flowId}:${enrollmentId}:${step}`;
}

export function campaignMessageKey(campaignId: number, phone9: string): string {
  return `campaign:${campaignId}:${phone9}`;
}

/**
 * The bot outbox key for a Telegram hand-off. Campaign jobs keep the shape
 * bot_jobs used before the outbox existed (campaign:<id>:<chat>), so a
 * campaign never reaches one chat twice even through two phone numbers.
 */
export function botJobKey(message: { id: number; campaignId: number | null; chatId: number | null }): string {
  return message.campaignId ? `campaign:${message.campaignId}:${message.chatId}` : `msg:${message.id}`;
}
