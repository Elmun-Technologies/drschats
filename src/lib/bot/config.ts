import { z } from "zod";
import { BRAND } from "@/lib/brand";

/*
  Club settings an admin edits in /admin/bot. The bot reads them through
  GET /api/bot/config, so a change applies without redeploying the bot.
*/

export const clubConfigSchema = z.object({
  /** Off: order status messages are not queued. Ticket replies still go. */
  enabled: z.boolean(),
  clubName: z.string().trim().min(1).max(120),
  /** Opened by the bot's "Do'kon" buttons — inside Telegram as a Mini App. */
  shopUrl: z
    .string()
    .trim()
    .url()
    .refine((u) => u.startsWith("https://"), "HTTPS"),
  supportPhone: z.string().trim().max(40),
  supportHours: z.string().trim().max(120),
});

export type ClubConfig = z.infer<typeof clubConfigSchema>;

export const DEFAULT_CLUB: ClubConfig = {
  enabled: true,
  clubName: "GoVita VIP Salomatlik Klubi",
  shopUrl: process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") ? process.env.NEXT_PUBLIC_SITE_URL : "https://govita.uz",
  supportPhone: BRAND.contact.phone,
  supportHours: "Du–Sha, 09:00–18:00",
};

/** Stored data merged over the defaults; a field that no longer validates falls back. */
export function readClubConfig(stored: unknown): ClubConfig {
  const merged = { ...DEFAULT_CLUB, ...(stored && typeof stored === "object" ? stored : {}) };
  const parsed = clubConfigSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_CLUB;
}
