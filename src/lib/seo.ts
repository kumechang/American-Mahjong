// Search-snippet helpers. Bing Webmaster Tools flags a meta description that is too short (it recommends about 150-160 characters),
// and Google cuts snippets at about 160, so descriptions are built to land between MIN and MAX.
export const DESCRIPTION_MIN = 150;
export const DESCRIPTION_MAX = 160;

/**
 * `lead` is the part that depends on the page's data (no closing full stop). From the filler sentences, the smallest set (kept in the
 * order given) that brings the text to DESCRIPTION_MIN without passing DESCRIPTION_MAX is appended; when no set does, the longest
 * text that still fits is used. Fillers must be true for every page that uses them.
 */
export function fillDescription(lead: string, fillers: string[], min = DESCRIPTION_MIN, max = DESCRIPTION_MAX): string {
  const base = `${lead}.`;
  let best = base;
  const n = Math.min(fillers.length, 12);
  for (let size = 1; size <= n; size++) {
    let found: string | null = null;
    for (let mask = 1; mask < 1 << n; mask++) {
      if (bitCount(mask) !== size) continue;
      const text = [base, ...fillers.filter((_, i) => mask & (1 << i))].join(" ");
      if (text.length > max) continue;
      if (text.length >= min) {
        found = text;
        break;
      }
      if (text.length > best.length) best = text;
    }
    if (found) return found;
  }
  return best;
}

function bitCount(x: number) {
  let c = 0;
  for (; x; x &= x - 1) c++;
  return c;
}
