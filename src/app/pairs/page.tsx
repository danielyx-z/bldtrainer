import type { Metadata } from "next";
import { PairsBrowser } from "@/components/PairsBrowser";

export const metadata: Metadata = {
  description:
    "Browse, search and edit all 552 Speffz letter pairs. Add your own words, keep several per pair, flag explicit ones.",
  alternates: { canonical: "/pairs" },
};

export default function PairsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 shrink-0">
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">Pair library</h1>
        <p className="hide-short mt-1 text-sm opacity-70">
          Every pair A to X. Click a row to add your own words. Yours
          are used in training first.
        </p>
      </div>
      <PairsBrowser />
    </div>
  );
}
