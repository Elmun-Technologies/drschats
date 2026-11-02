"use client";

import Link from "next/link";

/*
  The last boundary: an error in a root layout itself. It replaces the whole
  document, so it brings its own <html> and plain styles — the stylesheet and
  the locale may be what failed. Both languages, since the locale is unknown.
*/
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="uz">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#17191B", background: "#FFFFFF" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "15vh 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontSize: 28, lineHeight: "34px", margin: 0 }}>Nimadir notoʻgʻri ketdi</h1>
          <p lang="ru" style={{ fontSize: 17, margin: 0, color: "#44494E" }}>Что-то пошло не так</p>
          <p style={{ fontSize: 15, lineHeight: "24px", margin: 0, color: "#44494E" }}>
            Sahifani yangilang. Buyurtma berayotgan boʻlsangiz, savatingiz saqlangan.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{ minHeight: 48, padding: "0 20px", borderRadius: 12, border: 0, background: "#17191B", color: "#FFFFFF", fontSize: 16, fontWeight: 600, cursor: "pointer" }}
            >
              Qayta urinish · Повторить
            </button>
            <Link href="/" style={{ minHeight: 48, padding: "0 20px", borderRadius: 12, background: "#F1F3F0", color: "#17191B", fontSize: 16, fontWeight: 600, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              Bosh sahifa · Главная
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
