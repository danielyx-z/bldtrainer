"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "./StoreProvider";
import { PRESETS } from "@/lib/presets";
import { makeId } from "@/lib/store";

export function PairEditor({
  pair,
  onClose,
}: {
  pair: string;
  onClose: () => void;
}) {
  const { overrides, setPairWords } = useStore();
  const [draft, setDraft] = useState("");
  const [draftExplicit, setDraftExplicit] = useState(false);

  const customs = overrides[pair] ?? [];
  const presets = PRESETS[pair] ?? [];
  const [nudged, setNudged] = useState<{ id: string; dir: -1 | 1 } | null>(
    null,
  );
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement | null>());

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setPairWords(pair, [
      ...customs,
      { id: makeId(), text, explicit: draftExplicit },
    ]);
    setDraft("");
    setDraftExplicit(false);
  };

  const move = (id: string, dir: -1 | 1) => {
    const i = customs.findIndex((w) => w.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= customs.length) return;
    const next = [...customs];
    [next[i], next[j]] = [next[j], next[i]];
    setPairWords(pair, next);
    setNudged({ id, dir });
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => setNudged(null), 240);
  };

  // Animate the moved row after layout settles. WAAPI restarts reliably
  // even when React reuses the same DOM node for the reorder.
  useEffect(() => {
    if (!nudged) return;
    const el = itemRefs.current.get(nudged.id);
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const anim = el.animate(
      [
        {
          transform: `translateY(${nudged.dir === -1 ? "14px" : "-14px"})`,
        },
        { transform: "translateY(0)" },
      ],
      { duration: 240, easing: "ease-out" },
    );
    return () => anim.cancel();
  }, [nudged]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          {pair} <span className="label">edit</span>
        </p>
        <button className="btn px-3 py-1" onClick={onClose}>
          Done [Esc]
        </button>
      </div>

      <p className="label mb-2">
        Your words
        {customs.length > 0 ? " · first is primary" : " · none yet"}
      </p>
      {customs.length > 0 && (
        <ul className="mb-2 divide-y divide-[var(--color-ink)] border rule">
          {customs.map((w, i) => (
            <li
              key={w.id}
              ref={(el) => {
                if (el) itemRefs.current.set(w.id, el);
                else itemRefs.current.delete(w.id);
              }}
              className="flex items-center gap-2 px-2 py-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-sm">
                {w.text}
              </span>
              <button
                className={`shrink-0 border rule px-1 text-[10px] tracking-widest uppercase ${w.explicit ? "bg-[var(--color-coal)] text-[var(--color-paper)]" : "opacity-50"}`}
                onClick={() =>
                  setPairWords(
                    pair,
                    customs.map((c) =>
                      c.id === w.id ? { ...c, explicit: !c.explicit } : c,
                    ),
                  )
                }
                aria-pressed={w.explicit}
                title="Toggle explicit flag"
              >
                explicit
              </button>
              <span className="flex shrink-0 gap-1">
                <button
                  className="border rule px-1 text-xs disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => move(w.id, -1)}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  className="border rule px-1 text-xs disabled:opacity-30"
                  disabled={i === customs.length - 1}
                  onClick={() => move(w.id, 1)}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  className="border rule px-1 text-xs"
                  onClick={() =>
                    setPairWords(
                      pair,
                      customs.filter((c) => c.id !== w.id),
                    )
                  }
                  aria-label={`Delete ${w.text}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          className="field"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a word, Enter to add…"
          aria-label="New custom word"
        />
      </form>
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs opacity-70">
        <input
          type="checkbox"
          checked={draftExplicit}
          onChange={(e) => setDraftExplicit(e.target.checked)}
        />
        Mark as explicit
      </label>

      <p className="label mt-4 mb-2">Preset · {presets.length}</p>
      <ul className="border rule text-sm opacity-80">
        {presets.map((p, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 px-2 py-1"
          >
            <span className="truncate">{p.text}</span>
            {p.explicit && (
              <span className="shrink-0 text-[10px] tracking-widest uppercase opacity-60">
                explicit
              </span>
            )}
          </li>
        ))}
      </ul>
      {customs.length > 0 && (
        <button
          className="mt-2 text-xs underline opacity-70"
          onClick={() => setPairWords(pair, [])}
        >
          Clear custom words (back to preset)
        </button>
      )}
    </div>
  );
}
