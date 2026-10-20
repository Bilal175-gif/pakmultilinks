export const THEME_STORAGE_KEY = "pmh.theme.v1";
export const THEME_CHANGE_EVENT = "pmh:theme-changed";
export type ThemePreference = "light" | "dark" | "system";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

// Runs synchronously in <head>, before the first paint. Keep storage optional:
// private browsing and blocked storage must not prevent the page from rendering.
export const themeInitializationScript = `(() => {
  try {
    localStorage.removeItem(${JSON.stringify(THEME_STORAGE_KEY)});
  } catch {}
  document.documentElement.dataset.theme = "light";
  document.documentElement.dataset.themePreference = "light";
  document.documentElement.classList.remove("dark");
})();`;
