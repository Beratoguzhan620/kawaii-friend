import { type FriendRecord, genitive, nextAlerts } from "./friend";

export type Reminder = { id: "hungry" | "tired"; at: number; title: string; body: string };

/** Reminders closer than this are skipped; the user is probably looking at the app. */
const MIN_LEAD_MS = 60_000;

/**
 * The local notifications to schedule for the friend as it is now: one for when it gets
 * hungry and one for when it gets tired. Emoji are part of the brief for this project.
 */
export function planReminders(record: FriendRecord, now: number): Reminder[] {
  const { hungryAt, tiredAt } = nextAlerts(record, now);
  const name = record.friendName;
  const reminders: Reminder[] = [];
  if (hungryAt !== null && hungryAt - now >= MIN_LEAD_MS) {
    reminders.push({ id: "hungry", at: hungryAt, title: `🍙 ${name} acıktı!`, body: `${genitive(name)} karnı zil çalıyor. Bir şeyler yedirmeye ne dersin?` });
  }
  if (tiredAt !== null && tiredAt - now >= MIN_LEAD_MS) {
    reminders.push({ id: "tired", at: tiredAt, title: `😴 ${name} çok yoruldu`, body: "Biraz dinlenmeye ihtiyacı var." });
  }
  return reminders.sort((a, b) => a.at - b.at);
}

export function testReminder(record: FriendRecord): Omit<Reminder, "at"> {
  return { id: "hungry", title: `💌 ${record.friendName} sana el sallıyor`, body: "Bu bir test bildirimi. Hatırlatmalar böyle görünecek." };
}
