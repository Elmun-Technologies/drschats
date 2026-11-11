import { BRAND } from "@/lib/brand";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import type { Locale } from "@/lib/i18n/routing";
import type { Category, Product } from "@/lib/shopflow/types";
import { brandOf } from "@/lib/catalog/product-facts";

/*
  Product feeds for Google Merchant Center (RSS 2.0 + g:) and Yandex (YML),
  built from the same catalogue the shop sells from — the engine has already
  applied a running sale or the deal of the day, so the feed price is the
  checkout price at the moment of the read.

  Only what the catalogue actually knows goes in: no GTIN or MPN (the
  catalogue holds none, so `identifier_exists` says so), no invented
  categories, no shipping table (that is account-level in both systems).
  Out-of-stock and unlisted products are left out.
*/

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Control characters other than tab/newline are invalid in XML 1.0.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function absolute(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

/** One line of text; descriptions from the admin or Sanity may carry markup, names do not. */
function plain(text: string, max = 3000, { markup = false } = {}): string {
  const clean = (markup ? text.replace(/<\/?[a-z][^>]*>/gi, " ") : text).replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/**
 * «Swiss Energy Calcivit 30 — Kalsiy D3 K2, kapsula»: the brand name a shopper
 * may know, then the words they search by (content/product-keywords.ts).
 */
export function feedTitle(p: Pick<Product, "name" | "keyword">): string {
  return plain(p.keyword ? `${p.name} — ${p.keyword}` : p.name, 150);
}

/** In stock, listed, with a price and a photo: the products an ad may send someone to. */
export function feedProducts(products: Product[]): Product[] {
  return products.filter(
    (p) => p.inStock && p.assortment !== "unlisted" && p.price > 0 && p.images.length > 0,
  );
}

function productUrl(p: Product, locale: Locale) {
  return `${SITE_URL}/${locale}/product/${encodeURIComponent(p.slug)}`;
}

function onSale(p: Product): boolean {
  return Boolean(p.oldPrice && p.oldPrice > p.price);
}

/** ISO 8601 interval Google wants for a sale with a real end; none without one. */
function saleWindow(p: Product, now: Date): string | null {
  if (!onSale(p) || !p.saleEndsAt) return null;
  const end = new Date(p.saleEndsAt);
  if (!Number.isFinite(end.getTime()) || end <= now) return null;
  return `${now.toISOString().slice(0, 19)}Z/${end.toISOString().slice(0, 19)}Z`;
}

const money = (amount: number) => `${Math.round(amount)} UZS`;

export function googleFeed({
  products,
  categories,
  locale,
  now = new Date(),
}: {
  products: Product[];
  categories: Category[];
  locale: Locale;
  now?: Date;
}): string {
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const items = feedProducts(products).map((p) => {
    const brand = brandOf(p);
    const type = p.categorySlug ? categoryName.get(p.categorySlug) : undefined;
    const window = saleWindow(p, now);
    const lines = [
      `<g:id>${xmlEscape(p.id)}</g:id>`,
      `<g:title>${xmlEscape(feedTitle(p))}</g:title>`,
      `<g:description>${xmlEscape(plain(p.description || p.tagline || p.name, 5000, { markup: true }))}</g:description>`,
      `<g:link>${xmlEscape(productUrl(p, locale))}</g:link>`,
      `<g:image_link>${xmlEscape(absolute(p.images[0].url))}</g:image_link>`,
      ...p.images.slice(1, 10).map((i) => `<g:additional_image_link>${xmlEscape(absolute(i.url))}</g:additional_image_link>`),
      `<g:availability>in_stock</g:availability>`,
      `<g:condition>new</g:condition>`,
      ...(onSale(p)
        ? [
            `<g:price>${money(p.oldPrice!)}</g:price>`,
            `<g:sale_price>${money(p.price)}</g:sale_price>`,
            ...(window ? [`<g:sale_price_effective_date>${window}</g:sale_price_effective_date>`] : []),
          ]
        : [`<g:price>${money(p.price)}</g:price>`]),
      ...(brand ? [`<g:brand>${xmlEscape(brand.name)}</g:brand>`] : []),
      `<g:identifier_exists>no</g:identifier_exists>`,
      ...(type ? [`<g:product_type>${xmlEscape(type)}</g:product_type>`] : []),
    ];
    return `    <item>\n      ${lines.join("\n      ")}\n    </item>`;
  });
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">`,
    `  <channel>`,
    `    <title>${xmlEscape(SITE_NAME)}</title>`,
    `    <link>${xmlEscape(`${SITE_URL}/${locale}`)}</link>`,
    `    <description>${xmlEscape(SITE_NAME)}</description>`,
    ...items,
    `  </channel>`,
    `</rss>`,
    "",
  ].join("\n");
}

/** YML wants local time with an offset: Tashkent, UTC+5, no DST. */
function ymlDate(now: Date): string {
  const t = new Date(now.getTime() + 5 * 3600_000).toISOString();
  return `${t.slice(0, 16)}+05:00`;
}

export function yandexFeed({
  products,
  categories,
  locale,
  now = new Date(),
}: {
  products: Product[];
  categories: Category[];
  locale: Locale;
  now?: Date;
}): string {
  const listed = feedProducts(products);
  const used = new Set(listed.map((p) => p.categorySlug).filter(Boolean));
  // YML category ids are numbers; the position in the catalogue's own order is stable enough per read.
  const shelves = categories.filter((c) => used.has(c.slug));
  const categoryId = new Map(shelves.map((c, i) => [c.slug, i + 1]));

  const offers = listed.map((p) => {
    const brand = brandOf(p);
    const cat = p.categorySlug ? categoryId.get(p.categorySlug) : undefined;
    const lines = [
      `<name>${xmlEscape(feedTitle(p))}</name>`,
      ...(brand ? [`<vendor>${xmlEscape(brand.name)}</vendor>`] : []),
      `<url>${xmlEscape(productUrl(p, locale))}</url>`,
      `<price>${Math.round(p.price)}</price>`,
      ...(onSale(p) ? [`<oldprice>${Math.round(p.oldPrice!)}</oldprice>`] : []),
      `<currencyId>UZS</currencyId>`,
      ...(cat ? [`<categoryId>${cat}</categoryId>`] : []),
      ...p.images.slice(0, 10).map((i) => `<picture>${xmlEscape(absolute(i.url))}</picture>`),
      `<delivery>true</delivery>`,
      `<description>${xmlEscape(plain(p.description || p.tagline || p.name, 3000, { markup: true }))}</description>`,
    ];
    return `      <offer id="${xmlEscape(p.id)}" available="true">\n        ${lines.join("\n        ")}\n      </offer>`;
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<yml_catalog date="${ymlDate(now)}">`,
    `  <shop>`,
    `    <name>${xmlEscape(SITE_NAME)}</name>`,
    `    <company>${xmlEscape(BRAND.legalName)}</company>`,
    `    <url>${xmlEscape(`${SITE_URL}/${locale}`)}</url>`,
    `    <currencies>`,
    `      <currency id="UZS" rate="1"/>`,
    `    </currencies>`,
    `    <categories>`,
    ...shelves.map((c) => `      <category id="${categoryId.get(c.slug)}">${xmlEscape(c.name)}</category>`),
    `    </categories>`,
    `    <offers>`,
    ...offers,
    `    </offers>`,
    `  </shop>`,
    `</yml_catalog>`,
    "",
  ].join("\n");
}
