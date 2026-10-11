import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import { Header } from "@/components/Header";

const paperMono = localFont({
  src: "../../public/fonts/PaperMono-var.woff2",
  variable: "--font-paper-mono",
  weight: "100 800",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bld-letter-pairs.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BLD Letter Pairs — 3x3 Blindfolded Trainer",
    template: "%s · BLD Letter Pairs",
  },
  description:
    "Drill all 552 Speffz letter pairs for 3x3 blindfolded solving. Flashcards with presets, custom words, weak-pair tracking. Free, no account, data stays in your browser.",
  keywords: [
    "BLD",
    "letter pairs",
    "3BLD",
    "blindfolded cubing",
    "Speffz",
    "memo training",
    "Rubik's cube blindfolded",
  ],
  authors: [{ name: "BLD Pairs" }],
  openGraph: {
    type: "website",
    siteName: "BLD Letter Pairs",
    title: "BLD Letter Pairs — 3x3 Blindfolded Trainer",
    description:
      "Flashcard trainer for all 552 Speffz letter pairs. Keep the presets or set your own.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BLD Letter Pairs — 3x3 Blindfolded Trainer",
    description:
      "Flashcard trainer for all 552 Speffz letter pairs. Keep the presets or set your own.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f2efe9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${paperMono.variable} h-full`}>
      <body className="flex h-dvh flex-col overflow-hidden font-mono">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "BLD Letter Pairs",
              url: SITE_URL,
              description:
                "Flashcard trainer for 3x3 blindfolded letter pairs (Speffz A–X).",
            }),
          }}
        />
        <StoreProvider>
          <Header />
          <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-4">
            {children}
          </main>
          <footer className="shrink-0 border-t rule">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] tracking-widest uppercase opacity-60">
              <span className="tabular-nums">pairs 552 · images 612 · letters a–x</span>
              <span>set in paper mono</span>
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
