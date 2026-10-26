// Small line icons for the three "How it works" steps on the home page. Decorative: each step has its own heading.

const common = {
  viewBox: "0 0 32 32",
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  className: "h-8 w-8 stroke-jade-strong",
};

export function LearnIcon() {
  // an open book
  return (
    <svg {...common}>
      <path d="M16 8c-2.5-2-6-2.5-11-2v18c5-.5 8.5 0 11 2 2.5-2 6-2.5 11-2V6c-5-.5-8.5 0-11 2z" />
      <path d="M16 8v18" />
    </svg>
  );
}

export function FindIcon() {
  // a map pin
  return (
    <svg {...common}>
      <path d="M16 29s9-8.2 9-15a9 9 0 1 0-18 0c0 6.8 9 15 9 15z" />
      <circle cx="16" cy="14" r="3.5" />
    </svg>
  );
}

export function PlayIcon() {
  // a mahjong tile with a dot
  return (
    <svg {...common}>
      <rect x="7" y="3" width="18" height="26" rx="4" />
      <circle cx="16" cy="16" r="5" />
      <circle cx="16" cy="16" r="1.5" className="fill-tile-red stroke-tile-red" />
    </svg>
  );
}
