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
- **Fonts**: self-hosted via `next/font/local` in `src/app/[locale]/layout.tsx`
  and `src/app/global-not-found.tsx`. Weight files live in `src/fonts/<family>/`
  as `.woff2` (keep the `--font-display` / `--font-sans` CSS variables in
  `src/styles/globals.css` pointed at the font's `variable`).
