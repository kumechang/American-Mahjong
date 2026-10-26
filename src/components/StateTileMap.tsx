// A tile-grid map of the US: one square per state (and DC), shaded by how many city pages we have there.
// Plain SVG, no map data to load. Squares with cities link to that state's section of the city list.

import { stateName } from "@/lib/us-states";

// column, row on an 11 x 8 grid (a tile-grid layout, not geography to scale)
const GRID: Record<string, [number, number]> = {
  AK: [0, 0], ME: [10, 0],
  WI: [5, 1], VT: [9, 1], NH: [10, 1],
  WA: [1, 2], ID: [2, 2], MT: [3, 2], ND: [4, 2], MN: [5, 2], IL: [6, 2], MI: [7, 2], NY: [8, 2], MA: [9, 2], RI: [10, 2],
  OR: [1, 3], NV: [2, 3], WY: [3, 3], SD: [4, 3], IA: [5, 3], IN: [6, 3], OH: [7, 3], PA: [8, 3], NJ: [9, 3], CT: [10, 3],
  CA: [1, 4], UT: [2, 4], CO: [3, 4], NE: [4, 4], MO: [5, 4], KY: [6, 4], WV: [7, 4], VA: [8, 4], MD: [9, 4], DE: [10, 4],
  AZ: [2, 5], NM: [3, 5], KS: [4, 5], AR: [5, 5], TN: [6, 5], NC: [7, 5], SC: [8, 5], DC: [9, 5],
  OK: [4, 6], LA: [5, 6], MS: [6, 6], AL: [7, 6], GA: [8, 6],
  HI: [0, 7], TX: [4, 7], FL: [9, 7],
};

const SIZE = 44;
const GAP = 4;

// shade by number of city pages: none / 1-2 / 3-5 / 6+
function shade(n: number) {
  if (n === 0) return { rect: "fill-surface stroke-line", text: "fill-muted" };
  if (n <= 2) return { rect: "fill-jade/25 stroke-jade", text: "fill-foreground" };
  if (n <= 5) return { rect: "fill-jade/55 stroke-jade", text: "fill-foreground" };
  return { rect: "fill-jade stroke-jade-strong", text: "fill-background" };
}

export function StateTileMap({ counts, hrefBase = "" }: { counts: Record<string, number>; hrefBase?: string }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const states = Object.keys(counts).filter((s) => counts[s] > 0).length;
  const legend: [string, number][] = [["No city yet", 0], ["1–2 cities", 1], ["3–5", 3], ["6 or more", 6]];
  return (
    <figure>
      <svg
        viewBox={`0 0 ${11 * (SIZE + GAP)} ${8 * (SIZE + GAP)}`}
        role="group"
        aria-label={`Map of the United States: ${total} city pages in ${states} states. Each state links to its cities below.`}
        className="h-auto w-full max-w-2xl"
        focusable="false"
      >
        {Object.entries(GRID).map(([code, [col, row]]) => {
          const n = counts[code] ?? 0;
          const c = shade(n);
          const x = col * (SIZE + GAP);
          const y = row * (SIZE + GAP);
          const label = `${stateName(code)}: ${n === 0 ? "no cities yet" : `${n} ${n === 1 ? "city" : "cities"}`}`;
          const tile = (
            <>
              <title>{label}</title>
              <rect x={x} y={y} width={SIZE} height={SIZE} rx="7" className={`${c.rect} group-hover:stroke-foreground group-focus-visible:stroke-foreground`} strokeWidth="1.5" />
              <text x={x + SIZE / 2} y={y + SIZE / 2 + 6} textAnchor="middle" fontSize="17" fontWeight="600" className={c.text}>
                {code}
              </text>
            </>
          );
          return n > 0 ? (
            <a key={code} href={`${hrefBase}#state-${code}`} aria-label={label} className="group outline-none">
              {tile}
            </a>
          ) : (
            <g key={code} role="img" aria-label={label}>
              {tile}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        {legend.map(([text, n]) => (
          <span key={text} className="inline-flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="1" y="1" width="14" height="14" rx="3" className={shade(n).rect} strokeWidth="1.5" />
            </svg>
            {text}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function cityCountsByState(cities: { state: string }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of cities) out[c.state] = (out[c.state] ?? 0) + 1;
  return out;
}
