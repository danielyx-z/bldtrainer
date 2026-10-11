"""Parse pairs.txt (Reddit paste) into src/lib/presets.ts.

Keeps wording verbatim. Splits multi-word entries on commas that are
NOT inside parentheses. Tags explicit words via whole-word match.
Fills the 6 pairs missing from the paste with our own images.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "pairs.txt"

FILL_INS = {
    "AN": ["Ant"],
    "FR": ["Frog"],
    "FS": ["Fist"],
    "FT": ["Foot"],
    "GJ": ["Godzilla"],
    "MN": ["Moon"],
}

# X has almost no natural English words, so use SH replacements
# (X sounds like SH/CH — a common cubing trick) instead of Electric-__.
X_SH = {
    "XA": ["Shark"],
    "XB": ["Shiba (dog breed)"],
    "XC": ["Shock"],
    "XD": ["Shed"],
    "XE": ["Sherry"],
    "XF": ["Shelf"],
    "XG": ["Shaggy (Scooby-Doo)"],
    "XH": ["Shh (finger on lips)"],
    "XI": ["Shin"],
    "XJ": ["Shoji (screen)"],
    "XK": ["Shrek"],
    "XL": ["Shell"],
    "XM": ["Shroom (mushroom)"],
    "XN": ["Shonen Jump"],
    "XO": ["Shadow"],
    "XP": ["Ship"],
    "XQ": ["Shaq (Shaquille O'Neal)"],
    "XR": ["Shrew"],
    "XS": ["Shoes"],
    "XT": ["Shirt"],
    "XU": ["Shuttle (space shuttle)"],
    "XV": ["Shovel"],
    "XW": ["Shower"],
}

EXPLICIT_RE = re.compile(
    r"\b(blowjob|cum|cumming|fuck|fucking|fap|fapping|ass|dick|nipple|sex|sexy|vagina|vaj|bisexual|porn|orgasm|masturbat)\b",
    re.IGNORECASE,
)


def split_variants(value: str) -> list[str]:
    parts, depth, buf = [], 0, []
    for ch in value:
        if ch == "(":
            depth += 1
            buf.append(ch)
        elif ch == ")":
            depth = max(0, depth - 1)
            buf.append(ch)
        elif ch == "," and depth == 0:
            part = "".join(buf).strip()
            if part:
                parts.append(part)
            buf = []
        else:
            buf.append(ch)
    tail = "".join(buf).strip()
    if tail:
        parts.append(tail)
    return parts


def main() -> None:
    text = SRC.read_text()
    # Cut off the Reddit comments footer that got pasted after the X list
    cut = text.find("Oh my gosh I did it")
    if cut != -1:
        text = text[:cut]

    pairs: dict[str, list[str]] = {}
    for m in re.finditer(r"^([A-Za-z]{2})\s*:\s*(.+?)\s*$", text, re.M):
        key = m.group(1).upper()
        if not re.fullmatch(r"[A-X]{2}", key):
            continue
        if key[0] == key[1]:
            continue
        pairs[key] = split_variants(m.group(2).strip())

    for key, words in FILL_INS.items():
        if key not in pairs:
            pairs[key] = words

    # Replace the pasted Electric-__ X scaffolding with SH words.
    pairs.update(X_SH)

    letters = [chr(c) for c in range(ord("A"), ord("X") + 1)]
    expected = [a + b for a in letters for b in letters if a != b]
    missing = [p for p in expected if p not in pairs]
    assert not missing, f"missing pairs: {missing}"
    assert len(pairs) == 552, f"expected 552, got {len(pairs)}"

    lines = [
        "// Generated from pairs.txt — do not edit by hand.",
        "// Run `python3 scripts/generate-presets.py` to regenerate.",
        "// Wording is verbatim from the pasted list, except:",
        "// AN/FR/FS/FT/GJ/MN fill-ins, and X pairs use SH replacements.",
        "",
        "export interface PresetWord {",
        "  text: string;",
        "  explicit: boolean;",
        "}",
        "",
        "function w(text: string): PresetWord {",
        "  return { text, explicit: false };",
        "}",
        "",
        "function x(text: string): PresetWord {",
        "  return { text, explicit: true };",
        "}",
        "",
        "export const PRESETS: Record<string, PresetWord[]> = {",
    ]
    for key in expected:
        words = pairs[key]
        rendered = ", ".join(
            f"x({w!r})" if EXPLICIT_RE.search(w) else f"w({w!r})" for w in words
        )
        lines.append(f"  {key}: [{rendered}],")
    lines += ["};", ""]
    (ROOT / "src" / "lib" / "presets.ts").write_text("\n".join(lines))
    multi = sum(1 for v in pairs.values() if len(v) > 1)
    exp = sum(1 for v in pairs.values() for word in v if EXPLICIT_RE.search(word))
    print(f"pairs={len(pairs)} multi={multi} explicit_words={exp}")


if __name__ == "__main__":
    main()
