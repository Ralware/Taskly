import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { db } from "@/db";

const THEME_KEY = "taskly-theme";
const ThemeContext = createContext({ theme: "dark", setTheme: () => {} });

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const accent = useStore((s) => s.settings?.accent_color);
  const [theme, setThemeState] = useState(getInitialTheme);

  const setTheme = (nextTheme) => {
    const next = nextTheme === "light" ? "light" : "dark";
    setThemeState(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* non-persistent fallback */ }
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.documentElement.classList.add("theme-transition");
  }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const settings = await db.settings.get("default");
        if (settings?.accent_color) {
          document.documentElement.style.setProperty("--acid", settings.accent_color);
        }
      } catch {
        // The default CSS accent is intentionally retained if IndexedDB is unavailable.
      }
    })();
  }, []);

  useEffect(() => {
    if (accent) document.documentElement.style.setProperty("--acid", accent);
  }, [accent]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
