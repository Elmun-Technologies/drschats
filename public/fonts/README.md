# Fonts

Self-hosted so the build never depends on fonts.googleapis.com (a failed
fetch there broke the CI build once, through `next/font/google`).

| Folder | Face | Source | Licence |
|---|---|---|---|
| `onest-v11/` | Onest, variable `wght`, subsets latin, latin-ext, cyrillic, cyrillic-ext | Google Fonts (`fonts.gstatic.com/s/onest/v11`) | SIL Open Font License 1.1 — Copyright 2021 The Onest Project Authors (https://github.com/simpals/onest) |
| `playfair-v40/` | Playfair Display 500, latin (the wordmark only) | Google Fonts (`fonts.gstatic.com/s/playfairdisplay/v40`) | SIL Open Font License 1.1 — Copyright 2017 The Playfair Display Project Authors, Reserved Font Name "Playfair Display" |

The `@font-face` rules, with Google's unicode ranges, are in
`src/styles/globals.css`. The version is in the folder name because the files
are served with an immutable cache header (`next.config.ts`): a new version
goes into a new folder.
