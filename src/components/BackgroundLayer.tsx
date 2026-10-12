"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "./StoreProvider";
import { loadBackground } from "@/lib/background";

export function BackgroundLayer() {
  const { settings } = useStore();
  const { mode, intensity } = settings.background;
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const blob = await loadBackground();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = blob ? URL.createObjectURL(blob) : null;
      setUrl(urlRef.current);
    } catch {
      setUrl(null);
    }
  }, []);

  useEffect(() => {
    void reload();
    const onChange = () => void reload();
    window.addEventListener("bld:bg-change", onChange);
    return () => window.removeEventListener("bld:bg-change", onChange);
  }, [reload]);

  if (mode === "off" || !url) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-cover" />
      <div
        className="absolute inset-0 bg-[var(--color-paper)]"
        style={{ opacity: 1 - intensity * 0.5 }}
      />
    </div>
  );
}
