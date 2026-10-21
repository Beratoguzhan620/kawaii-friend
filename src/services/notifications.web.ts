import type { Reminder } from "../lib/reminders";
import type { PermissionState } from "./notifications";

// Scheduled local notifications only exist in the phone apps; the web build keeps the
// setting but schedules nothing.
export type { PermissionState };

export const getPermission = async (): Promise<PermissionState> => "unsupported";
export const requestPermission = async (): Promise<PermissionState> => "unsupported";
export const scheduleReminders = async (_reminders: Reminder[]): Promise<void> => {};
export const cancelReminders = async (): Promise<void> => {};
export const sendTest = async (_reminder: Omit<Reminder, "at">): Promise<void> => {};
