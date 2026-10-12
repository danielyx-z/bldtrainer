"use client";

import { useMemo, useState } from "react";
import { useStore } from "./StoreProvider";
import { PairEditor } from "./PairEditor";
import { ALL_PAIRS, LETTERS } from "@/lib/letters";
import {
  accuracy,
  hasCustom,
  isHiddenByFilter,
  isWeak,
  visibleWords,
} from "@/lib/store";

export function PairsBrowser() {
  const { overrides, progress, settings } = useStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<string>("ALL");
  const [mineOnly, setMineOnly] = useState(false);
  const [weakOnly, setWeakOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const letters = tab === "ALL" ? LETTERS : [tab];
    return letters
      .map((letter) => ({
        letter,
        pairs: ALL_PAIRS.filter(
          (p) => p[0] === letter,
        ).filter((pair) => {
          if (mineOnly && !hasCustom(pair, overrides)) return false;
          if (weakOnly && !isWeak(pair, progress)) return false;
          if (q) {
            const words = visibleWords(pair, overrides, true)
              .map((w) => w.text.toLowerCase())
              .join(" ");
            if (!pair.toLowerCase().includes(q) && !words.includes(q))
              return false;
          }
          return true;
        }),
      }))
      .filter((g) => g.pairs.length > 0);
  }, [query, tab, mineOnly, weakOnly, overrides, progress]);

  const matchCount = groups.reduce((a, g) => a + g.pairs.length, 0);

  const customCount = Object.keys(overrides).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="card mb-3 shrink-0 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="field sm:max-w-xs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pair or word…"
            aria-label="Search pairs"
          />
          <div className="flex items-center gap-4 text-xs">
            <label className="flex cursor-pointer items-center gap-1 opacity-80">
              <input
                type="checkbox"
                checked={mineOnly}
                onChange={(e) => setMineOnly(e.target.checked)}
              />
              Mine only ({customCount})
            </label>
            <label className="flex cursor-pointer items-center gap-1 opacity-80">
              <input
                type="checkbox"
                checked={weakOnly}
                onChange={(e) => setWeakOnly(e.target.checked)}
              />
              Weak only
            </label>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label="Filter by first letter">
          {["ALL", ...LETTERS].map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={tab === l}
              className={`border rule px-2 py-0.5 text-xs tabular-nums ${tab === l ? "bg-[var(--color-coal)] text-[var(--color-paper)]" : "opacity-60"}`}
              onClick={() => setTab(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="label mb-2 shrink-0 tabular-nums" aria-live="polite">
        {matchCount} / 552 pairs
      </p>

      {matchCount === 0 ? (
        <div className="card px-4 py-8 text-center text-sm opacity-70">
          Nothing matches. Try a different search or clear the filters.
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto">
          {groups.map(({ letter, pairs }) => (
            <section key={letter} aria-label={`Pairs starting with ${letter}`}>
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-sm font-bold tracking-tight">
                  {letter}
                  <span className="font-normal opacity-50">.glyph</span>
                </h2>
                <p className="label tabular-nums">
                  {pairs.length} / 23
                </p>
              </div>
              <ul className="divide-y divide-[var(--color-ink)] border rule">
                {pairs.map((pair) => {
            const words = visibleWords(pair, overrides, true);
            const primary = words[0];
            const mine = hasCustom(pair, overrides);
            const acc = accuracy(progress[pair]);
            const hidden = isHiddenByFilter(
              pair,
              overrides,
              settings.showExplicit,
            );
            const open = expanded === pair;
            return (
              <li key={pair}>
                <button
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-paper-deep)]"
                  onClick={() => setExpanded(open ? null : pair)}
                  aria-expanded={open}
                >
                  <span className="w-12 shrink-0 text-sm font-bold tabular-nums">
                    {pair}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {primary ? (
                      <span className={hidden ? "blur-word" : ""}>
                        {primary.text}
                      </span>
                    ) : (
                      <span className="opacity-50">no words yet</span>
                    )}
                    {words.length > 1 && (
                      <span className="ml-2 text-xs tabular-nums opacity-50">
                        +{words.length - 1}
                      </span>
                    )}
                  </span>
                  <span className="hidden shrink-0 gap-1 sm:flex">
                    {mine && (
                      <span className="border rule px-1 text-[10px] tracking-widest uppercase">
                        yours
                      </span>
                    )}
                    {isWeak(pair, progress) && (
                      <span className="border rule px-1 text-[10px] tracking-widest uppercase opacity-60">
                        weak
                      </span>
                    )}
                    {acc !== null && (
                      <span className="px-1 text-[10px] tabular-nums opacity-60">
                        {Math.round(acc * 100)}%
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs lowercase opacity-40">
                    {open ? "close" : "edit →"}
                  </span>
                </button>
                {open && (
                  <div className="border-t border-dashed border-[var(--color-ink-faint)] px-3 py-3">
                    <PairEditor
                      pair={pair}
                      onClose={() => setExpanded(null)}
                    />
                  </div>
                )}
              </li>
            );
          })}
                </ul>
              </section>
            ))}
          </div>
        )}
    </div>
  );
}
