import { redirect } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";

/* The order form lives on /cart now (design: CartV3). */
export default async function CheckoutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  redirect({ href: "/cart", locale });
}
