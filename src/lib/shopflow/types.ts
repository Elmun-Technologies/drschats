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
  search?: string;
  origin?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "popular" | "price_asc" | "price_desc" | "new";
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
  };
  delivery: {
    region: string;
    address: string;
    note?: string;
    method: string;
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
