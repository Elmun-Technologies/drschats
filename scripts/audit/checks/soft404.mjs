/*
  A 404 that answers 200.

  Every dynamic segment on this site calls notFound() for a slug it does not
  know: products/[category], product/[slug], the three health families, blog,
  blog/category, experts and programs. Nine routes. Each one is a place where
  the response status can disagree with the response body, and when it does the
  page is a soft-404 — content that says "not found" over a status that says
  "here it is".

  This happened once already. products/loading.tsx put a Suspense boundary
  around the segment; the boundary flushes a 200 and a skeleton before the page
  function runs, so notFound() arrived too late to set the status. The file was
  deleted and CLAUDE.md was written to say why. It came back anyway, because
  nothing was checking.

  So this checks. It is a plain fetch rather than a browser navigation because
  the status code is the whole subject: a browser follows the stream and ends
  up rendering the right thing either way, which is exactly how the bug stayed
  invisible.

  The slugs are deliberately nonsense. If any of them ever becomes a real
  category or product, this check starts asserting the opposite of the truth
  and fails loudly, which is the correct outcome — someone then picks a
  different nonsense slug.
*/

const SHOULD_BE_404 = [
  "/products/yoq-kategoriya-xyz",
  "/product/yoq-mahsulot-xyz",
  "/goals/yoq-maqsad-xyz",
  "/symptoms/yoq-belgi-xyz",
  "/vitamins/yoq-vitamin-xyz",
  "/blog/yoq-maqola-xyz",
  "/blog/category/yoq-turkum-xyz",
  "/experts/yoq-mutaxassis-xyz",
  "/programs/yoq-dastur-xyz",
  "/sahifa-umuman-yoq-xyz",
];

/**
 * The other half of the assertion: a route that answers 200 for a slug it does
 * not know is only a bug if it still answers 200 for the ones it does. Without
 * these, a site-wide failure would read as a clean pass.
 */
const SHOULD_BE_200 = ["", "/products", "/goals", "/symptoms", "/vitamins", "/blog", "/experts", "/programs"];

export async function run(_browser, locale) {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  const findings = [];

  const check = async (path, expected) => {
    const url = `${base}/${locale}${path}`;
    let status;
    try {
      // Redirects are followed so a soft-404 cannot hide behind one, and the
      // body is read because a 200 carrying not-found copy is the exact
      // failure being looked for.
      const res = await fetch(url, { redirect: "follow" });
      status = res.status;
      const body = status === 200 ? await res.text() : "";
      const looksNotFound = /topilmadi|не найдена|not found/i.test(body);
      if (status === 200 && looksNotFound && expected === 404) {
        findings.push({ url, status, reason: "200 with not-found copy (soft-404)" });
        return;
      }
    } catch (err) {
      findings.push({ url, status: "unreachable", reason: String(err).slice(0, 80) });
      return;
    }
    if (status !== expected) findings.push({ url, status, expected });
  };

  await Promise.all([
    ...SHOULD_BE_404.map((p) => check(p, 404)),
    ...SHOULD_BE_200.map((p) => check(p, 200)),
  ]);

  return findings;
}
