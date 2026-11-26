/*
  The stored Messages API history, turned into what the chat shows: the
  admin's messages, the assistant's text and which tools it used. Tool inputs
  and results stay out of the page — they can be large and are for the model.
  Pure, so the route, the page and the tests agree.
*/

export type ChatItem =
  | { kind: "user"; text: string; images: number }
  | { kind: "assistant"; text: string }
  | { kind: "tool"; name: string; error: boolean };

interface Block {
  type: string;
  text?: string;
  name?: string;
  id?: string;
  tool_use_id?: string;
  is_error?: boolean;
}

interface StoredMessage {
  role: string;
  content: string | Block[];
}

/* Lines the route adds to the admin's text for the model only; the admin did not type them. */
const MODEL_ONLY_LINE = /^\[(Rasm URL|Rasm saqlanmadi)[^\n]*\]$/gm;

export function chatView(messages: readonly unknown[]): ChatItem[] {
  const out: ChatItem[] = [];
  const failed = new Set<string>();
  for (const m of messages as StoredMessage[]) {
    if (m.role === "user" && Array.isArray(m.content)) {
      for (const b of m.content) if (b.type === "tool_result" && b.is_error && b.tool_use_id) failed.add(b.tool_use_id);
    }
  }
  for (const m of messages as StoredMessage[]) {
    const blocks: Block[] = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content;
    if (m.role === "user") {
      const text = blocks
        .filter((b) => b.type === "text")
        .map((b) => (b.text ?? "").replace(MODEL_ONLY_LINE, "").trim())
        .join("\n")
        .trim();
      const images = blocks.filter((b) => b.type === "image").length;
      if (text || images) out.push({ kind: "user", text, images });
      continue;
    }
    for (const b of blocks) {
      if (b.type === "text" && b.text?.trim()) out.push({ kind: "assistant", text: b.text.trim() });
      if (b.type === "tool_use" && b.name) out.push({ kind: "tool", name: b.name, error: Boolean(b.id && failed.has(b.id)) });
    }
  }
  return out;
}

/** Messages the admin typed — the turn limit counts these, not tool results. */
export function userTurns(messages: readonly unknown[]): number {
  return (messages as StoredMessage[]).filter(
    (m) => m.role === "user" && (typeof m.content === "string" || m.content.some((b) => b.type === "text" || b.type === "image")),
  ).length;
}
