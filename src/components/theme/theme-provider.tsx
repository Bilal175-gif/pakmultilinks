"use client";

import { useEffect, type ReactNode } from "react";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

function enforceLightTheme() {
  document.documentElement.dataset.theme = "light";
  document.documentElement.dataset.themePreference = "light";
  document.documentElement.classList.remove("dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#114b2f");
  try {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {}
}

export function useTheme() {
  return {
    preference: "light" as ThemePreference,
    setPreference: (_next: ThemePreference) => {},
    ready: true,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    enforceLightTheme();
  }, []);
  return children;
}

