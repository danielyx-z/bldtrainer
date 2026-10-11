# BLD Letter Pairs — 3x3 Blindfolded Trainer

Flashcard trainer for all 552 Speffz letter pairs (A–X). A pair pops up,
you picture your image, reveal, grade yourself. Weak pairs resurface first.

- `/` — trainer (Space = reveal, 1 = got it, 2 = learning, 3 = edit pair inline, Esc = close)
- `/pairs` — library: search, filter, edit every pair
- `/guide` — what letter pairs are + how to drill them

Custom words per pair (several allowed, first is primary), explicit
show/hide filter, per-letter rotation, weak-first sessions. Everything
persists in `localStorage` — no account, no backend.

## Run

```sh
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Set the canonical URL for SEO before deploying:

```sh
NEXT_PUBLIC_SITE_URL=https://your-domain.com npm run build
```

## Presets

`src/lib/presets.ts` is generated verbatim from `pairs.txt`:

```sh
python3 scripts/generate-presets.py
```

6 pairs missing from the paste are filled in: AN Ant, FR Frog, FS Fist,
FT Foot, GJ Godzilla, MN Moon. All 23 X pairs use SH replacements
(X sounds like SH: XA Shark, XV Shovel) instead of the pasted
Electric-__ scaffolding. Multi-word entries (`AD: Addison, Addicted`)
become multiple words; explicit words are pre-tagged.

## Stack

Next.js App Router + Tailwind v4, single variable font (Paper Mono, OFL —
see `public/fonts/OFL.txt`). Export/import JSON backup lives in Settings.
