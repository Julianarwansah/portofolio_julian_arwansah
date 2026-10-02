import { useEffect, useState } from "react";

// Shared by every route so the chosen theme survives navigation to a project page.
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.body.classList.toggle("light-mode", theme === "light");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage is blocked in private browsing; the toggle still works for this session.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return { theme, toggleTheme };
}
