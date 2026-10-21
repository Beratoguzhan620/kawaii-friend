import { describe, expect, it } from "vitest";

import { newFriend } from "../src/lib/friend";
import { planReminders, testReminder } from "../src/lib/reminders";

const HOUR = 3_600_000;
const T0 = Date.UTC(2026, 9, 21, 9, 0);

describe("planReminders", () => {
  it("plans a hungry and a tired reminder, soonest first", () => {
    const reminders = planReminders(newFriend("Mochi", "mochi", T0), T0);
    expect(reminders.map((r) => [r.id, r.at])).toEqual([
      ["hungry", T0 + (50 / 6) * HOUR],
      ["tired", T0 + (55 / 4) * HOUR],
    ]);
    expect(reminders[0].title).toBe("🍙 Mochi acıktı!");
    expect(reminders[0].body).toContain("Mochi'nin karnı");
  });

  it("skips needs that are already past their threshold or about to be", () => {
    const hungry = { ...newFriend("Tofu", "tofu", T0), hunger: 90 };
    expect(planReminders(hungry, T0).map((r) => r.id)).toEqual(["tired"]);
    const almost = { ...newFriend("Tofu", "tofu", T0), hunger: 69.95 };
    expect(planReminders(almost, T0).map((r) => r.id)).toEqual(["tired"]);
  });

  it("plans from the decayed stats, not the stored ones", () => {
    const record = newFriend("Bulut", "bulut", T0);
    const [hungry] = planReminders(record, T0 + 4 * HOUR);
    expect(hungry.at).toBe(T0 + (50 / 6) * HOUR);
  });
});

describe("testReminder", () => {
  it("names the friend", () => {
    expect(testReminder(newFriend("Mochi", "mochi", T0)).title).toContain("Mochi");
  });
});
