import { useEffect } from "react";
import { useStore } from "@/store/store";
import { db } from "@/db";

export function ThemeProvider({ children }) {
  const accent = useStore((s) => s.settings?.accent_color);
  // Direct one-shot read from IndexedDB on mount so the accent is applied
  // BEFORE loadAll() finishes populating the store.
  useEffect(() => {
    (async () => {
      const s = await db.settings.get("default");
      if (s?.accent_color) {
        document.documentElement.style.setProperty("--acid", s.accent_color);
        document.documentElement.style.setProperty("--acid-hover", s.accent_color);
      }
    })();
  }, []);
  useEffect(() => {
    if (accent) {
      document.documentElement.style.setProperty("--acid", accent);
      document.documentElement.style.setProperty("--acid-hover", accent);
    }
  }, [accent]);
  return children;
}
