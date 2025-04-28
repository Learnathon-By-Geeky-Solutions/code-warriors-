// file: src/components/theme/theme-wrapper.tsx
"use client";

import { useTheme } from "next-themes";
import { colors } from "@/components/theme/colors";
import styles from "@/app/styles/Layout.module.css";
import { useEffect } from "react";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();

  // Use effect to update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = resolvedTheme || theme;

    if (currentTheme === "dark") {
      root.style.setProperty("--bg-start", colors.background.dark.start);
      root.style.setProperty("--bg-end", colors.background.dark.end);
    } else {
      root.style.setProperty("--bg-start", colors.background.light.start);
      root.style.setProperty("--bg-end", colors.background.light.end);
    }
  }, [theme, resolvedTheme]);

  return (
    <div className={`${styles.container} theme-container`}>{children}</div>
  );
}
