"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { isThemePreference, THEME_CHANGE_EVENT, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

function applyTheme(preference: ThemePreference) {
  const dark = preference === "dark" || (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.classList.toggle("dark", dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#101914" : "#114b2f");
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function getPreference(): ThemePreference {
  const preference = document.documentElement.dataset.themePreference;
  return isThemePreference(preference) ? preference : "system";
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

const subscribeToHydration = () => () => {};

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, getPreference, () => "system" as const);
  const ready = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  function setPreference(next: ThemePreference) {
    try { window.localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* The current tab still works without storage. */ }
    applyTheme(next);
  }
  return { preference, setPreference, ready };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncPreference = () => {
      let preference = getPreference();
      try {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        preference = isThemePreference(saved) ? saved : "system";
      } catch { /* Keep this tab's selection if storage is blocked. */ }
      applyTheme(preference);
    };
    // Another tab may have changed the preference between first paint and hydration.
    syncPreference();
    const onSystemChange = () => {
      if (getPreference() === "system") applyTheme("system");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      applyTheme(isThemePreference(event.newValue) ? event.newValue : "system");
    };
    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", syncPreference);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", syncPreference);
    };
  }, []);
  return children;
}
