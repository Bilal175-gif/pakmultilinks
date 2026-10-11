"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { isThemePreference } from "@/lib/theme";
import { useTheme } from "./theme-provider";

export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const { preference, setPreference, ready } = useTheme();
  return (
    <label className={`theme-switch${compact ? " theme-switch-compact" : ""}`}>
      <span className="theme-switch-icon" aria-hidden="true"><Sun className="theme-icon-light" size={18} /><Moon className="theme-icon-dark" size={18} /><Monitor className="theme-icon-system" size={18} /></span>
      <span className="sr-only">Color theme</span>
      <select disabled={!ready} value={preference} onChange={event => { if (isThemePreference(event.target.value)) setPreference(event.target.value); }} title="Color theme">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
