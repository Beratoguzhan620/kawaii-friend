import { describe, expect, it, vi } from "vitest";

import { DEFAULT_PREFERENCES, loadPreferences, savePreferences } from "../src/lib/preferences";
import { memoryStore } from "../src/services/storage";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: {} }));

describe("preferences", () => {
  it("defaults to the system theme with reminders on", async () => {
    expect(await loadPreferences(memoryStore())).toEqual(DEFAULT_PREFERENCES);
  });

  it("round-trips saved values", async () => {
    const store = memoryStore();
    await savePreferences({ theme: "dark", reminders: false }, store);
    expect(await loadPreferences(store)).toEqual({ theme: "dark", reminders: false });
  });

  it("ignores broken or unknown values", async () => {
    const store = memoryStore();
    await store.setItem("kawaii.preferences", "{not json");
    expect(await loadPreferences(store)).toEqual(DEFAULT_PREFERENCES);
    await store.setItem("kawaii.preferences", JSON.stringify({ theme: "purple", reminders: "yes" }));
    expect(await loadPreferences(store)).toEqual(DEFAULT_PREFERENCES);
  });
});
