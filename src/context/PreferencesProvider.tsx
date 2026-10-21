import { colorScheme } from "nativewind";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { loadPreferences, type Preferences, savePreferences, type ThemePreference } from "../lib/preferences";
import * as notifications from "../services/notifications";

type PreferencesValue = {
  ready: boolean;
  preferences: Preferences;
  permission: notifications.PermissionState;
  setTheme(theme: ThemePreference): void;
  /** Turning reminders on asks for permission the first time. */
  setReminders(on: boolean): Promise<void>;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [permission, setPermission] = useState<notifications.PermissionState>("undetermined");
  const system = useColorScheme();

  useEffect(() => {
    loadPreferences().then(setPreferences);
    notifications.getPermission().then(setPermission).catch(() => setPermission("unsupported"));
  }, []);

  // Tailwind uses darkMode: "class", and on web "system" would only clear the class,
  // so always pass the resolved scheme.
  const theme = preferences?.theme ?? "system";
  useEffect(() => {
    colorScheme.set(theme === "system" ? (system === "dark" ? "dark" : "light") : theme);
  }, [theme, system]);

  const update = useCallback((change: Partial<Preferences>) => {
    setPreferences((current) => {
      if (!current) return current;
      const next = { ...current, ...change };
      savePreferences(next).catch(() => {});
      return next;
    });
  }, []);

  const setReminders = useCallback(
    async (on: boolean) => {
      update({ reminders: on });
      if (on) setPermission(await notifications.requestPermission().catch(() => "unsupported" as const));
    },
    [update],
  );

  const value = useMemo<PreferencesValue>(
    () => ({
      ready: preferences !== null,
      preferences: preferences ?? { theme: "system", reminders: true },
      permission,
      setTheme: (next) => update({ theme: next }),
      setReminders,
    }),
    [preferences, permission, update, setReminders],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside PreferencesProvider");
  return value;
}
