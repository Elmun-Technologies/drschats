import type { Locale } from "@/lib/i18n/routing";
import { BRAND } from "@/lib/brand";
import { discountPercent } from "@/lib/shop/discounts";
import { SHOW_SAMPLE_SOCIAL_PROOF } from "@/lib/content/sample-social-proof";
import type {
  Category,
  Product,
  Promotion,
  ShopflowClient,
  ProductListParams,
  ProductListResult,
  UpsellOffer,
  OrderRequest,
  OrderResult,
} from "@/lib/shopflow/types";
import type { RawCategory, RawProduct, RawPromotion } from "@/lib/shopflow/mock";
import { fold } from "@/lib/search/fold";
import { audienceOf } from "@/lib/quiz/audience-fit";

/*
  The catalogue's read logic, independent of where the rows come from: the
  built-in arrays (shopflow/mock.ts) or the database the admin panel writes
  (catalog/db.ts). Both hand over the same raw shape, so a product reads,
  filters, sorts and prices identically whichever source is live.
*/
export interface CatalogData {
  categories: RawCategory[];
  products: RawProduct[];
  promotions: RawPromotion[];
  /** Brand names for products that carry a `brandSlug`. */
  brands?: { slug: string; name: string }[];
}

export type OrderSink = (payload: OrderRequest) => Promise<OrderResult>;

const listed = (p: RawProduct) => (p.kind ?? "core") !== "unlisted";


function resolveCategory(c: RawCategory, data: CatalogData, locale: Locale): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name[locale],
    description: c.description[locale],
    image: c.image,
    // Counted the way the shelf lists (by slug, without withdrawn products). Counting by
    // categoryId kept "collagen" and "herbal" stocked while their pages showed nothing.
    productCount: data.products.filter((p) => p.categorySlug === c.slug && listed(p)).length,
  };
}

/*
  The reviews and ratings in the built-in data are sample copy, so they are
  withheld unless someone explicitly turns them on. Stripping them here rather
  than at each display site means the product page, the reviews page, the
  star ratings, the sitemap's rating boost and the Product structured data all
  go quiet together.
*/
function resolveProduct(p: RawProduct, data: CatalogData, locale: Locale): Product {
  /*
    A product with no photography of its own gets NO image rather than a
    recycled photo of a different product — the card falls back to its plain
    placeholder and the gallery stays away.
  */
  const photos = p.images?.length ? p.images : (BRAND.productImageOverrides[p.slug] ?? []);
  /*
    undefined = the source does not say (built-in rows → slug tables decide);
    null = the database says "none" (an admin cleared it) and must stay none.
  */
  const brand =
    p.brandSlug === undefined ? undefined : p.brandSlug ? (data.brands?.find((b) => b.slug === p.brandSlug) ?? null) : null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name[locale],
    tagline: p.tagline[locale],
    description: p.description[locale],
    categoryId: p.categoryId,
    categorySlug: p.categorySlug,
    price: p.price,
    oldPrice: p.oldPrice,
    currency: "UZS",
    rating: SHOW_SAMPLE_SOCIAL_PROOF ? p.rating : 0,
    reviewCount: SHOW_SAMPLE_SOCIAL_PROOF ? p.reviewCount : 0,
    inStock: p.inStock,
    images: photos.map((url) => ({ url, alt: p.name[locale] })),
    highlights: p.highlights[locale],
    benefits: p.benefits[locale],
    ingredients: p.ingredients[locale],
    howToUse: p.howToUse[locale],
    faq: p.faq[locale],
    reviews: SHOW_SAMPLE_SOCIAL_PROOF ? p.reviews[locale] : [],
    badges: p.badges[locale],
    servings: p.servings[locale],
    origin: p.origin[locale],
    /*
      Empty on purpose: the shop holds no certificates of its own, and
      manufacturer certificates are per batch, sent on request.
    */
    certifications: [],
    bespoke: p.bespoke,
    assortment: p.kind ?? "core",
    cutout: p.cutout,
    unit: p.unit,
    brand,
  };
}

function sortProducts(items: Product[], sort?: ProductListParams["sort"]): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price_desc":
      return copy.sort((a, b) => b.price - a.price);
    case "new":
      return copy.reverse();
    case "deals":
      // Deepest cut first; discounted or not, everything stays listed.
      return copy.sort((a, b) => discountPercent(b) - discountPercent(a));
    case "popular":
    default:
      // With review counts withheld this is a no-op on a stable sort, which
      // leaves the catalogue in its curated order.
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

function sampleOrderId() {
  return `MOCK-${Date.now().toString(36).toUpperCase()}`;
}

export class CatalogEngine implements ShopflowClient {
  constructor(
    private readonly load: () => Promise<CatalogData>,
    private readonly sink?: OrderSink,
  ) {}

  async getCategories(locale: Locale): Promise<Category[]> {
    const data = await this.load();
    return data.categories.map((c) => resolveCategory(c, data, locale));
  }

  async getProducts(params: ProductListParams): Promise<ProductListResult> {
    const {
      locale, category, search, origin, minPrice, maxPrice, sort,
      assortment = "listed", page = 1, pageSize = 12,
    } = params;
    const data = await this.load();
    let items = data.products
      // Products withdrawn from sale disappear from every listing unless a
      // caller explicitly asks for the whole archive.
      .filter((p) => assortment === "all" || listed(p))
      .map((p) => resolveProduct(p, data, locale));

    if (assortment === "core") items = items.filter((p) => p.assortment === "core");

    if (category) items = items.filter((p) => p.categorySlug === category);
    if (origin) items = items.filter((p) => p.origin === origin);
    if (minPrice != null) items = items.filter((p) => p.price >= minPrice);
    if (maxPrice != null) items = items.filter((p) => p.price <= maxPrice);
    if (search) {
      const q = fold(search);
      const aliasesFor = (slug: string) => {
        const raw = data.products.find((r) => r.slug === slug);
        return raw?.searchAliases ? Object.values(raw.searchAliases).flat() : [];
      };
      items = items.filter(
        (p) =>
          fold(p.name).includes(q) ||
          fold(p.tagline).includes(q) ||
          aliasesFor(p.slug).some((alias) => fold(alias).includes(q)),
      );
    }
    items = sortProducts(items, sort);

    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  }

  async getProduct(slug: string, locale: Locale): Promise<Product | null> {
    const data = await this.load();
    const raw = data.products.find((p) => p.slug === slug);
    return raw ? resolveProduct(raw, data, locale) : null;
  }

  /*
    The product page's add-on rail. There is no co-purchase data yet, so the
    reason claims nothing about other buyers; the pick is by relation: same
    audience (never a children's complex beside a men's formula), another
    category first — something that complements rather than duplicates —
    then the same category, each in catalogue order. Deterministic, because
    the order action re-reads this list to accept the rail's discount.
  */
  async getUpsells(productId: string, locale: Locale): Promise<UpsellOffer[]> {
    const data = await this.load();
    const current = data.products.find((p) => p.id === productId);
    if (!current) return [];
    const audience = audienceOf(current);
    const pool = data.products.filter(
      (p) => p.id !== productId && p.inStock && (p.kind ?? "core") === "core" && audienceOf(p) === audience,
    );
    // Rotated to start after the current product, so every page does not offer the same three.
    const at = data.products.indexOf(current);
    const split = pool.filter((p) => data.products.indexOf(p) < at).length;
    const ring = [...pool.slice(split), ...pool.slice(0, split)];
    const others = [
      ...ring.filter((p) => p.categorySlug !== current.categorySlug),
      ...ring.filter((p) => p.categorySlug === current.categorySlug),
    ]
      .slice(0, 3)
      .map((p) => resolveProduct(p, data, locale));
    const reasons: Record<Locale, string> = {
      uz: "Shu mahsulotga qoʻshimcha",
      ru: "Дополнение к этому товару",
    };
    return others.map((product) => ({ product, discountPercent: 15, reason: reasons[locale] }));
  }

  async getPromotions(locale: Locale): Promise<Promotion[]> {
    const data = await this.load();
    return data.promotions.map((p) => ({
      id: p.id,
      type: p.type,
      threshold: p.threshold,
      percent: p.percent,
      productSlugs: p.productSlugs,
      title: p.title[locale],
      description: p.description[locale],
    }));
  }

  async createOrder(payload: OrderRequest): Promise<OrderResult> {
    if (this.sink) return this.sink(payload);
    const orderId = sampleOrderId();
    if (process.env.NODE_ENV !== "production") {
      console.info("[catalog] order received (no database)", orderId);
    }
    return { ok: true, orderId, message: "Order received (no database)." };
  }
}
