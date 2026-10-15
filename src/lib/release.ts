import { useEffect, useState } from "react";
import { GITHUB, type Asset } from "./github";

export const RELEASES_URL = "https://github.com/nota-daw/nota/releases/latest";
const API = "https://api.github.com/repos/nota-daw/nota/releases/latest";

export type BuildKey = "macArm" | "macIntel" | "win" | "winArm" | "linux" | "linuxArm";
type Os = "mac" | "win" | "linux";

// Asset names produced by nota's .github/workflows/release.yml.
const PICK: Record<BuildKey, RegExp[]> = {
  macArm: [/arm64\.dmg$/i, /aarch64\.dmg$/i],
  macIntel: [/(x86_64|x64|intel)\.dmg$/i],
  win: [/(x64|x86_64|amd64)\.exe$/i, /(x64|x86_64)\.msi$/i, /^(?!.*arm64).*\.exe$/i],
  winArm: [/arm64\.exe$/i],
  linux: [/x86_64\.AppImage$/i, /amd64.*\.(AppImage|deb)$/i, /^(?!.*aarch64).*\.AppImage$/i],
  linuxArm: [/(aarch64|arm64)\.AppImage$/i],
};

function pick(list: Asset[]) {
  const found: Partial<Record<BuildKey, Asset>> = {};
  (Object.keys(PICK) as BuildKey[]).forEach((k) => {
    for (const re of PICK[k]) {
      const a = list.find((x) => re.test(x.name));
      if (a) { found[k] = a; break; }
    }
  });
  return found;
}

export const META: Record<BuildKey, { os: string; arch: string; label: string; short: string }> = {
  macArm: { os: "macOS", arch: "Apple Silicon (M1 and newer)", label: "Download for macOS", short: "macOS" },
  macIntel: { os: "macOS", arch: "Intel", label: "Download for macOS", short: "macOS Intel" },
  win: { os: "Windows", arch: "Windows 10 and 11, 64-bit", label: "Download for Windows", short: "Windows" },
  linux: { os: "Linux", arch: "x86_64 · AppImage", label: "Download for Linux", short: "Linux" },
  winArm: { os: "Windows", arch: "ARM64", label: "Download for Windows", short: "Windows" },
  linuxArm: { os: "Linux", arch: "ARM64", label: "Download for Linux", short: "Linux" },
};

type NavigatorUAData = {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
};
const uaData = () => (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;

function detectOS(): Os {
  const s = (uaData()?.platform || navigator.platform || "") + " " + (navigator.userAgent || "");
  if (/Win/i.test(s)) return "win";
  if (/Mac|iPhone|iPad/i.test(s)) return "mac";
  if (/Linux|X11|CrOS/i.test(s)) return "linux";
  return "mac";
}

export type Release = ReturnType<typeof useRelease>;

/** Latest GitHub release plus the visitor's OS. Starts from the release snapshotted at build time
 *  (src/data/github.json) and swaps in the live one when the GitHub API answers. */
export function useRelease() {
  const [os] = useState<Os>(detectOS);
  // Unknown until the browser reports it: Windows and Linux pick ARM only on a positive "arm",
  // while macOS defaults to Apple Silicon unless it reports "x86".
  const [arch, setArch] = useState("");
  const [assets, setAssets] = useState<Partial<Record<BuildKey, Asset>>>(() => pick(GITHUB.release.assets));
  const [version, setVersion] = useState(GITHUB.release.version);
  const [date, setDate] = useState<string | null>(GITHUB.release.date);

  useEffect(() => {
    uaData()?.getHighEntropyValues?.(["architecture"])
      .then((v) => { if (v.architecture) setArch(v.architecture); })
      .catch(() => {});
    fetch(API)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const tag = String(j?.tag_name || "").replace(/^v/, "");
        if (!tag) return;
        setAssets(pick(j.assets || []));
        setVersion(tag);
        setDate(j.published_at ?? null);
      })
      .catch(() => {});
  }, []);

  const dl = (key: BuildKey) => {
    const a = assets[key];
    const fallback: Record<BuildKey, string> = {
      macArm: `Nota-${version}-arm64.dmg`, macIntel: `Nota-${version}-x86_64.dmg`,
      win: `Nota-Setup-${version}-x64.exe`, winArm: `Nota-Setup-${version}-arm64.exe`,
      linux: `Nota-${version}-x86_64.AppImage`, linuxArm: `Nota-${version}-aarch64.AppImage`,
    };
    return {
      href: a ? a.browser_download_url : RELEASES_URL,
      file: a ? a.name : fallback[key],
      size: a ? "· " + Math.round(a.size / 1048576) + " MB" : "",
    };
  };

  const isArm = arch === "arm";
  const osKey: BuildKey =
    os === "win" ? (isArm && assets.winArm ? "winArm" : "win")
    : os === "linux" ? (isArm && assets.linuxArm ? "linuxArm" : "linux")
    : arch === "x86" ? "macIntel" : "macArm";

  return { version, date, osKey, dl };
}
