import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../lib/theme";

const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// A stored choice always wins; the OS preference only decides the first visit.
const readInitialTheme = () => {
  try {
    return localStorage.getItem("theme") || systemTheme();
  } catch {
    // Storage is blocked in private browsing; fall back to the OS preference.
    return systemTheme();
  }
};

// Single source of truth for the theme. Every route used to call useTheme()
// and own an independent useState, so adding a second toggle (the command
// palette) would have flipped the body class while the Navbar icon stayed stale.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.body.classList.toggle("light-mode", theme === "light");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage is blocked in private browsing; the toggle still works this session.
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    []
  );

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
