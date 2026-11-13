// Open origin/inbox/<date> branches (AI runs; crawl-/discover- branches are auto-imported) -> temp dirs holding only the files each branch ADDED relative to origin/main.
// (A branch carries the whole data/inbox of the main it was cut from; extracting all of it would count every old run again.)
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export function inboxBranchRoots() {
  const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 200e6 });
  git("fetch", "-q", "origin", "main");
  const heads = git("ls-remote", "--heads", "origin", "inbox/2*").split("\n").filter(Boolean).map((l) => l.split("\t")[1].replace("refs/heads/", ""));
  const tmp = mkdtempSync(join(tmpdir(), "inbox-branches-"));
  const roots = [];
  for (const b of heads) {
    try {
      git("fetch", "-q", "origin", b);
      const files = git("diff", "--name-only", "--diff-filter=A", "origin/main...FETCH_HEAD", "--", "data/inbox").split("\n").filter(Boolean);
      if (!files.length) continue;
      const base = join(tmp, b.replace(/\//g, "_"));
      for (const f of files) {
        const p = join(base, f);
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, execFileSync("git", ["show", `FETCH_HEAD:${f}`], { maxBuffer: 50e6 }));
      }
      roots.push({ run: b.replace(/^inbox\//, ""), dir: join(base, "data/inbox") });
    } catch (e) { console.error(`skip ${b}: ${e.message.split("\n")[0]}`); }
  }
  return roots;
}
