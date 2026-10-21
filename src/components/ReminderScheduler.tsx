import { useEffect } from "react";

import { useFriend } from "../context/FriendProvider";
import { usePreferences } from "../context/PreferencesProvider";
import { planReminders } from "../lib/reminders";
import { cancelReminders, scheduleReminders } from "../services/notifications";

/** Keeps the scheduled notifications in step with the friend; renders nothing. */
export function ReminderScheduler() {
  const { record } = useFriend();
  const { preferences, permission, ready } = usePreferences();
  const enabled = ready && preferences.reminders && permission === "granted";

  useEffect(() => {
    const work = enabled && record ? scheduleReminders(planReminders(record, Date.now())) : cancelReminders();
    work.catch(() => {});
  }, [enabled, record]);

  return null;
}
