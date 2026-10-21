import { deviceStore, type KeyValueStore } from "../services/storage";

export type ThemePreference = "system" | "light" | "dark";

export type Preferences = { theme: ThemePreference; reminders: boolean };

export const DEFAULT_PREFERENCES: Preferences = { theme: "system", reminders: true };

const KEY = "kawaii.preferences";

/** Device settings (theme, reminders). They stay on this phone and do not follow the account. */
export async function loadPreferences(store: KeyValueStore = deviceStore): Promise<Preferences> {
  try {
    const saved = JSON.parse((await store.getItem(KEY)) ?? "{}");
    return {
      theme: ["system", "light", "dark"].includes(saved.theme) ? saved.theme : DEFAULT_PREFERENCES.theme,
      reminders: typeof saved.reminders === "boolean" ? saved.reminders : DEFAULT_PREFERENCES.reminders,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(preferences: Preferences, store: KeyValueStore = deviceStore): Promise<void> {
  await store.setItem(KEY, JSON.stringify(preferences));
}
