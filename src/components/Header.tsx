"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SettingsDialog } from "./SettingsDialog";

const NAV = [
  { href: "/", label: "Train" },
  { href: "/pairs", label: "Pairs" },
  { href: "/guide", label: "Guide" },
];

export function Header() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="relative z-10 shrink-0 border-b rule">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <Link href="/" className="shrink-0 text-[13px] font-bold tracking-tight sm:text-sm">
            BLD<span className="opacity-50">/</span>PAIRS
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-2 py-1 text-xs uppercase tracking-widest sm:px-3 sm:text-[13px] ${
                    active
                      ? "underline underline-offset-4"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              className="ml-0.5 px-1.5 py-1 text-xs uppercase opacity-70 hover:opacity-100 hover:underline hover:underline-offset-4 sm:ml-1 sm:px-2 sm:text-[13px]"
              onClick={() => setSettingsOpen(true)}
              aria-haspopup="dialog"
            >
              Settings
            </button>
          </nav>
        </div>
      </header>
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
