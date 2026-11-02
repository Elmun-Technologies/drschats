import { createHash } from "node:crypto";

export interface SegmentMember {
  key: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  orders: number;
  value: number;
  lastAt: Date | null;
  telegramChatId: number | null;
}

/** +998901234567 → 998901234567: the E.164 digits ad platforms hash. */
export function normalizePhone(phone: string | null): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 9) return `998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return digits;
  return digits.length >= 9 ? digits : null;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  // Leading = + - @ would run as a formula when the file is opened in a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export type ExportFormat = "crm" | "meta" | "google";

function phone9(phone: string | null): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 9 ? digits.slice(-9) : null;
}

/**
 * Customers who pressed STOP (any channel) are not handed to an ad platform:
 * an ad audience is marketing too. The team's own CRM list keeps them, marked,
 * so nobody calls them with an offer either.
 */
export function withoutOptedOut(members: SegmentMember[], optedOut: ReadonlySet<string>): SegmentMember[] {
  return members.filter((m) => {
    const p = phone9(m.phone);
    return !p || !optedOut.has(p);
  });
}

/**
 * crm — readable list for the team; meta / google — the column layouts
 * Meta Custom Audiences and Google Customer Match accept, SHA-256 hashed so
 * no raw contact leaves the shop.
 */
export function segmentCsv(members: SegmentMember[], format: ExportFormat, optedOut: ReadonlySet<string> = new Set()): string {
  const lines: string[] = [];
  if (format === "crm") {
    lines.push(["Ism", "Telefon", "Email", "Buyurtmalar", "Summa (soʻm)", "Oxirgi faollik", "Telegram", "Reklamadan voz kechgan"].join(","));
    for (const m of members) {
      const stopped = optedOut.has(phone9(m.phone) ?? "");
      lines.push([m.name, m.phone, m.email, m.orders, m.value, m.lastAt?.toISOString().slice(0, 10) ?? "", m.telegramChatId ? "ha" : "", stopped ? "ha" : ""].map(csvCell).join(","));
    }
  } else if (format === "meta") {
    members = withoutOptedOut(members, optedOut);
    lines.push("phone,email,country");
    for (const m of members) {
      const phone = normalizePhone(m.phone);
      const email = m.email?.trim().toLowerCase();
      if (!phone && !email) continue;
      lines.push([phone ? sha256(phone) : "", email ? sha256(email) : "", sha256("uz")].join(","));
    }
  } else {
    lines.push("Phone,Email,Country");
    for (const m of withoutOptedOut(members, optedOut)) {
      const phone = normalizePhone(m.phone);
      const email = m.email?.trim().toLowerCase();
      if (!phone && !email) continue;
      lines.push([phone ? sha256(`+${phone}`) : "", email ? sha256(email) : "", "UZ"].join(","));
    }
  }
  return `﻿${lines.join("\n")}\n`;
}
