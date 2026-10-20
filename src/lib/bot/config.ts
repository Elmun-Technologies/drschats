import { z } from "zod";
import { BRAND } from "@/lib/brand";

/*
  Club settings an admin edits in /admin/bot. The bot reads them through
  GET /api/bot/config, so a change applies without redeploying the bot.
*/

/**
 * The buttons the bot's main menu may show. The panel decides which ones a
 * customer sees; the bot keeps the order and the texts, because a menu row
 * with a missing callback would be dead. Products, prices and stock never
 * come from here — those stay in the catalogue.
 */
export const MENU_BUTTONS = ["miniApp", "catalog", "search", "cart", "orders", "promo", "help"] as const;
export type MenuButton = (typeof MENU_BUTTONS)[number];

export const menuSchema = z.object({
  miniApp: z.boolean(),
  catalog: z.boolean(),
  search: z.boolean(),
  cart: z.boolean(),
  orders: z.boolean(),
  promo: z.boolean(),
  help: z.boolean(),
});

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
  /**
   * The first message a new customer sees, in both languages. Plain text:
   * the bot escapes it, so an admin cannot break the message with HTML.
   * Empty falls back to the built-in welcome.
   */
  greeting: z.object({
    uz: z.string().trim().max(600),
    ru: z.string().trim().max(600),
  }),
  /** Which standard buttons the main menu shows. All on unless the team turns one off. */
  menu: menuSchema,
});

export type ClubConfig = z.infer<typeof clubConfigSchema>;

export const DEFAULT_CLUB: ClubConfig = {
  enabled: true,
  clubName: "GoVita VIP Salomatlik Klubi",
  shopUrl: process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") ? process.env.NEXT_PUBLIC_SITE_URL : "https://govita.uz",
  supportPhone: BRAND.contact.phone,
  supportHours: "Du–Sha, 09:00–18:00",
  greeting: {
    uz: "Assalomu alaykum! GoVita VIP Salomatlik Klubiga xush kelibsiz 👋",
    ru: "Здравствуйте! Добро пожаловать в GoVita VIP клуб здоровья 👋",
  },
  menu: { miniApp: true, catalog: true, search: true, cart: true, orders: true, promo: true, help: true },
};

/**
 * Stored data merged over the defaults; a field that no longer validates falls
 * back. `greeting` merges key by key: an older row saved before the greeting
 * existed must not wipe the rest of the settings.
 */
export function readClubConfig(stored: unknown): ClubConfig {
  const saved = stored && typeof stored === "object" ? (stored as Record<string, unknown>) : {};
  const greeting = saved.greeting && typeof saved.greeting === "object" ? (saved.greeting as Record<string, unknown>) : {};
  const menu = saved.menu && typeof saved.menu === "object" ? (saved.menu as Record<string, unknown>) : {};
  const merged = {
    ...DEFAULT_CLUB,
    ...saved,
    greeting: { ...DEFAULT_CLUB.greeting, ...greeting },
    menu: { ...DEFAULT_CLUB.menu, ...menu },
  };
  const parsed = clubConfigSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_CLUB;
}
