// Presets load straight from src/assets/pairs.txt (single source of truth).
// Edit that file; this module parses it at build time. Lines look like:
//   AB: Abacus
//   AD: Addison (friend of mine), Addicted
// Variants split on commas outside parentheses. X pairs use SH
// replacements and AN/FR/FS/FT/GJ/MN are fill-ins, all baked into the file.

import pairsRaw from "../assets/pairs.txt";

export interface PresetWord {
  text: string;
  explicit: boolean;
}

const EXPLICIT_RE =
  /\b(blowjob|cum|cumming|fuck|fucking|fap|fapping|ass|dick|nipple|sex|sexy|vagina|vaj|bisexual|porn|orgasm|masturbat)\b/i;

/** Split "a (x, y), b" into ["a (x, y)", "b"]. */
function splitVariants(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of value) {
    if (ch === "(") {
      depth++;
      buf += ch;
    } else if (ch === ")") {
      depth = Math.max(0, depth - 1);
      buf += ch;
    } else if (ch === "," && depth === 0) {
      const part = buf.trim();
      if (part) parts.push(part);
      buf = "";
    } else {
      buf += ch;
    }
  }
  const tail = buf.trim();
  if (tail) parts.push(tail);
  return parts;
}

function parse(): Record<string, PresetWord[]> {
  // Guard against a footer (e.g. pasted comments) sneaking back in.
  const text = pairsRaw.split("Oh my gosh")[0];
  const pairs = new Map<string, PresetWord[]>();
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Za-z]{2})\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    const key = m[1].toUpperCase();
    if (!/^[A-X]{2}$/.test(key) || key[0] === key[1]) continue;
    if (pairs.has(key)) {
      console.warn(`[presets] duplicate pair ${key}, keeping first`);
      continue;
    }
    pairs.set(
      key,
      splitVariants(m[2]).map((t) => ({
        text: t,
        explicit: EXPLICIT_RE.test(t),
      })),
    );
  }
  if (pairs.size !== 552) {
    console.warn(
      `[presets] expected 552 pairs, found ${pairs.size} — check src/assets/pairs.txt`,
    );
  }
  return Object.fromEntries(pairs);
}

export const PRESETS: Record<string, PresetWord[]> = parse();
