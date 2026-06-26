import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        // Add a brief full-page fade overlay for a smooth transition
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.15);
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          transition: opacity 180ms ease-out;
        `;
        document.body.appendChild(overlay);

        // Fade in
        requestAnimationFrame(() => {
          overlay.style.opacity = "1";
        });

        // Switch theme at peak opacity, then fade out
        setTimeout(() => {
          setTheme(prev => (prev === "light" ? "dark" : "light"));
          overlay.style.opacity = "0";
          setTimeout(() => overlay.remove(), 200);
        }, 180);
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Re-export as default to satisfy Vite Fast Refresh (one component per file rule)
export default ThemeContext;
