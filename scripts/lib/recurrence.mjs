// Weekly / monthly play stated as a plain pattern ("Every Thursday 5-7 PM", "Mondays 12:00-3:00 PM", "2nd and 4th Monday 9:30-11:00 a.m.")
// -> rules -> dated sessions for the next weeks. Strict on purpose: a schedule that names months, a season, a series or says the dates
// are past, sold out or vary gives nothing, so only a standing weekly or monthly game is turned into sessions.

const DAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }; // looked up by the first three letters
const DAYRE = "(sun|mon|tues?|wed(?:nes)?|thu(?:rs?)?|fri|sat(?:ur)?)(?:day)?s?";
const NTH = { "1st": 1, first: 1, "2nd": 2, second: 2, "3rd": 3, third: 3, "4th": 4, fourth: 4, last: -1 };
// anything that says the pattern is not a standing one
const REJECT = /\bmember|membership|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d|\b(january|february|march|april|june|july|august|september|october|november|december)\b|\b20\d\d\b|past|ended|sold out|full\b|waitlist|hiatus|cancel|season|series|session|semester|quarter|term\b|periodic|varies|check|see\b|call\b|contact|tbd|not (listed|shown|published)|no (class|upcoming)|starting|starts|begin|first (class|session)|weeks?\b|per week|each (class|session)/i;

function clock(h, m, ap, fallbackAp) {
  let hh = Number(h);
  const mm = m ? Number(m) : 0;
  const a = (ap || fallbackAp || "").toLowerCase().replace(/\./g, "");
  if (a === "pm" && hh < 12) hh += 12;
  if (a === "am" && hh === 12) hh = 0;
  if (!a) return null;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// -> { rules: [{ day: 0-6, nth: [..]|null }], start, end } or null
export function parseRecurrence(text) {
  const t = String(text ?? "").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
  if (!t || REJECT.test(t)) return null;
  // days: "every Thursday", "Mondays", "Monday and Wednesday", "2nd and 4th Monday"
  const rules = [];
  const nthM = t.match(new RegExp(`((?:(?:1st|2nd|3rd|4th|first|second|third|fourth|last)(?:\\s*(?:,|and|&)\\s*)?)+)\\s*${DAYRE}`, "i"));
  if (nthM) {
    const nth = [...nthM[1].toLowerCase().matchAll(/1st|2nd|3rd|4th|first|second|third|fourth|last/g)].map((x) => NTH[x[0]]);
    rules.push({ day: DAYS[nthM[2].toLowerCase().slice(0, 3)], nth });
  } else {
    for (const m of t.matchAll(new RegExp(`\\b${DAYRE}\\b`, "gi"))) {
      const d = DAYS[m[1].toLowerCase().slice(0, 3)];
      if (d !== undefined && !rules.some((r) => r.day === d)) rules.push({ day: d, nth: null });
    }
  }
  if (!rules.length || rules.length > 3) return null;
  // time: "5-7 PM", "5:00 PM-7:00 PM", "9:30-11:00 a.m.", "10am-12pm", or a single start "at 6 PM"
  const ap = "(a\\.?m\\.?|p\\.?m\\.?)";
  const range = t.match(new RegExp(`(\\d{1,2})(?::(\\d{2}))?\\s*${ap}?\\s*-\\s*(\\d{1,2})(?::(\\d{2}))?\\s*${ap}`, "i"));
  let start, end;
  if (range) {
    end = clock(range[4], range[5], range[6]);
    start = clock(range[1], range[2], range[3], range[6]);
    if (start && end && start >= end && !range[3]) start = clock(range[1], range[2], "am"); // "11-1 PM"
  } else {
    const one = t.match(new RegExp(`(\\d{1,2})(?::(\\d{2}))?\\s*${ap}`, "i"));
    if (one) start = clock(one[1], one[2], one[3]);
  }
  if (!start || (end && start >= end)) return null;
  // two days with two different times ("Mondays 6 PM and Wednesdays 1 PM", "Rookie Play Sundays 2-4:30 PM; Monday night ...") are not one pattern
  const ranges = [...t.matchAll(new RegExp(`\\d{1,2}(?::\\d{2})?\\s*${ap}?\\s*-\\s*\\d{1,2}(?::\\d{2})?\\s*${ap}`, "gi"))];
  const rest = t.replace(new RegExp(`\\d{1,2}(?::\\d{2})?\\s*${ap}?\\s*-\\s*\\d{1,2}(?::\\d{2})?\\s*${ap}`, "gi"), " ");
  const singles = [...rest.matchAll(new RegExp(`\\d{1,2}(?::\\d{2})?\\s*${ap}`, "gi"))];
  if (ranges.length + singles.length > 1) return null;
  return { rules, start, end: end ?? "" };
}

// US holidays with no game: Thanksgiving, Christmas Eve and Day, New Year's Day, July 4, Memorial and Labor Day
function holidays(year) {
  const nthDow = (m, dow, n) => { const d = new Date(Date.UTC(year, m, 1)); const off = (dow - d.getUTCDay() + 7) % 7; return new Date(Date.UTC(year, m, 1 + off + 7 * (n - 1))); };
  const lastMon = () => { const d = new Date(Date.UTC(year, 5, 0)); return new Date(Date.UTC(year, 4, d.getUTCDate() - ((d.getUTCDay() + 6) % 7))); };
  return new Set([nthDow(10, 4, 4), new Date(Date.UTC(year, 11, 24)), new Date(Date.UTC(year, 11, 25)), new Date(Date.UTC(year, 0, 1)), new Date(Date.UTC(year, 6, 4)), lastMon(), nthDow(8, 1, 1)].map((d) => d.toISOString().slice(0, 10)));
}

// dates (YYYY-MM-DD) from `from` (inclusive) for `days` days that match a rule
export function expand(parsed, from, days = 42) {
  const out = [];
  const start = new Date(`${from}T00:00:00Z`);
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 864e5);
    const iso = d.toISOString().slice(0, 10);
    if (holidays(d.getUTCFullYear()).has(iso)) continue;
    const n = Math.ceil(d.getUTCDate() / 7);
    const isLast = d.getUTCDate() + 7 > new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    for (const r of parsed.rules) {
      if (d.getUTCDay() !== r.day) continue;
      if (!r.nth || r.nth.includes(n) || (r.nth.includes(-1) && isLast)) { out.push(iso); break; }
    }
  }
  return out;
}
