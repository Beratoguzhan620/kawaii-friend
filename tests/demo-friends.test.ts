import { describe, expect, it, vi } from "vitest";

import { interact, newFriend } from "../src/lib/friend";
import { createDemoFriends } from "../src/services/demo-friends";
import { memoryStore } from "../src/services/storage";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: {} }));

const T0 = Date.UTC(2026, 9, 21, 9, 0);
let id = 0;
const uuid = () => `id-${++id}`;

describe("demo friend store", () => {
  it("has nothing for a new user", async () => {
    const store = createDemoFriends(memoryStore(), uuid);
    expect(await store.load("u1")).toBeNull();
    expect(await store.history("u1", 10)).toEqual([]);
  });

  it("saves the friend and keeps the newest interactions first", async () => {
    const store = createDemoFriends(memoryStore(), uuid);
    const friend = newFriend("Mochi", "mochi", T0);
    await store.create("u1", "ada@example.com", friend);
    expect(await store.load("u1")).toEqual(friend);

    let record = friend;
    for (const [type, at] of [["feed", T0 + 1000], ["play", T0 + 2000]] as const) {
      const result = interact(record, type, at);
      if (!result.ok) throw new Error("expected ok");
      record = result.record;
      await store.record("u1", record, { type, at, friendState: record.friendState, level: record.level });
    }

    expect(await store.load("u1")).toEqual(record);
    const history = await store.history("u1", 10);
    expect(history.map((item) => item.type)).toEqual(["play", "feed"]);
    expect(await store.history("u1", 1)).toHaveLength(1);
  });

  it("keeps users apart and starts a new friend with an empty history", async () => {
    const kv = memoryStore();
    const store = createDemoFriends(kv, uuid);
    const friend = newFriend("Tofu", "tofu", T0);
    await store.create("u1", "a@example.com", friend);
    await store.record("u1", friend, { type: "feed", at: T0, friendState: "happy", level: 1 });
    expect(await store.load("u2")).toBeNull();
    await store.create("u1", "a@example.com", newFriend("Bulut", "bulut", T0));
    expect(await store.history("u1", 10)).toEqual([]);
  });
});
