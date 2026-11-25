import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { assistantConversations } from "@/lib/db/schema";
import type { Message, PendingAction } from "./agent";
import type { TokenUsage } from "./config";

/* Conversations belong to the admin who started them: every read and write is scoped by admin id. */

export interface Conversation {
  id: number;
  title: string | null;
  messages: Message[];
  pending: PendingAction | null;
  model: string | null;
  usage: TokenUsage;
  updatedAt: Date;
}

function toConversation(row: typeof assistantConversations.$inferSelect): Conversation {
  return {
    id: row.id,
    title: row.title,
    messages: (row.messages ?? []) as Message[],
    pending: (row.pending ?? null) as PendingAction | null,
    model: row.model,
    usage: { input: row.inputTokens, output: row.outputTokens, cacheRead: row.cacheReadTokens, cacheWrite: row.cacheWriteTokens },
    updatedAt: row.updatedAt,
  };
}

export async function getConversation(adminId: number, id: number): Promise<Conversation | null> {
  const [row] = await getDb()
    .select()
    .from(assistantConversations)
    .where(and(eq(assistantConversations.id, id), eq(assistantConversations.adminUserId, adminId)))
    .limit(1);
  return row ? toConversation(row) : null;
}

export async function createConversation(adminId: number, title: string, model: string): Promise<Conversation> {
  const [row] = await getDb()
    .insert(assistantConversations)
    .values({ adminUserId: adminId, title: title.slice(0, 120), model })
    .returning();
  return toConversation(row);
}

export async function saveConversation(adminId: number, id: number, messages: Message[], pending: PendingAction | null, usage: TokenUsage, model: string) {
  await getDb()
    .update(assistantConversations)
    .set({
      messages: messages as unknown[],
      pending,
      model,
      inputTokens: sql`${assistantConversations.inputTokens} + ${usage.input}`,
      outputTokens: sql`${assistantConversations.outputTokens} + ${usage.output}`,
      cacheReadTokens: sql`${assistantConversations.cacheReadTokens} + ${usage.cacheRead}`,
      cacheWriteTokens: sql`${assistantConversations.cacheWriteTokens} + ${usage.cacheWrite}`,
      updatedAt: new Date(),
    })
    .where(and(eq(assistantConversations.id, id), eq(assistantConversations.adminUserId, adminId)));
}

export async function listConversations(adminId: number, limit = 30) {
  return getDb()
    .select({ id: assistantConversations.id, title: assistantConversations.title, updatedAt: assistantConversations.updatedAt })
    .from(assistantConversations)
    .where(eq(assistantConversations.adminUserId, adminId))
    .orderBy(desc(assistantConversations.updatedAt))
    .limit(limit);
}

export async function deleteConversation(adminId: number, id: number) {
  await getDb().delete(assistantConversations).where(and(eq(assistantConversations.id, id), eq(assistantConversations.adminUserId, adminId)));
}

/** This month's spend across every admin, for the cost line on the page. */
export async function monthUsage(): Promise<Record<string, TokenUsage>> {
  const rows = await getDb()
    .select({
      model: assistantConversations.model,
      input: sql<number>`coalesce(sum(${assistantConversations.inputTokens}), 0)`,
      output: sql<number>`coalesce(sum(${assistantConversations.outputTokens}), 0)`,
      cacheRead: sql<number>`coalesce(sum(${assistantConversations.cacheReadTokens}), 0)`,
      cacheWrite: sql<number>`coalesce(sum(${assistantConversations.cacheWriteTokens}), 0)`,
    })
    .from(assistantConversations)
    .where(sql`${assistantConversations.updatedAt} >= date_trunc('month', now())`)
    .groupBy(assistantConversations.model);
  return Object.fromEntries(rows.map((r) => [r.model ?? "", { input: Number(r.input), output: Number(r.output), cacheRead: Number(r.cacheRead), cacheWrite: Number(r.cacheWrite) }]));
}
