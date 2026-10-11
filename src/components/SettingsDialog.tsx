"use client";

import { useRef, useState } from "react";
import { useStore } from "./StoreProvider";
import { LETTERS } from "@/lib/letters";
import { DEFAULT_SETTINGS, exportData } from "@/lib/store";

const SESSION_OPTIONS = [10, 25, 50, 552];

export function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    settings,
    updateSettings,
    overrides,
    progress,
    resetAllOverrides,
    resetProgress,
    importData,
  } = useStore();
  const [confirm, setConfirm] = useState<"progress" | "customs" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const toggleLetter = (letter: string) => {
    const has = settings.letters.includes(letter);
    updateSettings({
      letters: has
        ? settings.letters.filter((l) => l !== letter)
        : [...settings.letters, letter].sort(),
    });
  };

  const doExport = () => {
    const blob = new Blob([exportData(overrides, progress, settings)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bld-letter-pairs-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImportFile = async (file: File) => {
    const raw = await file.text();
    const res = importData(raw);
    setNotice(res.message);
    window.setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="card my-8 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="flex items-center justify-between border-b rule px-4 py-3">
          <p className="label">Settings</p>
          <button className="btn px-3 py-1" onClick={onClose} aria-label="Close settings">
            Esc
          </button>
        </div>

        <div className="space-y-6 px-4 py-4">
          <section>
            <p className="label mb-2">Words shown per pair</p>
            <div className="flex gap-2">
              {([1, 2, "all"] as const).map((opt) => (
                <button
                  key={String(opt)}
                  className={`btn flex-1 ${settings.wordsPerPair === opt ? "btn-solid" : ""}`}
                  onClick={() => updateSettings({ wordsPerPair: opt })}
                  aria-pressed={settings.wordsPerPair === opt}
                >
                  {opt === "all" ? "All" : opt}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs opacity-70">
              Extra words stay reachable behind a +more expander.
            </p>
          </section>

          <section>
            <p className="label mb-2">Explicit words</p>
            <div className="flex gap-2">
              <button
                className={`btn flex-1 ${settings.showExplicit ? "btn-solid" : ""}`}
                onClick={() => updateSettings({ showExplicit: true })}
                aria-pressed={settings.showExplicit}
              >
                Show
              </button>
              <button
                className={`btn flex-1 ${!settings.showExplicit ? "btn-solid" : ""}`}
                onClick={() => updateSettings({ showExplicit: false })}
                aria-pressed={!settings.showExplicit}
              >
                Hide
              </button>
            </div>
            <p className="mt-2 text-xs opacity-70">
              Hidden pairs fall out of the trainer rotation. Pairs with a
              clean alternate show that instead.
            </p>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="label">Letters in rotation</p>
              <div className="flex gap-2">
                <button
                  className="text-xs underline"
                  onClick={() =>
                    updateSettings({ letters: [...LETTERS] })
                  }
                >
                  All
                </button>
                <button
                  className="text-xs underline"
                  onClick={() => updateSettings({ letters: [] })}
                >
                  None
                </button>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {LETTERS.map((l) => {
                const on = settings.letters.includes(l);
                return (
                  <button
                    key={l}
                    className={`border rule py-1 text-sm ${on ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : "opacity-40"}`}
                    onClick={() => toggleLetter(l)}
                    aria-pressed={on}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="label mb-2">Session defaults</p>
            <p className="mb-1 text-xs opacity-70">Cards per session</p>
            <div className="flex gap-2">
              {SESSION_OPTIONS.map((n) => (
                <button
                  key={n}
                  className={`btn flex-1 px-1 ${settings.sessionLength === n ? "btn-solid" : ""}`}
                  onClick={() => updateSettings({ sessionLength: n })}
                  aria-pressed={settings.sessionLength === n}
                >
                  {n === 552 ? "All" : n}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <label className="flex cursor-pointer items-center justify-between border rule px-3 py-2 text-sm">
                <span>Weak pairs first</span>
                <input
                  type="checkbox"
                  checked={settings.weakFirst}
                  onChange={(e) =>
                    updateSettings({ weakFirst: e.target.checked })
                  }
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between border rule px-3 py-2 text-sm">
                <span>Auto-advance after grading</span>
                <input
                  type="checkbox"
                  checked={settings.autoAdvance}
                  onChange={(e) =>
                    updateSettings({ autoAdvance: e.target.checked })
                  }
                />
              </label>
            </div>
          </section>

          <section>
            <p className="label mb-2">Data</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn" onClick={doExport}>
                Export JSON
              </button>
              <button
                className="btn"
                onClick={() => fileRef.current?.click()}
              >
                Import JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void doImportFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            {notice && <p className="mt-2 text-xs">{notice}</p>}
            <div className="mt-3 flex flex-col gap-2">
              {confirm === "progress" ? (
                <div className="flex items-center justify-between border border-red-800 px-3 py-2 text-sm">
                  <span>Clear all progress?</span>
                  <span className="flex gap-2">
                    <button
                      className="underline"
                      onClick={() => {
                        resetProgress();
                        setConfirm(null);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      className="underline"
                      onClick={() => setConfirm(null)}
                    >
                      No
                    </button>
                  </span>
                </div>
              ) : (
                <button
                  className="border rule px-3 py-2 text-left text-sm"
                  onClick={() => setConfirm("progress")}
                >
                  Reset training progress
                </button>
              )}
              {confirm === "customs" ? (
                <div className="flex items-center justify-between border border-red-800 px-3 py-2 text-sm">
                  <span>Delete all custom words?</span>
                  <span className="flex gap-2">
                    <button
                      className="underline"
                      onClick={() => {
                        resetAllOverrides();
                        setConfirm(null);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      className="underline"
                      onClick={() => setConfirm(null)}
                    >
                      No
                    </button>
                  </span>
                </div>
              ) : (
                <button
                  className="border rule px-3 py-2 text-left text-sm"
                  onClick={() => setConfirm("customs")}
                >
                  Delete all custom words
                </button>
              )}
              <button
                className="border rule px-3 py-2 text-left text-sm opacity-60"
                onClick={() =>
                  updateSettings({ ...DEFAULT_SETTINGS, letters: [...LETTERS] })
                }
              >
                Restore default settings
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
