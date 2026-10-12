import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "What letter pairs are, how Speffz A to X memo works for 3x3 blindfolded, and how to drill them with flashcards.",
  alternates: { canonical: "/guide" },
};

const FAQ = [
  {
    q: "How many pairs are there?",
    a: "552. Twenty four letters, ordered, no doubles. AB and BA are different pairs.",
  },
  {
    q: "Do I need them all before my first solve?",
    a: "No. Learn the lettering, do slow solves, invent images on the fly. Look up the pairs that will not stick.",
  },
  {
    q: "What makes a good image?",
    a: "Something concrete and distinct from its neighbors. Frog beats future. People beat abstractions. Rude and funny images stick, which is why some presets are crude.",
  },
  {
    q: "What about X and Q?",
    a: "Few English words fit. X presets here use SH sounds: XA is Shark, XV is Shovel. Replace them when you find better.",
  },
  {
    q: "Where is my data?",
    a: "In your browser only. Nothing is uploaded. Export JSON in settings to back it up.",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <article className="mx-auto max-w-2xl pb-6">
        <p className="label mb-2">Guide</p>
        <h1 className="text-2xl font-bold tracking-tight">
          Letter pairs for 3x3 blindfolded
        </h1>
        <p className="mt-3 text-sm leading-6">
          A blindfolded solve is memorized as letters, one per sticker.
          Two letters at a time get compressed into a single image. UF
          is a UFO. FR is a frog. A full memo is a chain of these
          images.
        </p>

        <dl className="card mt-6 px-4 py-3" aria-label="Trainer specs">
          <div className="label mb-1">Spec</div>
          {[
            ["Pairs", "552"],
            ["Preset images", "612"],
            ["Letters", "A to X, Speffz"],
            ["Doubles", "skipped"],
            ["X pairs", "SH replacements"],
            ["Storage", "browser only"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between border-t border-dashed border-[var(--color-ink-faint)] py-1.5 text-sm"
            >
              <dt className="opacity-60">{k}</dt>
              <dd className="tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <p aria-hidden className="my-8 text-center tracking-[0.5em] opacity-30 select-none">
          ───
        </p>

        <h2 className="text-lg font-bold tracking-tight">
          The lettering scheme
        </h2>
        <p className="mt-2 text-sm leading-6">
          The standard is Speffz. Every sticker gets a letter from A to
          X. Each face is read clockwise from its top left sticker, with
          white on top and green in front. Order matters, so train both
          directions of every pair.
        </p>

        <p aria-hidden className="my-8 text-center tracking-[0.5em] opacity-30 select-none">
          ───
        </p>

        <h2 className="text-lg font-bold tracking-tight">
          One image per pair
        </h2>
        <p className="mt-2 text-sm leading-6">
          Pick one image per pair and reuse it in every solve. During
          memo, chain the images into a story along a familiar route.
          Two pairs per location is a common rhythm. When an image keeps
          failing, replace it instead of drilling it harder.
        </p>

        <p aria-hidden className="my-8 text-center tracking-[0.5em] opacity-30 select-none">
          ───
        </p>

        <h2 className="text-lg font-bold tracking-tight">How to drill</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
          <li>
            Run 20 cards. Recall the image before you reveal. Keys: Space
            to reveal, 1 for got it, 2 for learning, 3 to edit.
          </li>
          <li>
            Mark got it only if the image came unprompted. Anything under
            70 percent counts as weak and jumps the queue.
          </li>
          <li>
            Rewrite presets you keep missing in the{" "}
            <Link href="/pairs" className="underline">
              library
            </Link>
            . First word is primary.
          </li>
        </ul>

        <p aria-hidden className="my-8 text-center tracking-[0.5em] opacity-30 select-none">
          ───
        </p>

        <h2 className="text-lg font-bold tracking-tight">FAQ</h2>
        <div className="mt-2 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="card px-4 py-3">
              <summary className="cursor-pointer text-sm font-bold">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-6 opacity-80">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="card mt-8 px-4 py-4">
          <p className="label mb-2">Next step</p>
          <div className="flex gap-2">
            <Link href="/" className="btn btn-solid flex-1 text-center">
              Start training
            </Link>
            <Link href="/pairs" className="btn flex-1 text-center">
              Browse pairs
            </Link>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            }),
          }}
        />
      </article>
    </div>
  );
}
