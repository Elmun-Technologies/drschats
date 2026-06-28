import { z } from "zod";

/*
  Runtime validation. The mock client returns data that satisfies these, and
  the HTTP client validates real Shopflow responses against them — so a schema
  mismatch is caught immediately at the boundary instead of crashing the UI.
*/

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  productCount: z.number().optional(),
});

export const productImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
});

export const productBenefitSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
});

export const ingredientRowSchema = z.object({
  name: z.string(),
  amount: z.string(),
  dailyValue: z.string().optional(),
});

export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const reviewSchema = z.object({
  author: z.string(),
  rating: z.number(),
  date: z.string(),
  text: z.string(),
});

export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  categoryId: z.string().nullable().optional(),
  categorySlug: z.string().nullable().optional(),
  price: z.number(),
  oldPrice: z.number().optional(),
  currency: z.literal("UZS"),
  rating: z.number(),
  reviewCount: z.number(),
  inStock: z.boolean(),
  images: z.array(productImageSchema),
  highlights: z.array(z.string()),
  benefits: z.array(productBenefitSchema),
  ingredients: z.array(ingredientRowSchema),
  howToUse: z.string(),
  faq: z.array(faqItemSchema),
  reviews: z.array(reviewSchema),
  badges: z.array(z.string()),
  servings: z.union([z.string(), z.number()]).transform(String).optional(),
  origin: z.string().optional(),
  certifications: z.array(z.string()).default([]),
  bespoke: z.boolean(),
});

export const promotionSchema = z.object({
  id: z.string(),
  type: z.enum(["free_shipping_over", "buy_x_get_y", "percent_off"]),
  title: z.string(),
  description: z.string(),
  threshold: z.number().optional(),
  percent: z.number().optional(),
});

export const upsellOfferSchema = z.object({
  product: productSchema,
  discountPercent: z.number(),
  reason: z.string(),
});

export const productListResultSchema = z.object({
  items: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const orderRequestSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
  }),
  delivery: z.object({
    region: z.string().min(1),
    address: z.string().min(3),
    note: z.string().optional(),
    method: z.string(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        slug: z.string(),
        name: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number(),
      }),
    )
    .min(1),
  appliedUpsells: z.array(z.string()),
  appliedPromotions: z.array(z.string()),
  totals: z.object({
    subtotal: z.number(),
    discount: z.number(),
    shipping: z.number(),
    total: z.number(),
  }),
  locale: z.enum(["ru", "uz"]),
  attribution: z
    .object({
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
      landing: z.string().optional(),
      referrer: z.string().optional(),
    })
    .optional(),
});

export const orderResultSchema = z.object({
  ok: z.boolean(),
  orderId: z.string().optional(),
  message: z.string().optional(),
});
