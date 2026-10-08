import type { Locale } from "@/lib/i18n/routing";

/** Money is stored as an integer amount of Uzbek so'm (UZS). */
export type Money = number;
export type Currency = "UZS";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductBenefit {
  icon?: string;
  title: string;
  description: string;
}

export interface IngredientRow {
  name: string;
  amount: string;
  dailyValue?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

/**
 * How a product sits in the assortment.
 *
 * `core`   — the three brand lines the shop is built on (Swiss Energy, Dr.
 *            Frei, Delical). These are what promotional rails may show.
 * `addon`  — a real product that exists to grow the basket (balms, measuring
 *            devices). Buyable and listed, never the subject of a campaign.
 * `unlisted` — no longer sold: kept in the data so old links and orders still
 *            resolve, hidden from the catalogue, rails and sitemap.
 */
export type Assortment = "core" | "addon" | "unlisted";

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categoryId?: string | null;
  categorySlug?: string | null;
  price: Money;
  oldPrice?: Money;
  currency: Currency;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  images: ProductImage[];
  highlights: string[];
  benefits: ProductBenefit[];
  ingredients: IngredientRow[];
  howToUse: string;
  faq: FaqItem[];
  reviews: Review[];
  badges: string[];
  servings?: string | number;
  origin?: string;
  /** Quality marks shown in the sourcing-transparency block (cGMP, ISO, Halal…). */
  certifications?: string[];
  /** Whether a hand-crafted bespoke page component exists for this product. */
  bespoke: boolean;
  /** Position in the assortment — see {@link Assortment}. Absent = core. */
  assortment?: Assortment;
  /**
   * Catalogue facts that used to live only in slug-keyed tables
   * (content/product-cutouts, -units, -brands). A product added in the admin
   * panel carries them itself; read through lib/catalog/product-facts, which
   * falls back to the tables for the built-in catalogue.
   */
  cutout?: string | null;
  unit?: { count: number; unit: "tablet" | "capsule" } | null;
  brand?: { slug: string; name: string } | null;
}

export type PromotionType =
  | "free_shipping_over"
  | "buy_x_get_y"
  | "percent_off";

export interface Promotion {
  id: string;
  type: PromotionType;
  title: string;
  description: string;
  /** Cart subtotal threshold (free_shipping_over). */
  threshold?: Money;
  /** Percentage value (percent_off). */
  percent?: number;
}

export interface UpsellOffer {
  product: Product;
  discountPercent: number;
  reason: string;
}

export interface ProductListParams {
  locale: Locale;
  category?: string;
  /**
   * Which part of the assortment to return. Defaults to everything that is
   * still on sale (core + addons); `"core"` is what the home-page rails ask
   * for, so an accessory never becomes the face of a campaign.
   */
  assortment?: "listed" | "core" | "all";
  search?: string;
  origin?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "popular" | "price_asc" | "price_desc" | "new" | "deals";
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderRequestItem {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  /** Present when the line is a repeating delivery, with its rhythm in days. */
  subscription?: { intervalDays: number };
  /** The offer discount the line was added with (upsell ladder, rail, program). Checked on the server. */
  upsellDiscountPercent?: number;
}

export interface OrderAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landing?: string;
  referrer?: string;
}

export interface OrderRequest {
  customer: {
    name: string;
    phone: string;
    /** Optional: used for the order confirmation, never required to order. */
    email?: string;
    /** True when the customer ticked the newsletter box on the order form. */
    marketingOptIn?: boolean;
  };
  delivery: {
    region: string;
    address: string;
    note?: string;
    method: string;
  };
  /**
   * How the customer intends to pay. `online` names the provider the payment
   * page belongs to; `cod` is cash or card on delivery.
   */
  payment?: {
    method: "online" | "cod";
    provider?: "payme" | "click" | "uzum";
  };
  items: OrderRequestItem[];
  appliedUpsells: string[];
  appliedPromotions: string[];
  totals: {
    subtotal: Money;
    discount: Money;
    shipping: Money;
    total: Money;
  };
  locale: Locale;
  attribution?: OrderAttribution;
}

export interface OrderResult {
  ok: boolean;
  orderId?: string;
  message?: string;
}

/** The contract every Shopflow client (mock or real HTTP) implements. */
export interface ShopflowClient {
  getCategories(locale: Locale): Promise<Category[]>;
  getProducts(params: ProductListParams): Promise<ProductListResult>;
  getProduct(slug: string, locale: Locale): Promise<Product | null>;
  getUpsells(productId: string, locale: Locale): Promise<UpsellOffer[]>;
  getPromotions(locale: Locale): Promise<Promotion[]>;
  createOrder(payload: OrderRequest): Promise<OrderResult>;
}
