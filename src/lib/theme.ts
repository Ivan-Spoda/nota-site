import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "nota-site-theme";
const query = () => window.matchMedia("(prefers-color-scheme: light)");

function saved(): Theme | null {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "dark" || t === "light") return t;
  } catch { /* storage blocked */ }
  return null;
}
const system = (): Theme => (query().matches ? "light" : "dark");

/** The site theme: the visitor's pick if they made one, otherwise the system's. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => saved() ?? system());
  // Also kept in memory, so a pick sticks for this visit even where storage is blocked.
  const picked = useRef(saved() !== null);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Browser chrome follows the site theme, not just the system's.
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#C9CBCF" : "#1E1F22");
  }, [theme]);
  useEffect(() => {
    const mq = query();
    const follow = () => { if (!picked.current) setTheme(system()); };
    mq.addEventListener("change", follow);
    return () => mq.removeEventListener("change", follow);
  }, []);
  const choose = (t: Theme) => {
    picked.current = true;
    setTheme(t);
    try { localStorage.setItem(KEY, t); } catch { /* storage blocked */ }
  };
  return [theme, choose] as const;
}

export const ThemeContext = createContext<Theme>("dark");

/** An app screenshot in the site's current theme: light renders sit next to the dark ones as "<name>-light.avif". */
export function useShot() {
  const theme = useContext(ThemeContext);
  return useCallback((path: string) => import.meta.env.BASE_URL + (theme === "light" ? path.replace(/\.avif$/, "-light.avif") : path), [theme]);
}
