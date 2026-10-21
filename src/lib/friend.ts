import type { FriendKind, Mood } from "../components/Friend";

export type { FriendKind, Mood };
export type InteractionType = "feed" | "play" | "rest";

/** All three run from 0 to 100. Hunger rises over time; energy and happiness fall. */
export type Stats = { hunger: number; energy: number; happiness: number };

/** What is stored for each user (users/{uid} in Firestore). Times are epoch milliseconds. */
export type FriendRecord = Stats & {
  friendName: string;
  character: FriendKind;
  friendState: Mood;
  level: number;
  xp: number;
  lastInteraction: number;
  createdAt: number;
};

export type Interaction = {
  id: string;
  type: InteractionType;
  at: number;
  friendState: Mood;
  level: number;
};

export const CHARACTERS: { kind: FriendKind; name: string; blurb: string }[] = [
  { kind: "mochi", name: "Mochi", blurb: "Yumuşacık bir pirinç keki." },
  { kind: "tofu", name: "Tofu", blurb: "Sakin ve kare bir tofu." },
  { kind: "bulut", name: "Bulut", blurb: "Hep biraz havada bir bulut." },
];

export const NAME_MAX = 20;
const HOUR = 60 * 60 * 1000;

/** Change per hour since the last interaction. */
export const DECAY = { hunger: 6, energy: -4, happiness: -5 } as const;

export const THRESHOLDS = { hungry: 70, tired: 25, bored: 35 } as const;

export const XP_PER_INTERACTION = 10;
export const XP_PER_LEVEL = 100;

export const EFFECTS: Record<InteractionType, Partial<Stats>> = {
  feed: { hunger: -35, happiness: 5, energy: 5 },
  play: { happiness: 25, energy: -15, hunger: 10 },
  rest: { energy: 45, hunger: 5 },
};

/** Playing needs at least this much energy. */
export const MIN_ENERGY_TO_PLAY = 15;

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const round = (value: number) => Math.round(value * 10) / 10;

export function newFriend(friendName: string, character: FriendKind, now: number): FriendRecord {
  const stats = { hunger: 20, energy: 80, happiness: 80 };
  return { ...stats, friendName: friendName.trim(), character, friendState: moodOf(stats), level: 1, xp: 0, lastInteraction: now, createdAt: now };
}

/** The stats right now: the stored values moved along by the time since the last interaction. */
export function statsAt(record: FriendRecord, now: number): Stats {
  const hours = Math.max(0, now - record.lastInteraction) / HOUR;
  return {
    hunger: round(clamp(record.hunger + DECAY.hunger * hours)),
    energy: round(clamp(record.energy + DECAY.energy * hours)),
    happiness: round(clamp(record.happiness + DECAY.happiness * hours)),
  };
}

/** The most pressing need wins: hunger, then tiredness, then boredom. */
export function moodOf(stats: Stats): Mood {
  if (stats.hunger >= THRESHOLDS.hungry) return "hungry";
  if (stats.energy <= THRESHOLDS.tired) return "tired";
  if (stats.happiness <= THRESHOLDS.bored) return "bored";
  return "happy";
}

export const levelFor = (xp: number) => 1 + Math.floor(xp / XP_PER_LEVEL);

export type InteractResult =
  | { ok: true; record: FriendRecord; levelUp: boolean }
  | { ok: false; reason: "too-tired" };

export function canInteract(type: InteractionType, stats: Stats): boolean {
  return type !== "play" || stats.energy >= MIN_ENERGY_TO_PLAY;
}

export function interact(record: FriendRecord, type: InteractionType, now: number): InteractResult {
  const current = statsAt(record, now);
  if (!canInteract(type, current)) return { ok: false, reason: "too-tired" };
  const effect = EFFECTS[type];
  const stats = {
    hunger: round(clamp(current.hunger + (effect.hunger ?? 0))),
    energy: round(clamp(current.energy + (effect.energy ?? 0))),
    happiness: round(clamp(current.happiness + (effect.happiness ?? 0))),
  };
  const xp = record.xp + XP_PER_INTERACTION;
  const level = levelFor(xp);
  return {
    ok: true,
    levelUp: level > record.level,
    record: { ...record, ...stats, xp, level, friendState: moodOf(stats), lastInteraction: now },
  };
}

/** When each need will next cross its threshold, or null if it already has (or never will). */
export function nextAlerts(record: FriendRecord, now: number): { hungryAt: number | null; tiredAt: number | null } {
  const stats = statsAt(record, now);
  const hoursUntil = (from: number, to: number, rate: number) => (to - from) / rate;
  const hungryAt = stats.hunger < THRESHOLDS.hungry ? now + hoursUntil(stats.hunger, THRESHOLDS.hungry, DECAY.hunger) * HOUR : null;
  const tiredAt = stats.energy > THRESHOLDS.tired ? now + hoursUntil(stats.energy, THRESHOLDS.tired, DECAY.energy) * HOUR : null;
  return { hungryAt: hungryAt && Math.round(hungryAt), tiredAt: tiredAt && Math.round(tiredAt) };
}

export function validateFriendName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Arkadaşına bir ad ver.";
  if (trimmed.length > NAME_MAX) return `Ad en fazla ${NAME_MAX} karakter olabilir.`;
  return null;
}

/** Turkish genitive with an apostrophe, following vowel harmony: Mochi'nin, Tofu'nun, Bulut'un. */
export function genitive(name: string): string {
  const lower = name.toLocaleLowerCase("tr-TR");
  const vowels = lower.match(/[aıoueiöü]/g);
  const last = vowels?.[vowels.length - 1] ?? "e";
  const vowel = "aı".includes(last) ? "ı" : "ei".includes(last) ? "i" : "ou".includes(last) ? "u" : "ü";
  const endsWithVowel = /[aıoueiöü]$/.test(lower);
  return `${name}'${endsWithVowel ? "n" : ""}${vowel}n`;
}

export const MOOD_TEXT: Record<Mood, { label: string; line: (name: string) => string }> = {
  happy: { label: "Mutlu", line: (name) => `${name} keyifli, seninle vakit geçirmeye bayılıyor.` },
  hungry: { label: "Aç", line: (name) => `${genitive(name)} karnı zil çalıyor.` },
  tired: { label: "Yorgun", line: (name) => `${name} gözlerini zor açık tutuyor.` },
  bored: { label: "Sıkılmış", line: (name) => `${name} biraz oyun istiyor.` },
};

export const INTERACTION_TEXT: Record<InteractionType, { label: string; done: (name: string) => string }> = {
  feed: { label: "Besle", done: (name) => `${name} afiyetle yedi.` },
  play: { label: "Oyna", done: (name) => `${name} oyuna doyamadı.` },
  rest: { label: "Dinlendir", done: (name) => `${name} güzel bir şekerleme yaptı.` },
};

/** "az önce", "5 dk önce", "3 sa önce", "2 gün önce". */
export function timeAgo(at: number, now: number): string {
  const minutes = Math.floor(Math.max(0, now - at) / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}
