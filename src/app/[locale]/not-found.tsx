import type { Metadata } from "next";
import { NotFoundView } from "@/components/layout/NotFoundView";

/*
  A 404 had no <title> at all; the client view cannot export metadata, so this
  wrapper does. Both languages in one fixed string: reading the locale here
  goes through request headers, which turns the statically generated product
  and topic pages that call notFound() into a 500 at runtime.
*/
export const metadata: Metadata = {
  title: "Sahifa topilmadi · Страница не найдена | Go Vita",
  robots: { index: false },
};

export default function NotFound() {
  return <NotFoundView />;
}
