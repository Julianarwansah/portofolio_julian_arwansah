import { createContext, useContext } from "react";

// The provider component lives in components/ThemeProvider.jsx so this module
// stays free of JSX — Vite's esbuild does not parse JSX in .js files.
export const ThemeContext = createContext(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
