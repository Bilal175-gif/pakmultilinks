export const THEME_STORAGE_KEY = "pmh.theme.v1";
export const THEME_CHANGE_EVENT = "pmh:theme-changed";
export type ThemePreference = "light" | "dark" | "system";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

// Runs synchronously in <head>, before the first paint. Keep storage optional:
// private browsing and blocked storage must not prevent the page from rendering.
export const themeInitializationScript = `(() => {
  let preference = "system";
  try {
    const saved = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (saved === "light" || saved === "dark" || saved === "system") preference = saved;
  } catch {}
  const dark = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference;
})();`;
