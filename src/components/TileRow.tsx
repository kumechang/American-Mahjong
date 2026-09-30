// Decorative mahjong tiles drawn as plain SVG shapes (no glyphs, so they
// render the same on every device). Original artwork; purely decorative.

const JADE = "var(--jade)";
const RED = "var(--tile-red)";
const INK = "var(--foreground)";

function Tile({ children, tilt }: { children: React.ReactNode; tilt: number }) {
  return (
    <svg
      viewBox="0 0 64 88"
      className="h-20 w-auto drop-shadow-sm sm:h-24"
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="8" width="56" height="76" rx="9" fill={JADE} opacity="0.85" />
      <rect x="4" y="2" width="56" height="76" rx="9" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
      {children}
    </svg>
  );
}

export function TileRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end justify-center gap-3 sm:gap-4 ${className}`} aria-hidden="true">
      <Tile tilt={-6}>
        {/* one dot */}
        <circle cx="32" cy="40" r="17" fill="none" stroke={RED} strokeWidth="4" />
        <circle cx="32" cy="40" r="9" fill={RED} />
      </Tile>
      <Tile tilt={3}>
        {/* three bams */}
        {[18, 32, 46].map((x) => (
          <g key={x}>
            <rect x={x - 4} y="18" width="8" height="44" rx="4" fill={JADE} />
            <rect x={x - 4} y="38" width="8" height="3" fill="var(--surface)" />
          </g>
        ))}
      </Tile>
      <Tile tilt={-2}>
        {/* five dots */}
        {[
          [20, 22, JADE],
          [44, 22, INK],
          [32, 40, RED],
          [20, 58, INK],
          [44, 58, JADE],
        ].map(([cx, cy, fill], i) => (
          <circle key={i} cx={cx as number} cy={cy as number} r="7.5" fill={fill as string} />
        ))}
      </Tile>
      <Tile tilt={5}>
        {/* white dragon: an empty frame */}
        <rect x="14" y="16" width="36" height="48" rx="4" fill="none" stroke={JADE} strokeWidth="4" />
        <rect x="20" y="22" width="24" height="36" rx="2" fill="none" stroke={JADE} strokeWidth="1.5" />
      </Tile>
    </div>
  );
}
