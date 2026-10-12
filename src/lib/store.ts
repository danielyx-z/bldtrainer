import { LETTERS } from "./letters";
import { PRESETS, type PresetWord } from "./presets";

export interface CustomWord {
  id: string;
  text: string;
  explicit: boolean;
}

export type Overrides = Record<string, CustomWord[]>;

export interface PairProgress {
  seen: number;
  known: number;
  lastSeen: number;
}

export type Progress = Record<string, PairProgress>;

export type WordsPerPair = 1 | 2 | "all";

export type BackgroundMode = "off" | "photo";

export interface BackgroundSettings {
  mode: BackgroundMode;
  intensity: number;
}

export interface Settings {
  wordsPerPair: WordsPerPair;
  showExplicit: boolean;
  letters: string[];
  sessionLength: number;
  weakFirst: boolean;
  background: BackgroundSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  wordsPerPair: "all",
  showExplicit: true,
  letters: [...LETTERS],
  sessionLength: 25,
  weakFirst: true,
  background: { mode: "off", intensity: 0.45 },
};

export const SESSION_LENGTHS = [10, 25, 50, 552];

/** Coerce stored/imported settings into valid shape (migrates old values). */
export function normalizeSettings(raw: Settings): Settings {
  const merged: Settings = { ...DEFAULT_SETTINGS, ...raw };
  if (!SESSION_LENGTHS.includes(merged.sessionLength)) {
    merged.sessionLength = 25;
  }
  if (
    merged.wordsPerPair !== 1 &&
    merged.wordsPerPair !== 2 &&
    merged.wordsPerPair !== "all"
  ) {
    merged.wordsPerPair = "all";
  }
  const bg = (raw as Partial<Settings>).background as
    | { mode?: unknown; intensity?: unknown }
    | undefined;
  // "ascii" mode was removed; those users keep their photo, dimmed.
  const mode: BackgroundMode =
    bg?.mode === "photo" || bg?.mode === "ascii" ? "photo" : "off";
  const intensity =
    typeof bg?.intensity === "number" && Number.isFinite(bg.intensity)
      ? Math.min(1, Math.max(0, bg.intensity))
      : DEFAULT_SETTINGS.background.intensity;
  merged.background = { mode, intensity };
  return merged;
}

const KEYS = {
  overrides: "bldtrainer.overrides.v1",
  progress: "bldtrainer.progress.v1",
  settings: "bldtrainer.settings.v1",
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function readRecord<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export const STORE_KEYS = KEYS;

export function accuracy(p?: PairProgress): number | null {
  if (!p || p.seen === 0) return null;
  return p.known / p.seen;
}

export function isWeak(pair: string, progress: Progress): boolean {
  const p = progress[pair];
  if (!p || p.seen === 0) return false;
  return p.known / p.seen < 0.7;
}

export interface VisibleWord {
  text: string;
  explicit: boolean;
  custom: boolean;
}

export function wordsForPair(
  pair: string,
  overrides: Overrides,
): { customs: CustomWord[]; presets: PresetWord[] } {
  return { customs: overrides[pair] ?? [], presets: PRESETS[pair] ?? [] };
}

/** Words visible under the current explicit setting, customs first. */
export function visibleWords(
  pair: string,
  overrides: Overrides,
  showExplicit: boolean,
): VisibleWord[] {
  const { customs, presets } = wordsForPair(pair, overrides);
  const all: VisibleWord[] = [
    ...customs.map((c) => ({
      text: c.text,
      explicit: c.explicit,
      custom: true,
    })),
    ...presets.map((p) => ({
      text: p.text,
      explicit: p.explicit,
      custom: false,
    })),
  ];
  if (showExplicit) return all;
  const sfw = all.filter((w) => !w.explicit);
  return sfw.length > 0 ? sfw : [];
}

/** True when the pair has words but all are explicit (hidden while filter is off). */
export function isHiddenByFilter(
  pair: string,
  overrides: Overrides,
  showExplicit: boolean,
): boolean {
  if (showExplicit) return false;
  const { customs, presets } = wordsForPair(pair, overrides);
  const all = [...customs, ...presets];
  return all.length > 0 && all.every((w) => w.explicit);
}

export function hasCustom(pair: string, overrides: Overrides): boolean {
  return (overrides[pair] ?? []).length > 0;
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function exportData(
  overrides: Overrides,
  progress: Progress,
  settings: Settings,
): string {
  return JSON.stringify(
    { app: "bld-letter-pairs", version: 1, overrides, progress, settings },
    null,
    2,
  );
}

export function parseImport(raw: string): {
  overrides?: Overrides;
  progress?: Progress;
  settings?: Partial<Settings>;
} {
  const data = JSON.parse(raw);
  const src = data?.pairs ?? data;
  const out: {
    overrides?: Overrides;
    progress?: Progress;
    settings?: Partial<Settings>;
  } = {};
  if (src.overrides && typeof src.overrides === "object")
    out.overrides = src.overrides;
  if (src.progress && typeof src.progress === "object")
    out.progress = src.progress;
  if (src.settings && typeof src.settings === "object")
    out.settings = src.settings;
  // Support bare { "AB": "word" | ["a","b"] } files too
  if (!out.overrides && typeof src === "object" && src !== null) {
    const maybe: Overrides = {};
    let found = false;
    for (const [k, v] of Object.entries(src)) {
      if (!/^[A-X]{2}$/.test(k) || k[0] === k[1]) continue;
      const list = Array.isArray(v) ? v : [v];
      const words = list
        .filter((t) => typeof t === "string" && t.trim())
        .map((t) => ({
          id: makeId(),
          text: (t as string).trim(),
          explicit: false,
        }));
      if (words.length > 0) {
        maybe[k] = words;
        found = true;
      }
    }
    if (found) out.overrides = maybe;
  }
  return out;
}
