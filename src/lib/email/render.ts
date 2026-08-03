import { BRAND } from "@/lib/brand";
import type { Locale } from "@/lib/i18n/routing";

/*
  One HTML shell for every message we send.

  Written as tables with inline styles, which is not how anything else in this
  codebase is written — but Gmail, Outlook and Mail.ru still strip <style>
  blocks and ignore flexbox, and an email that only renders in a browser is an
  email nobody reads.

  Colours mirror the tokens in src/styles/globals.css. They are literal here on
  purpose: a mail client cannot resolve a CSS variable.
*/

const COLORS = {
  ink: "#ffffff",
  surface: "#f5f6fb",
  fg: "#131632",
  muted: "#5a6080",
  faint: "#6b7194",
  accent: "#3d4cdb",
  accentStrong: "#2c39b4",
  line: "#e1e5f3",
};

const FOOTER_COPY: Record<Locale, { why: string; unsubscribe: string; preferences: string; contact: string }> = {
  uz: {
    why: "Siz Go Vita saytida shu manzilni tasdiqlaganingiz uchun bu xatni oldingiz.",
    unsubscribe: "Obunani bekor qilish",
    preferences: "Sozlamalar",
    contact: "Savolingiz bormi? Shu xatga javob yozing.",
  },
  ru: {
    why: "Вы получили это письмо, потому что подтвердили этот адрес на сайте Go Vita.",
    unsubscribe: "Отписаться",
    preferences: "Настройки",
    contact: "Есть вопрос? Просто ответьте на это письмо.",
  },
};

export interface EmailProduct {
  name: string;
  url: string;
  price?: string;
}

export interface EmailBlocks {
  /** The grey line after the subject in an inbox list. */
  preheader: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  products?: EmailProduct[];
  cta?: { label: string; url: string };
  /** Small print under the call to action — a disclaimer, a deadline. */
  note?: string;
}

export interface RenderOptions {
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLORS.fg};">${escapeHtml(text)}</p>`;
}

function bulletList(items: string[]): string {
  const rows = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px;font-size:15px;line-height:1.6;color:${COLORS.fg};">${escapeHtml(item)}</li>`,
    )
    .join("");
  return `<ul style="margin:0 0 20px;padding-left:20px;">${rows}</ul>`;
}

function productTable(products: EmailProduct[]): string {
  const rows = products
    .map(
      (p) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${COLORS.line};font-size:15px;color:${COLORS.fg};">
            <a href="${escapeHtml(p.url)}" style="color:${COLORS.accentStrong};text-decoration:none;font-weight:600;">${escapeHtml(p.name)}</a>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid ${COLORS.line};font-size:15px;color:${COLORS.muted};white-space:nowrap;">
            ${p.price ? escapeHtml(p.price) : ""}
          </td>
        </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">${rows}</table>`;
}

function button(label: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
      <tr>
        <td align="center" bgcolor="${COLORS.accent}" style="border-radius:999px;">
          <a href="${escapeHtml(url)}"
             style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export function renderEmail(
  locale: Locale,
  blocks: EmailBlocks,
  options: RenderOptions = {},
): { html: string; text: string } {
  const footer = FOOTER_COPY[locale];

  const body = [
    `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${COLORS.fg};">${escapeHtml(blocks.heading)}</h1>`,
    ...blocks.paragraphs.map(paragraph),
    blocks.bullets?.length ? bulletList(blocks.bullets) : "",
    blocks.products?.length ? productTable(blocks.products) : "",
    blocks.cta ? button(blocks.cta.label, blocks.cta.url) : "",
    blocks.note
      ? `<p style="margin:0;font-size:13px;line-height:1.5;color:${COLORS.faint};">${escapeHtml(blocks.note)}</p>`
      : "",
  ].join("");

  const footerLinks = [
    options.preferencesUrl
      ? `<a href="${escapeHtml(options.preferencesUrl)}" style="color:${COLORS.muted};">${escapeHtml(footer.preferences)}</a>`
      : "",
    options.unsubscribeUrl
      ? `<a href="${escapeHtml(options.unsubscribeUrl)}" style="color:${COLORS.muted};">${escapeHtml(footer.unsubscribe)}</a>`
      : "",
  ]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");

  const html = `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(blocks.heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.surface};">
    <!-- Preheader: shown next to the subject in the inbox, hidden in the message. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(blocks.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.surface};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.ink};border-radius:16px;border:1px solid ${COLORS.line};">
            <tr>
              <td style="padding:28px 28px 0;">
                <span style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:${COLORS.fg};">
                  ${escapeHtml(BRAND.wordmark.lead)}<span style="color:${COLORS.accent};">${escapeHtml(BRAND.wordmark.accent)}</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;">${body}</td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding:20px 28px;font-size:12px;line-height:1.6;color:${COLORS.muted};">
                <p style="margin:0 0 6px;">${escapeHtml(footer.why)}</p>
                <p style="margin:0 0 6px;">${escapeHtml(footer.contact)}</p>
                ${footerLinks ? `<p style="margin:0;">${footerLinks}</p>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  // A plain-text part is not decoration: it is what spam filters read and what
  // a watch or a screen reader renders.
  const text = [
    blocks.heading,
    "",
    ...blocks.paragraphs,
    ...(blocks.bullets ?? []).map((b) => `— ${b}`),
    ...(blocks.products ?? []).map((p) => `— ${p.name}${p.price ? ` · ${p.price}` : ""}: ${p.url}`),
    blocks.cta ? `\n${blocks.cta.label}: ${blocks.cta.url}` : "",
    blocks.note ?? "",
    "",
    footer.why,
    options.unsubscribeUrl ? `${footer.unsubscribe}: ${options.unsubscribeUrl}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { html, text };
}
