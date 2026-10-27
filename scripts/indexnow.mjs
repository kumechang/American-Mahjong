#!/usr/bin/env node
// Tells IndexNow (Bing, Yandex, Naver, Seznam and others; not Google) about new or changed pages.
//
//   node scripts/indexnow.mjs --dry-run                 show what would be sent
//   node scripts/indexnow.mjs                           send the sitemap URLs whose lastmod is within the last 2 days
//   node scripts/indexnow.mjs --since=7                 ... within the last 7 days
//   node scripts/indexnow.mjs --all                     send every sitemap URL (first run, or after a site-wide change)
//   node scripts/indexnow.mjs --url=https://mahjong-map.com/learn/rules   send only these (repeatable)
//   node scripts/indexnow.mjs --wait=10                 wait up to 10 minutes for the key file to be live (right after a deploy)
//
// The key is the name of the file in public/<key>.txt (its content is the key itself). It is public by design.
// Nothing is sent until the key file is reachable on the site. A submission is a notice, not a promise to index.

import { readdirSync, readFileSync } from "node:fs";

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const flag = (n) => process.argv.includes(`--${n}`);
const SITE = (arg("site") ?? "https://mahjong-map.com").replace(/\/$/, "");
const host = new URL(SITE).host;

const keyFile = readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.error("no key file (public/<32 hex>.txt)"); process.exit(2); }
const key = keyFile.replace(/\.txt$/, "");
if (readFileSync(`public/${keyFile}`, "utf8").trim() !== key) { console.error("the key file's content must equal its name"); process.exit(2); }
const keyLocation = `${SITE}/${keyFile}`;
const UA = "MahjongMapBot/1.0 (+https://mahjong-map.com/about)";

async function keyIsLive() {
  try {
    const res = await fetch(keyLocation, { headers: { "user-agent": UA } });
    return res.ok && (await res.text()).trim() === key;
  } catch { return false; }
}

let urls = (process.argv.filter((a) => a.startsWith("--url=")).map((a) => a.slice(6)));
if (urls.length === 0) {
  const xml = await (await fetch(`${SITE}/sitemap.xml`, { headers: { "user-agent": UA } })).text();
  const days = Number(arg("since") ?? 2);
  const cutoff = Date.now() - days * 864e5;
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = (m[1].match(/<loc>([^<]+)<\/loc>/) ?? [])[1];
    const last = (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) ?? [])[1];
    if (!loc) continue;
    if (flag("all") || (last && Date.parse(last) >= cutoff)) urls.push(loc);
  }
}
urls = [...new Set(urls)].filter((u) => new URL(u).host === host);
console.log(`IndexNow: ${urls.length} URL(s) for ${host}${flag("dry-run") ? " (dry run)" : ""}`);
if (flag("dry-run")) { for (const u of urls.slice(0, 15)) console.log("  " + u); process.exit(0); }
if (urls.length === 0) { console.log("nothing to send"); process.exit(0); }

const waitMin = Number(arg("wait") ?? 0);
const until = Date.now() + waitMin * 60e3;
while (!(await keyIsLive())) {
  if (Date.now() >= until) { console.error(`key file is not live at ${keyLocation}: nothing sent`); process.exit(1); }
  await new Promise((r) => setTimeout(r, 20e3));
}

for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", "user-agent": UA },
    body: JSON.stringify({ host, key, keyLocation, urlList: urls.slice(i, i + 10000) }),
  });
  // 200 = received, 202 = received (key validation pending); 4xx = rejected
  console.log(`  batch ${i / 10000 + 1}: HTTP ${res.status}`);
  if (res.status >= 400) { console.error(await res.text()); process.exit(1); }
}
