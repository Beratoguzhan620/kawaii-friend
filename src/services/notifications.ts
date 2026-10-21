import {
  AndroidImportance,
  cancelAllScheduledNotificationsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
  setNotificationChannelAsync,
  setNotificationHandler,
} from "expo-notifications";
import { Platform } from "react-native";

import type { Reminder } from "../lib/reminders";

export type PermissionState = "granted" | "denied" | "undetermined" | "unsupported";

const CHANNEL = "reminders";

// Show reminders as banners even while the app is open.
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await setNotificationChannelAsync(CHANNEL, {
    name: "Hatırlatmalar",
    importance: AndroidImportance.DEFAULT,
  });
}

export async function getPermission(): Promise<PermissionState> {
  const { status } = await getPermissionsAsync();
  return status as PermissionState;
}

export async function requestPermission(): Promise<PermissionState> {
  await ensureChannel();
  const current = await getPermissionsAsync();
  if (current.status === "granted" || !current.canAskAgain) return current.status as PermissionState;
  const { status } = await requestPermissionsAsync();
  return status as PermissionState;
}

/** Replaces every scheduled reminder with the given ones. */
export async function scheduleReminders(reminders: Reminder[]): Promise<void> {
  await cancelAllScheduledNotificationsAsync();
  await ensureChannel();
  for (const reminder of reminders) {
    await scheduleNotificationAsync({
      identifier: reminder.id,
      content: { title: reminder.title, body: reminder.body },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: new Date(reminder.at), channelId: CHANNEL },
    });
  }
}

export async function cancelReminders(): Promise<void> {
  await cancelAllScheduledNotificationsAsync();
}

/** A notification a few seconds from now, to check how reminders look. */
export async function sendTest(reminder: Omit<Reminder, "at">): Promise<void> {
  await ensureChannel();
  await scheduleNotificationAsync({
    content: { title: reminder.title, body: reminder.body },
    trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: CHANNEL },
  });
}
