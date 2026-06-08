import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "vb-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
}

/**
 * Light/dark theme state, persisted to localStorage and reflected as
 * data-theme on <html>. Defaults to light. The pre-paint script in
 * _document.tsx sets the attribute before hydration to avoid a flash;
 * this hook syncs React state to it on mount.
 */
export function useTheme() {
  // Match the server-rendered markup (light) on first client render, then
  // reconcile to the persisted choice in the effect below — no hydration gap.
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: Theme | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    } catch {
      stored = null;
    }
    const current =
      stored ??
      (document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light");
    setTheme(current);
    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode / storage disabled — theme still applies for the session */
      }
      return next;
    });
  };

  return { theme, toggle, mounted };
}
