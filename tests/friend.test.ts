import { describe, expect, it } from "vitest";

import {
  canInteract,
  type FriendRecord,
  genitive,
  interact,
  levelFor,
  moodOf,
  newFriend,
  nextAlerts,
  statsAt,
  timeAgo,
  validateFriendName,
} from "../src/lib/friend";

const HOUR = 3_600_000;
const T0 = Date.UTC(2026, 9, 21, 9, 0);

const friend = (overrides: Partial<FriendRecord> = {}): FriendRecord => ({ ...newFriend("Mochi", "mochi", T0), ...overrides });

describe("newFriend", () => {
  it("starts happy at level 1", () => {
    const record = newFriend("  Mochi ", "mochi", T0);
    expect(record).toMatchObject({ friendName: "Mochi", character: "mochi", friendState: "happy", level: 1, xp: 0, lastInteraction: T0 });
  });
});

describe("statsAt", () => {
  it("does not change at the moment of the last interaction", () => {
    expect(statsAt(friend(), T0)).toEqual({ hunger: 20, energy: 80, happiness: 80 });
  });

  it("gets hungrier, more tired and less happy over time", () => {
    expect(statsAt(friend(), T0 + 5 * HOUR)).toEqual({ hunger: 50, energy: 60, happiness: 55 });
  });

  it("stays between 0 and 100", () => {
    expect(statsAt(friend(), T0 + 100 * HOUR)).toEqual({ hunger: 100, energy: 0, happiness: 0 });
  });

  it("ignores a clock that went backwards", () => {
    expect(statsAt(friend(), T0 - HOUR)).toEqual(statsAt(friend(), T0));
  });
});

describe("moodOf", () => {
  it("puts hunger before tiredness before boredom", () => {
    expect(moodOf({ hunger: 70, energy: 10, happiness: 10 })).toBe("hungry");
    expect(moodOf({ hunger: 69, energy: 25, happiness: 10 })).toBe("tired");
    expect(moodOf({ hunger: 69, energy: 26, happiness: 35 })).toBe("bored");
    expect(moodOf({ hunger: 69, energy: 26, happiness: 36 })).toBe("happy");
  });

  it("follows the friend through the day", () => {
    const record = friend();
    expect(moodOf(statsAt(record, T0 + 8 * HOUR))).toBe("happy");
    expect(moodOf(statsAt(record, T0 + 9 * HOUR))).toBe("hungry");
    // Fed but never played with: boredom comes next.
    expect(moodOf(statsAt(friend({ hunger: 0, happiness: 50 }), T0 + 3 * HOUR))).toBe("bored");
  });
});

describe("interact", () => {
  it("feeds from the current, decayed stats and saves the time", () => {
    const result = interact(friend(), "feed", T0 + 9 * HOUR);
    if (!result.ok) throw new Error("expected ok");
    expect(result.record).toMatchObject({ hunger: 39, energy: 49, happiness: 40, friendState: "happy", lastInteraction: T0 + 9 * HOUR, xp: 10 });
  });

  it("plays and rests", () => {
    const played = interact(friend(), "play", T0);
    expect(played.ok && played.record).toMatchObject({ happiness: 100, energy: 65, hunger: 30 });
    const rested = interact(friend({ energy: 20 }), "rest", T0);
    expect(rested.ok && rested.record).toMatchObject({ energy: 65, hunger: 25, friendState: "happy" });
  });

  it("refuses to play when too tired", () => {
    const tired = friend({ energy: 14 });
    expect(canInteract("play", statsAt(tired, T0))).toBe(false);
    expect(interact(tired, "play", T0)).toEqual({ ok: false, reason: "too-tired" });
    expect(interact(tired, "rest", T0).ok).toBe(true);
  });

  it("levels up every 100 XP", () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(99)).toBe(1);
    expect(levelFor(100)).toBe(2);
    const result = interact(friend({ xp: 90 }), "feed", T0);
    expect(result.ok && [result.record.level, result.levelUp]).toEqual([2, true]);
    const again = interact(friend({ xp: 100, level: 2 }), "feed", T0);
    expect(again.ok && again.levelUp).toBe(false);
  });
});

describe("nextAlerts", () => {
  it("predicts when the friend gets hungry and tired", () => {
    expect(nextAlerts(friend(), T0)).toEqual({ hungryAt: T0 + (50 / 6) * HOUR, tiredAt: T0 + (55 / 4) * HOUR });
  });

  it("returns null for a need that is already past its threshold", () => {
    expect(nextAlerts(friend({ hunger: 80, energy: 10 }), T0)).toEqual({ hungryAt: null, tiredAt: null });
  });
});

describe("text helpers", () => {
  it("validates the name", () => {
    expect(validateFriendName("  ")).toBe("Arkadaşına bir ad ver.");
    expect(validateFriendName("x".repeat(21))).toContain("20");
    expect(validateFriendName("Mochi")).toBeNull();
  });

  it("builds the Turkish genitive", () => {
    expect(genitive("Mochi")).toBe("Mochi'nin");
    expect(genitive("Tofu")).toBe("Tofu'nun");
    expect(genitive("Bulut")).toBe("Bulut'un");
    expect(genitive("Pamuk")).toBe("Pamuk'un");
    expect(genitive("Karamel")).toBe("Karamel'in");
    expect(genitive("Fıstık")).toBe("Fıstık'ın");
    expect(genitive("Gözde")).toBe("Gözde'nin");
    expect(genitive("Süt")).toBe("Süt'ün");
  });

  it("formats relative times", () => {
    expect(timeAgo(T0, T0 + 30_000)).toBe("az önce");
    expect(timeAgo(T0, T0 + 5 * 60_000)).toBe("5 dk önce");
    expect(timeAgo(T0, T0 + 3 * HOUR)).toBe("3 sa önce");
    expect(timeAgo(T0, T0 + 50 * HOUR)).toBe("2 gün önce");
  });
});
