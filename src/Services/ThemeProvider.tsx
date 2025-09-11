import { useEffect } from "react";

import { useThemeStore } from "./themeStore";

// import { SessionProvider } from "next-auth/react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useThemeStore();

  // On mount, load stored preference
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as
      | "system"
      | "light"
      | "dark"
      | null;
    setTheme(storedTheme || "system");
  }, [setTheme]);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      if (theme === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", theme === "dark");
      }
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  // PrimeReact theme swapping
  useEffect(() => {
    const link = document.getElementById("prime-theme") as HTMLLinkElement;
    if (!link) return;
    link.href =
      theme === "dark"
        ? "/themes/lara-dark-blue/theme.css"
        : "/themes/lara-light-blue/theme.css";
  }, [theme]);

  // return <SessionProvider>{children}</SessionProvider>;
  return <>{children}</>;
}
