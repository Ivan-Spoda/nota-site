import RAW from "../data/github.json";

// The GitHub figures snapshotted at build time by scripts/github-snapshot.mjs.
export type Asset = { name: string; size: number; browser_download_url: string };
export type Contributor = { name: string; login?: string; avatar?: string; url?: string; contributions: number };
export const GITHUB = RAW as {
  fetchedAt: string | null;
  release: { version: string; date: string | null; assets: Asset[] };
  contributors: Contributor[];
};
