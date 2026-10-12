"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  STORE_KEYS,
  parseImport,
  readJSON,
  readRecord,
  type CustomWord,
  type Overrides,
  type Progress,
  type Settings,
} from "@/lib/store";

interface Store {
  overrides: Overrides;
  progress: Progress;
  settings: Settings;
  ready: boolean;
  setPairWords: (pair: string, words: CustomWord[]) => void;
  resetAllOverrides: () => void;
  grade: (pair: string, known: boolean) => void;
  resetProgress: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  importData: (raw: string) => { ok: boolean; message: string };
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({});
  const [progress, setProgress] = useState<Progress>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount (client-only) to avoid SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverrides(readRecord<CustomWord[]>(STORE_KEYS.overrides));
    setProgress(readRecord<never>(STORE_KEYS.progress) as Progress);
    const stored = readJSON<Settings>(STORE_KEYS.settings, DEFAULT_SETTINGS);
    setSettings(normalizeSettings(stored));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        STORE_KEYS.overrides,
        JSON.stringify(overrides),
      );
    } catch {
      /* ignore */
    }
  }, [overrides, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        STORE_KEYS.progress,
        JSON.stringify(progress),
      );
    } catch {
      /* ignore */
    }
  }, [progress, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        STORE_KEYS.settings,
        JSON.stringify(settings),
      );
    } catch {
      /* ignore */
    }
  }, [settings, ready]);

  const setPairWords = useCallback((pair: string, words: CustomWord[]) => {
    setOverrides((prev) => {
      if (words.length === 0) {
        const next = { ...prev };
        delete next[pair];
        return next;
      }
      return { ...prev, [pair]: words };
    });
  }, []);

  const resetAllOverrides = useCallback(() => setOverrides({}), []);
  const resetProgress = useCallback(() => setProgress({}), []);

  const grade = useCallback((pair: string, known: boolean) => {
    setProgress((prev) => {
      const cur = prev[pair] ?? { seen: 0, known: 0, lastSeen: 0 };
      return {
        ...prev,
        [pair]: {
          seen: cur.seen + 1,
          known: cur.known + (known ? 1 : 0),
          lastSeen: Date.now(),
        },
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const importData = useCallback(
    (raw: string) => {
      try {
        const parsed = parseImport(raw);
        if (
          !parsed.overrides &&
          !parsed.progress &&
          !parsed.settings
        ) {
          return { ok: false, message: "No recognizable data found." };
        }
        if (parsed.overrides) setOverrides(parsed.overrides);
        if (parsed.progress) setProgress(parsed.progress);
        if (parsed.settings)
          setSettings((prev) =>
            normalizeSettings({ ...prev, ...parsed.settings }),
          );
        return { ok: true, message: "Import complete." };
      } catch {
        return { ok: false, message: "Invalid JSON file." };
      }
    },
    [],
  );

  const value = useMemo<Store>(
    () => ({
      overrides,
      progress,
      settings,
      ready,
      setPairWords,
      resetAllOverrides,
      grade,
      resetProgress,
      updateSettings,
      importData,
    }),
    [
      overrides,
      progress,
      settings,
      ready,
      setPairWords,
      resetAllOverrides,
      grade,
      resetProgress,
      updateSettings,
      importData,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
