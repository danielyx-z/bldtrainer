"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "./StoreProvider";
import { PairEditor } from "./PairEditor";
import { ALL_PAIRS, LETTERS } from "@/lib/letters";
import {
  accuracy,
  isHiddenByFilter,
  isWeak,
  visibleWords,
} from "@/lib/store";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function codepoints(pair: string): string {
  return pair
    .split("")
    .map(
      (c) => "U+" + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0"),
    )
    .join(" · ");
}

function meter(done: number, total: number): string {
  const cells = 24;
  const filled = Math.round((done / Math.max(total, 1)) * cells);
  return "█".repeat(filled) + "░".repeat(cells - filled);
}

export function Trainer() {
  const { overrides, progress, settings, updateSettings, grade, ready } =
    useStore();
  const [deck, setDeck] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sessionGrades, setSessionGrades] = useState<
    { pair: string; known: boolean }[]
  >([]);
  const [editing, setEditing] = useState(false);
  const [started, setStarted] = useState(false);

  const eligibleCount = useMemo(() => {
    return ALL_PAIRS.filter(
      (p) =>
        settings.letters.includes(p[0]) &&
        !isHiddenByFilter(p, overrides, settings.showExplicit),
    ).length;
  }, [settings.letters, settings.showExplicit, overrides]);

  const start = useCallback(
    (len?: number) => {
      let pool = ALL_PAIRS.filter(
        (p) =>
          settings.letters.includes(p[0]) &&
          !isHiddenByFilter(p, overrides, settings.showExplicit),
      );
      pool = shuffle(pool);
      if (settings.weakFirst) {
        const weak = pool.filter((p) => isWeak(p, progress));
        const rest = pool.filter((p) => !isWeak(p, progress));
        pool = [...shuffle(weak), ...rest];
      }
      const sessionLen = len ?? settings.sessionLength;
      const n =
        sessionLen >= 552 ? pool.length : Math.min(sessionLen, pool.length);
      setDeck(pool.slice(0, n));
      setIndex(0);
      setRevealed(false);
      setExpanded(false);
      setSessionGrades([]);
      setStarted(true);
    },
    [
      settings.letters,
      settings.showExplicit,
      settings.sessionLength,
      settings.weakFirst,
      overrides,
      progress,
    ],
  );

  // Start first session once stored settings hydrate, so the deck
  // matches saved prefs (length, letters, filters) instead of defaults.
  useEffect(() => {
    // Initial deck build from hydrated store; runs once when ready flips true.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!started && ready) start();
  }, [started, ready, start]);

  const pair = deck[index];
  const done = started && deck.length > 0 && index >= deck.length;

  const doGrade = useCallback(
    (known: boolean) => {
      if (!pair || !revealed) return;
      grade(pair, known);
      setSessionGrades((g) => [...g, { pair, known }]);
      setIndex((i) => i + 1);
      setRevealed(false);
      setExpanded(false);
    },
    [pair, revealed, grade],
  );

  const reveal = useCallback(() => {
    setRevealed(true);
    setExpanded(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editing) setEditing(false);
        return;
      }
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      if (editing) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!revealed) reveal();
      } else if (e.key === "1") {
        if (revealed) doGrade(true);
      } else if (e.key === "2") {
        if (revealed) doGrade(false);
      } else if (e.key === "3") {
        e.preventDefault();
        setEditing(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, editing, reveal, doGrade]);

  const sessionKnown = sessionGrades.filter((g) => g.known).length;
  const totalSeen = Object.values(progress).reduce((a, p) => a + p.seen, 0);
  const totalKnown = Object.values(progress).reduce((a, p) => a + p.known, 0);
  const weakCount = ALL_PAIRS.filter((p) => isWeak(p, progress)).length;

  const words = pair
    ? visibleWords(pair, overrides, settings.showExplicit)
    : [];
  const limit =
    settings.wordsPerPair === "all" ? words.length : settings.wordsPerPair;
  const shown = expanded ? words : words.slice(0, limit);
  const hidden = words.length - shown.length;
  const pairAcc = pair ? accuracy(progress[pair]) : null;

  if (!started || !ready) return null;

  if (deck.length === 0) {
    return (
      <div className="card mx-auto max-w-xl px-6 py-10 text-center">
        <p className="label mb-2">Empty deck</p>
        <p className="text-sm">
          No pairs match the current filters. Enable some letters or turn
          explicit words back on in settings.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-1">
          {LETTERS.map((l) => {
            const on = settings.letters.includes(l);
            return (
              <button
                key={l}
                className={`border rule w-7 py-1 text-xs ${on ? "bg-[var(--color-coal)] text-[var(--color-paper)]" : "opacity-40"}`}
                onClick={() =>
                  updateSettings({
                    letters: on
                      ? settings.letters.filter((x) => x !== l)
                      : [...settings.letters, l].sort(),
                  })
                }
              >
                {l}
              </button>
            );
          })}
        </div>
        <button className="btn mt-4" onClick={() => start()}>
          Retry
        </button>
      </div>
    );
  }

  if (done) {
    const weak = sessionGrades.filter((g) => !g.known).map((g) => g.pair);
    const pct =
      sessionGrades.length > 0
        ? Math.round((sessionKnown / sessionGrades.length) * 100)
        : 0;
    return (
      <div className="card mx-auto max-w-xl px-6 py-8">
        <p className="label mb-2">Session complete</p>
        <p className="text-5xl font-bold tracking-tight">
          {pct}
          <span className="text-2xl opacity-50">%</span>
        </p>
        <p className="mt-2 text-sm opacity-70">
          {sessionKnown} of {sessionGrades.length} marked known
          {deck.length < eligibleCount
            ? ` · ${eligibleCount} eligible in rotation`
            : ""}
        </p>
        {weak.length > 0 && (
          <div className="mt-4">
            <p className="label mb-2">Still learning ({weak.length})</p>
            <p className="text-sm leading-7">
              {weak.map((p) => (
                <span key={p} className="mr-2 border rule px-1">
                  {p}
                </span>
              ))}
            </p>
          </div>
        )}
        <div className="mt-6 flex gap-2">
          <button className="btn btn-solid flex-1" onClick={() => start()}>
            Train again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="m-auto w-full max-w-xl py-2">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] sm:text-xs">
        <span className="label tabular-nums">
          {String(index + 1).padStart(3, "0")} /{" "}
          {String(deck.length).padStart(3, "0")}
        </span>
        <span className="label tabular-nums">
          seen {totalSeen} · known{" "}
          {totalSeen > 0 ? Math.round((totalKnown / totalSeen) * 100) : 0}% ·
          weak {weakCount}
        </span>
      </div>
      <p
        className="mb-2 text-sm tracking-tight opacity-70 tabular-nums select-none sm:mb-4"
        role="progressbar"
        aria-valuenow={index}
        aria-valuemax={deck.length}
        aria-label="Session progress"
      >
        {meter(index, deck.length)}{" "}
        {Math.round((index / deck.length) * 100)}%
      </p>

      <div className="card relative flex h-[clamp(300px,46dvh,460px)] flex-col px-4 py-5 text-center sm:px-6 sm:py-6">
        <span aria-hidden className="absolute top-2 left-3 opacity-40 select-none">+</span>
        <span aria-hidden className="absolute top-2 right-3 opacity-40 select-none">+</span>
        <span aria-hidden className="absolute bottom-2 left-3 opacity-40 select-none">+</span>
        <span aria-hidden className="absolute right-3 bottom-2 opacity-40 select-none">+</span>

        {editing ? (
          <div className="mx-auto h-full w-full max-w-sm overflow-y-auto text-left">
            <PairEditor pair={pair} onClose={() => setEditing(false)} />
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center">
            <p className="label mb-3">
              {revealed ? "Did you get it?" : "Think of your image"}
            </p>
            <p
              className="flex items-center justify-center gap-[0.1em] leading-none font-bold tracking-tight tabular-nums text-[clamp(3rem,12dvh,6rem)]"
              aria-live="polite"
            >
              <span>{pair[0]}</span>
              <span>{pair[1]}</span>
            </p>
            <p className="label mt-2 tabular-nums">{codepoints(pair)}</p>

            <div className="mx-auto mt-4 max-w-sm min-h-[100px] w-full">
              {revealed && (
                <div className="animate-rise-in border-t rule pt-3">
                  {words.length === 0 ? (
                    <p className="text-sm opacity-60">
                      No words for this pair yet. Add your own below.
                    </p>
                  ) : (
                    <ul className="max-h-[16dvh] space-y-1.5 overflow-y-auto">
                      {shown.map((w, i) => (
                        <li key={`${w.text}-${i}`} className="text-lg leading-7">
                          <span className={i > 0 ? "opacity-70" : ""}>
                            {w.text}
                          </span>{" "}
                          <span className="ml-1 align-middle text-[10px] tracking-widest uppercase opacity-50">
                            {w.custom ? "yours" : "preset"}
                            {w.explicit ? " · explicit" : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {hidden > 0 && (
                    <button
                      className="mt-2 text-xs underline opacity-70"
                      onClick={() => setExpanded(true)}
                    >
                      +{hidden} more
                    </button>
                  )}
                  <p className="label mt-3 min-h-4 tabular-nums">
                    {pairAcc !== null
                      ? `pair accuracy ${Math.round(pairAcc * 100)}% · seen ${progress[pair].seen}`
                      : " "}
                  </p>
                </div>
              )}
            </div>

            <div className="mx-auto mt-4 w-full max-w-sm">
              {!revealed ? (
                <button className="btn w-full" onClick={reveal}>
                  Reveal [Space]
                </button>
              ) : (
                <div className="animate-rise-in flex gap-2">
                  <button
                    className="btn btn-solid flex-1"
                    onClick={() => doGrade(true)}
                  >
                    Got it [1]
                  </button>
                  <button className="btn flex-1" onClick={() => doGrade(false)}>
                    Learning [2]
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="label">Length</span>
          {[10, 25, 50, 552].map((n) => (
            <button
              key={n}
              className={`border rule px-2 py-0.5 tabular-nums ${settings.sessionLength === n ? "bg-[var(--color-coal)] text-[var(--color-paper)]" : "opacity-60"}`}
              onClick={() => {
                updateSettings({ sessionLength: n });
                start(n);
              }}
            >
              {n === 552 ? "All" : n}
            </button>
          ))}
        </div>
        <button
          className="lowercase underline opacity-70"
          onClick={() => setEditing((v) => !v)}
        >
          edit pair [3]
        </button>
      </div>
      <div className="mt-2 flex min-h-4 items-center justify-between text-xs">
        {editing ? (
          <p className="w-full text-center opacity-60">
            type your word, Enter to add, Esc when done
          </p>
        ) : (
          <>
            <label className="flex cursor-pointer items-center gap-2 opacity-70">
              <input
                type="checkbox"
                checked={settings.weakFirst}
                onChange={(e) =>
                  updateSettings({ weakFirst: e.target.checked })
                }
              />
              Weak first
            </label>
            <button className="underline opacity-70" onClick={() => start()}>
              Restart session
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
