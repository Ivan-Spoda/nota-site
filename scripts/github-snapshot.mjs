// Snapshots the latest Nota release and the project's contributors from the GitHub API into
// src/data/github.json, so the built site carries current figures even when a visitor's browser
// can't reach the API. The Pages workflow runs it before each deploy, including a daily scheduled
// one; run `npm run snapshot` to refresh it locally. With GITHUB_TOKEN set it is authenticated; if
// GitHub can't be reached the existing file is kept.
import { readFileSync, writeFileSync } from "node:fs";

const OUT = new URL("../src/data/github.json", import.meta.url);
const OWNER = "nota-daw";
const REPOS = ["nota", "nota-docs", "nota-site", "nota-plugins-registry", "nota-samples-registry", "nota-models"];
const headers = { Accept: "application/vnd.github+json", "User-Agent": "nota-site-build" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function get(path) {
  const r = await fetch(`https://api.github.com/${path}`, { headers });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}

async function contributors() {
  const byLogin = new Map();
  for (const repo of REPOS) {
    for (let page = 1; ; page++) {
      const list = await get(`repos/${OWNER}/${repo}/contributors?per_page=100&page=${page}`);
      if (!list || !list.length) break;
      for (const c of list) {
        if (c.type !== "User" || c.login.endsWith("[bot]")) continue;
        const prev = byLogin.get(c.login);
        if (prev) prev.contributions += c.contributions;
        else byLogin.set(c.login, { name: c.login, login: c.login, avatar: c.avatar_url, url: c.html_url, contributions: c.contributions });
      }
      if (list.length < 100) break;
    }
  }
  return [...byLogin.values()].sort((a, b) => b.contributions - a.contributions || a.login.localeCompare(b.login));
}

try {
  const rel = await get(`repos/${OWNER}/nota/releases/latest`);
  const snapshot = {
    fetchedAt: new Date().toISOString(),
    release: rel && {
      version: String(rel.tag_name).replace(/^v/, ""),
      date: rel.published_at,
      assets: rel.assets.map((a) => ({ name: a.name, size: a.size, browser_download_url: a.browser_download_url })),
    },
    contributors: await contributors(),
  };
  if (!snapshot.release) throw new Error("no published release found");
  writeFileSync(OUT, JSON.stringify(snapshot, null, 1) + "\n");
  console.log(`github snapshot: v${snapshot.release.version}, ${snapshot.contributors.length} contributors`);
} catch (e) {
  const kept = JSON.parse(readFileSync(OUT, "utf8"));
  console.warn(`github snapshot: ${e.message}; keeping the snapshot from ${kept.fetchedAt ?? "the repository"}`);
}
