// Explanatory diagrams for the Learn guides, drawn as plain SVG so they scale on phones and follow the
// site's light/dark colours (Tailwind fill-*/stroke-* utilities read the same CSS variables as the rest of
// the site). Original artwork. Each diagram has a title and description for screen readers, and the guide's
// text still says everything the picture shows.

import { useId } from "react";

export type DiagramId = "charleston" | "table" | "payments" | "tileset" | "round" | "jokers" | "groups";

function Svg({
  viewBox,
  title,
  desc,
  className = "",
  children,
}: {
  viewBox: string;
  title: string;
  desc: string;
  className?: string;
  children: (arrow: string) => React.ReactNode;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    // No <title> element inside the SVG: some SEO scanners count it as a second page title. aria-label + <desc> serve screen readers.
    <svg viewBox={viewBox} role="img" aria-label={title} aria-describedby={`${uid}d`} className={`h-auto w-full ${className}`} focusable="false">
      <desc id={`${uid}d`}>{desc}</desc>
      <defs>
        <marker id={`${uid}a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fill-jade-strong" />
        </marker>
      </defs>
      {children(`url(#${uid}a)`)}
    </svg>
  );
}

function Figure({ caption, children }: { caption: React.ReactNode; children: React.ReactNode }) {
  return (
    <figure className="my-2 rounded-2xl border border-line bg-surface p-4 sm:p-6">
      {children}
      <figcaption className="mt-3 text-base leading-7 text-muted">{caption}</figcaption>
    </figure>
  );
}

// ---------- shared pieces ----------

function Pill({ x, y, w = 96, h = 34, label, strong = false }: { x: number; y: number; w?: number; h?: number; label: string; strong?: boolean }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} className={strong ? "fill-jade stroke-jade-strong" : "fill-surface stroke-line"} strokeWidth="1.5" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="600" className={strong ? "fill-background" : "fill-foreground"}>
        {label}
      </text>
    </g>
  );
}

function Badge({ x, y, n }: { x: number; y: number; n: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="12" className="fill-tile-red" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" className="fill-background">
        {n}
      </text>
    </g>
  );
}

type TileKind = "dot" | "joker";
function MiniTile({ x, y, kind = "dot", n = "5" }: { x: number; y: number; kind?: TileKind; n?: string }) {
  return (
    <g>
      <rect x={x} y={y} width="28" height="38" rx="5" className={kind === "joker" ? "fill-jade/25 stroke-jade-strong" : "fill-surface stroke-line"} strokeWidth="1.5" />
      {kind === "joker" ? (
        <text x={x + 14} y={y + 25} textAnchor="middle" fontSize="15" fontWeight="700" className="fill-jade-strong">
          J
        </text>
      ) : (
        <>
          <text x={x + 14} y={y + 20} textAnchor="middle" fontSize="15" fontWeight="700" className="fill-foreground">
            {n}
          </text>
          <circle cx={x + 14} cy={y + 29} r="4" className="fill-none stroke-tile-red" strokeWidth="2" />
        </>
      )}
    </g>
  );
}

// ---------- 1. The Charleston ----------

function CharlestonPanel({ title, steps, courtesy = false }: { title: string; steps?: ("right" | "across" | "left")[]; courtesy?: boolean }) {
  const paths = {
    right: { d: "M200 238 Q268 232 272 170", badge: [262, 214] as const },
    across: { d: "M160 236 L160 70", badge: [160, 150] as const },
    left: { d: "M120 238 Q52 232 48 170", badge: [58, 214] as const },
  };
  return (
    <div>
      <p className="text-center text-base font-semibold">{title}</p>
      <Svg
        viewBox="0 0 320 290"
        title={title}
        desc={courtesy ? "You and the player across the table swap up to three tiles." : `You pass three tiles to your ${steps?.map((s) => (s === "across" ? "partner across the table" : s)).join(", then ")}.`}
      >
        {(arrow) => (
          <>
            {courtesy ? (
              <path d="M160 70 L160 236" className="fill-none stroke-jade-strong" strokeWidth="3" markerStart={arrow} markerEnd={arrow} />
            ) : (
              steps?.map((s, i) => (
                <g key={s}>
                  <path d={paths[s].d} className="fill-none stroke-jade-strong" strokeWidth="3" markerEnd={arrow} />
                  <Badge x={paths[s].badge[0]} y={paths[s].badge[1]} n={String(i + 1)} />
                </g>
              ))
            )}
            <Pill x={160} y={46} label="Across" />
            {!courtesy && <Pill x={48} y={150} w={84} label="Left" />}
            {!courtesy && <Pill x={272} y={150} w={84} label="Right" />}
            <Pill x={160} y={256} label="You" strong />
            {courtesy && (
              <text x="176" y="158" fontSize="14" className="fill-foreground">
                swap up to 3 tiles
              </text>
            )}
          </>
        )}
      </Svg>
    </div>
  );
}

export function CharlestonDiagram() {
  return (
    <Figure
      caption={
        <>
          Numbers show the order of the passes, three tiles each. Everyone passes at the same time, so you also receive three tiles on every pass. The last
          pass of each round can be passed blind. Jokers are never passed.
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <CharlestonPanel title="Round 1 (required)" steps={["right", "across", "left"]} />
        <CharlestonPanel title="Round 2 (all four must agree)" steps={["left", "across", "right"]} />
        <div className="sm:col-span-2 sm:mx-auto sm:w-1/2">
          <CharlestonPanel title="Courtesy pass (optional)" courtesy />
        </div>
      </div>
    </Figure>
  );
}

// ---------- 2. The table ----------

export function TableDiagram() {
  return (
    <Figure
      caption="Each player builds a wall two tiles high and 19 tiles long, and the four walls are pushed together into a square. The dealer is dealt 14 tiles and discards first; everyone else is dealt 13. Play goes counterclockwise."
    >
      <div className="mx-auto max-w-md">
        <Svg
          viewBox="0 0 360 360"
          title="The table at the start of a game"
          desc="Four players sit around a square made of four tile walls. Each player has a rack in front of the wall. The dealer, at the bottom, has 14 tiles; the other three have 13. An arrow shows play going counterclockwise."
        >
          {(arrow) => (
            <>
              {/* walls */}
              <rect x="90" y="96" width="180" height="16" rx="3" className="fill-jade/80 stroke-jade-strong" strokeWidth="1.5" />
              <rect x="90" y="248" width="180" height="16" rx="3" className="fill-jade/80 stroke-jade-strong" strokeWidth="1.5" />
              <rect x="90" y="96" width="16" height="168" rx="3" className="fill-jade/80 stroke-jade-strong" strokeWidth="1.5" />
              <rect x="254" y="96" width="16" height="168" rx="3" className="fill-jade/80 stroke-jade-strong" strokeWidth="1.5" />
              <text x="180" y="108" textAnchor="middle" fontSize="11" fontWeight="600" className="fill-background">
                wall: 2 high × 19 long
              </text>
              {/* racks */}
              <rect x="130" y="286" width="100" height="22" rx="5" className="fill-surface stroke-line" strokeWidth="1.5" />
              <rect x="130" y="52" width="100" height="22" rx="5" className="fill-surface stroke-line" strokeWidth="1.5" />
              <rect x="30" y="130" width="22" height="100" rx="5" className="fill-surface stroke-line" strokeWidth="1.5" />
              <rect x="308" y="130" width="22" height="100" rx="5" className="fill-surface stroke-line" strokeWidth="1.5" />
              <text x="180" y="301" textAnchor="middle" fontSize="12" className="fill-muted">
                rack
              </text>
              <text x="180" y="67" textAnchor="middle" fontSize="12" className="fill-muted">
                rack
              </text>
              {/* players */}
              <Pill x={180} y={336} w={170} label="Dealer · 14 tiles" strong />
              <Pill x={180} y={24} w={150} label="Player · 13 tiles" />
              <text x="41" y="250" textAnchor="middle" fontSize="12" className="fill-foreground">
                13 tiles
              </text>
              <text x="319" y="250" textAnchor="middle" fontSize="12" className="fill-foreground">
                13 tiles
              </text>
              {/* turn order, counterclockwise */}
              <path d="M180 144 A36 36 0 1 0 216 180" className="fill-none stroke-jade-strong" strokeWidth="3" markerEnd={arrow} />
              <text x="180" y="185" textAnchor="middle" fontSize="13" fontWeight="600" className="fill-foreground">
                turns
              </text>
            </>
          )}
        </Svg>
      </div>
    </Figure>
  );
}

// ---------- 3. Who pays whom ----------

function PaymentPanel({ title, pays }: { title: string; pays: [string, string][] }) {
  const xs = [38, 110, 182];
  return (
    <div>
      <p className="text-center text-base font-semibold">{title}</p>
      <Svg viewBox="0 0 220 230" title={title} desc={`The winner is paid by three players: ${pays.map(([who, m]) => `${who} pays ${m}`).join("; ")}.`}>
        {(arrow) => (
          <>
            <Pill x={110} y={34} w={110} label="Winner" strong />
            {pays.map(([who, mult], i) => (
              <g key={i}>
                <path d={`M${xs[i]} 160 L${i === 0 ? 86 : i === 1 ? 110 : 134} 56`} className="fill-none stroke-jade-strong" strokeWidth="2.5" markerEnd={arrow} />
                <text x={i === 0 ? 40 : i === 1 ? 118 : 180} y="112" textAnchor={i === 1 ? "start" : "middle"} fontSize="17" fontWeight="700" className="fill-tile-red">
                  {mult}
                </text>
                <Pill x={xs[i]} y={186} w={68} h={34} label={who} />
              </g>
            ))}
          </>
        )}
      </Svg>
    </div>
  );
}

export function PaymentsDiagram() {
  return (
    <Figure
      caption={
        <>
          × means a multiple of the hand&rsquo;s value on the card. The doubles stack: if the winner used no jokers and someone threw the winning tile, that player
          pays 4× and the other two pay 2×. Check with your group before playing for money, since some tables add extras.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <PaymentPanel title="Won on a discard" pays={[["Discarder", "2×"], ["Other", "1×"], ["Other", "1×"]]} />
        <PaymentPanel title="Drew the winning tile" pays={[["Player", "2×"], ["Player", "2×"], ["Player", "2×"]]} />
        <PaymentPanel title="Drew it, no jokers" pays={[["Player", "4×"], ["Player", "4×"], ["Player", "4×"]]} />
      </div>
    </Figure>
  );
}

// ---------- 4. The 152 tiles ----------

const TILE_GROUPS = [
  { label: "Suits", count: 108, note: "Bams, Dots, Craks: 1–9, four of each (36 per suit)", cls: "fill-jade" },
  { label: "Winds", count: 16, note: "North, East, West, South: four of each", cls: "fill-foreground" },
  { label: "Dragons", count: 12, note: "Red, Green, White: four of each", cls: "fill-tile-red" },
  { label: "Flowers", count: 8, note: "used in some hands on the card", cls: "fill-muted" },
  { label: "Jokers", count: 8, note: "wild tiles", cls: "fill-jade-strong" },
];

const TILE_BAR = TILE_GROUPS.map((g, i) => ({
  ...g,
  x: 10 + (TILE_GROUPS.slice(0, i).reduce((n, t) => n + t.count, 0) / 152) * 340,
  w: (g.count / 152) * 340,
}));

export function TileSetDiagram() {
  return (
    <Figure caption="A full set has 152 tiles. The Jokers are what set American Mahjong apart from most other styles.">
      <Svg
        viewBox="0 0 360 250"
        title="What is in a set of 152 tiles"
        desc="108 suit tiles (Bams, Dots and Craks, 36 each), 16 Winds, 12 Dragons, 8 Flowers and 8 Jokers."
      >
        {() => (
          <>
            {TILE_BAR.map((g) => (
              <rect key={g.label} x={g.x} y="14" width={Math.max(g.w - 2, 2)} height="30" rx="4" className={g.cls} />
            ))}
            {TILE_GROUPS.map((g, i) => (
              <g key={g.label}>
                <rect x="10" y={72 + i * 34} width="16" height="16" rx="3" className={g.cls} />
                <text x="36" y={85 + i * 34} fontSize="15" fontWeight="600" className="fill-foreground">
                  {g.label}
                </text>
                <text x="350" y={85 + i * 34} textAnchor="end" fontSize="16" fontWeight="700" className="fill-foreground">
                  {g.count}
                </text>
                {g.note && (
                  <text x="36" y={100 + i * 34} fontSize="11" className="fill-muted">
                    {g.note}
                  </text>
                )}
              </g>
            ))}
          </>
        )}
      </Svg>
    </Figure>
  );
}

// ---------- 5. One round ----------

function Step({ y, n, title, sub }: { y: number; n: string; title: string; sub: string }) {
  return (
    <g>
      <rect x="30" y={y} width="260" height="48" rx="10" className="fill-surface stroke-line" strokeWidth="1.5" />
      <circle cx="56" cy={y + 24} r="13" className="fill-jade" />
      <text x="56" y={y + 29} textAnchor="middle" fontSize="14" fontWeight="700" className="fill-background">
        {n}
      </text>
      <text x="80" y={y + 21} fontSize="15" fontWeight="600" className="fill-foreground">
        {title}
      </text>
      <text x="80" y={y + 38} fontSize="12" className="fill-muted">
        {sub}
      </text>
    </g>
  );
}

export function RoundDiagram() {
  return (
    <Figure caption="One round, start to finish. The turn loop repeats until someone calls Mahjong or the wall runs out.">
      <div className="mx-auto max-w-sm">
        <Svg
          viewBox="0 0 320 570"
          title="How a round of American Mahjong goes"
          desc="Build the wall, deal 13 tiles to each player and 14 to the dealer, play the Charleston, then take turns drawing or calling a discard and discarding one tile, until a hand matches the card (Mahjong) or the wall runs out (a wall game)."
        >
          {(arrow) => (
            <>
              <Step y={8} n="1" title="Build the wall" sub="Four walls, pushed into a square" />
              <Step y={76} n="2" title="Deal" sub="13 tiles each, 14 for the dealer" />
              <Step y={144} n="3" title="The Charleston" sub="Pass tiles to improve your hand" />
              <Step y={212} n="4" title="Dealer discards first" sub="Then turns go counterclockwise" />
              {[56, 124, 192].map((y) => (
                <path key={y} d={`M160 ${y} L160 ${y + 20}`} className="stroke-jade-strong" strokeWidth="2.5" markerEnd={arrow} />
              ))}
              <path d="M160 260 L160 282" className="stroke-jade-strong" strokeWidth="2.5" markerEnd={arrow} />
              {/* the loop */}
              <rect x="14" y="284" width="292" height="152" rx="14" className="fill-none stroke-jade" strokeWidth="2" strokeDasharray="6 5" />
              <text x="26" y="306" fontSize="12" fontWeight="600" className="fill-jade-strong">
                Each turn
              </text>
              <rect x="30" y="338" width="116" height="84" rx="10" className="fill-surface stroke-line" strokeWidth="1.5" />
              <text x="88" y="366" textAnchor="middle" fontSize="14" fontWeight="600" className="fill-foreground">
                Draw a tile
              </text>
              <text x="88" y="386" textAnchor="middle" fontSize="12" className="fill-muted">
                or call a
              </text>
              <text x="88" y="402" textAnchor="middle" fontSize="12" className="fill-muted">
                discard
              </text>
              <rect x="174" y="338" width="116" height="84" rx="10" className="fill-surface stroke-line" strokeWidth="1.5" />
              <text x="232" y="376" textAnchor="middle" fontSize="14" fontWeight="600" className="fill-foreground">
                Discard
              </text>
              <text x="232" y="396" textAnchor="middle" fontSize="12" className="fill-muted">
                one tile
              </text>
              <path d="M148 380 L170 380" className="stroke-jade-strong" strokeWidth="2.5" markerEnd={arrow} />
              <path d="M232 336 L232 322 L88 322 L88 334" className="fill-none stroke-jade-strong" strokeWidth="2.5" markerEnd={arrow} />
              <text x="160" y="316" textAnchor="middle" fontSize="11" className="fill-muted">
                next player, counterclockwise
              </text>
              {/* exits */}
              <path d="M84 436 L84 474" className="stroke-jade-strong" strokeWidth="2.5" markerEnd={arrow} />
              <path d="M236 436 L236 474" className="stroke-jade-strong" strokeWidth="2.5" markerEnd={arrow} />
              <rect x="14" y="478" width="140" height="80" rx="10" className="fill-jade/20 stroke-jade-strong" strokeWidth="1.5" />
              <text x="84" y="504" textAnchor="middle" fontSize="14" fontWeight="700" className="fill-jade-strong">
                Mahjong!
              </text>
              <text x="84" y="524" textAnchor="middle" fontSize="12" className="fill-foreground">
                Your 14 tiles match
              </text>
              <text x="84" y="540" textAnchor="middle" fontSize="12" className="fill-foreground">
                a hand on the card
              </text>
              <rect x="166" y="478" width="140" height="80" rx="10" className="fill-surface stroke-line" strokeWidth="1.5" />
              <text x="236" y="504" textAnchor="middle" fontSize="14" fontWeight="700" className="fill-foreground">
                Wall game
              </text>
              <text x="236" y="524" textAnchor="middle" fontSize="12" className="fill-foreground">
                The wall runs out:
              </text>
              <text x="236" y="540" textAnchor="middle" fontSize="12" className="fill-foreground">
                no winner, new round
              </text>
            </>
          )}
        </Svg>
      </div>
    </Figure>
  );
}

// ---------- 6. Jokers ----------

function Row({ y, label, tiles, ok }: { y: number; label: string; tiles: TileKind[]; ok: boolean }) {
  return (
    <g>
      <text x="10" y={y + 25} fontSize="14" fontWeight="600" className="fill-foreground">
        {label}
      </text>
      {tiles.map((k, i) => (
        <MiniTile key={i} x={84 + i * 32} y={y} kind={k} />
      ))}
      {ok ? (
        <path d={`M300 ${y + 20} l8 9 l16 -20`} className="fill-none stroke-jade-strong" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d={`M302 ${y + 10} l20 20 M322 ${y + 10} l-20 20`} className="fill-none stroke-tile-red" strokeWidth="4" strokeLinecap="round" />
      )}
    </g>
  );
}

export function JokersDiagram() {
  return (
    <Figure caption="A joker can replace any tile in a group of three or more matching tiles. It can never be used for a single tile or as part of a pair.">
      <div className="mx-auto max-w-md">
        <Svg
          viewBox="0 0 340 380"
          title="Where a joker can and cannot be used"
          desc="A joker can stand in for a tile in a pung, kong, quint or sextet. It cannot stand in for a single tile or part of a pair."
        >
          {() => (
            <>
              <text x="10" y="22" fontSize="14" fontWeight="700" className="fill-jade-strong">
                A joker (J) can fill in
              </text>
              <Row y={34} label="Pung" tiles={["dot", "dot", "joker"]} ok />
              <Row y={82} label="Kong" tiles={["dot", "dot", "joker", "dot"]} ok />
              <Row y={130} label="Quint" tiles={["dot", "joker", "dot", "joker", "dot"]} ok />
              <Row y={178} label="Sextet" tiles={["dot", "joker", "dot", "joker", "dot", "dot"]} ok />
              <line x1="10" y1="236" x2="330" y2="236" className="stroke-line" strokeWidth="1.5" />
              <text x="10" y="262" fontSize="14" fontWeight="700" className="fill-tile-red">
                A joker can&rsquo;t be used for
              </text>
              <Row y={274} label="Single" tiles={["joker"]} ok={false} />
              <Row y={322} label="Pair" tiles={["dot", "joker"]} ok={false} />
            </>
          )}
        </Svg>
      </div>
    </Figure>
  );
}

// ---------- 7. Groups of matching tiles ----------

export function GroupsDiagram() {
  const rows: [string, number][] = [
    ["Single", 1],
    ["Pair", 2],
    ["Pung", 3],
    ["Kong", 4],
    ["Quint", 5],
    ["Sextet", 6],
  ];
  return (
    <Figure caption="Groups of matching tiles, shown here with 5 Dots. Jokers can fill in for tiles in a pung, kong, quint or sextet, but never in a single or a pair.">
      <div className="mx-auto max-w-md">
        <Svg viewBox="0 0 340 330" title="Single, pair, pung, kong, quint and sextet" desc="One tile is a single, two a pair, three a pung, four a kong, five a quint and six a sextet.">
          {() => (
            <>
              {rows.map(([label, n], i) => (
                <g key={label}>
                  <text x="10" y={30 + i * 52} fontSize="14" fontWeight="600" className="fill-foreground">
                    {label}
                  </text>
                  <text x="10" y={46 + i * 52} fontSize="11" className="fill-muted">
                    {n} {n === 1 ? "tile" : "tiles"}
                  </text>
                  {Array.from({ length: n }, (_, k) => (
                    <MiniTile key={k} x={84 + k * 32} y={6 + i * 52} />
                  ))}
                </g>
              ))}
            </>
          )}
        </Svg>
      </div>
    </Figure>
  );
}

export function Diagram({ id }: { id: DiagramId }) {
  switch (id) {
    case "charleston":
      return <CharlestonDiagram />;
    case "table":
      return <TableDiagram />;
    case "payments":
      return <PaymentsDiagram />;
    case "tileset":
      return <TileSetDiagram />;
    case "round":
      return <RoundDiagram />;
    case "jokers":
      return <JokersDiagram />;
    case "groups":
      return <GroupsDiagram />;
  }
}
