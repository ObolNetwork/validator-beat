const LETTERS = ["G", "Y", "R"] as const;

/** All 729 six-letter G/Y/R share codes. */
export function allShareCodes(): string[] {
  const codes: string[] = [];
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      for (let c = 0; c < 3; c++) {
        for (let d = 0; d < 3; d++) {
          for (let e = 0; e < 3; e++) {
            for (let f = 0; f < 3; f++) {
              codes.push(
                LETTERS[a] + LETTERS[b] + LETTERS[c] + LETTERS[d] + LETTERS[e] + LETTERS[f],
              );
            }
          }
        }
      }
    }
  }
  return codes;
}
