import { notFound } from "next/navigation";
import { isApiConfigured } from "@/lib/api/client";
import { accountAreaAvailable } from "@/lib/config/demo";

/*
  The account area exists only when it has something true to show: the real
  API, or the demo cabinet switched on deliberately (src/lib/config/demo.ts).
  notFound() rather than a redirect — /account is not a page that moved, it is
  one that does not currently exist. Every /account route calls this.
*/
export function assertAccountAreaExists() {
  if (!accountAreaAvailable(isApiConfigured())) notFound();
}
