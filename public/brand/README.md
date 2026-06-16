# Brand assets

Drop real brand files here, then point `src/lib/brand.ts` at them.

- **Logo**: add `logo.svg` (or `.png`) here and set `BRAND.logo = "/brand/logo.svg"`.
  The `<Logo>` component (header + footer) switches from the text wordmark to
  the image automatically.
- **Product photos**: add real photo URLs per product slug in
  `BRAND.productImageOverrides` (the override replaces the placeholder imagery).
  Remember to allow the image host in `next.config.ts` (`uzum.uz` is already
  allowed).
- **Colours**: edit the `@theme` tokens in `src/styles/globals.css`.
- **Fonts**: swap the two `next/font` families in `src/app/[locale]/layout.tsx`
  (keep the `--font-display` / `--font-sans` CSS variables).
