import type { Metadata } from "next";
import { Trainer } from "@/components/Trainer";

export const metadata: Metadata = {
  description:
    "Flashcard drills for all 552 3x3 BLD letter pairs. See a pair, recall your image, grade yourself. Weak pairs resurface first.",
  alternates: { canonical: "/" },
};

export default function TrainPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 shrink-0">
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">
          Pair trainer
        </h1>
        <p className="hide-short mt-1 text-sm opacity-70">
          Look at the pair, recall your image, then reveal and mark
          whether you knew it.
        </p>
      </div>
      <Trainer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "BLD Letter Pairs Trainer",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0" },
            description:
              "Flashcard trainer for 3x3 blindfolded letter pairs with presets and custom words.",
          }),
        }}
      />
    </div>
  );
}
