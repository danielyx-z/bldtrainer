export const LETTERS = Array.from({ length: 24 }, (_, i) =>
  String.fromCharCode("A".charCodeAt(0) + i),
);

export const ALL_PAIRS: string[] = LETTERS.flatMap((a) =>
  LETTERS.filter((b) => b !== a).map((b) => a + b),
);

export function isValidPair(pair: string): boolean {
  return (
    pair.length === 2 &&
    pair[0] >= "A" &&
    pair[0] <= "X" &&
    pair[1] >= "A" &&
    pair[1] <= "X" &&
    pair[0] !== pair[1]
  );
}

export function pairsStartingWith(letter: string): string[] {
  return ALL_PAIRS.filter((p) => p[0] === letter);
}
