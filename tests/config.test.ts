import { describe, expect, it } from "vitest";

import { resolveConfig } from "../src/services/config";

const full = {
  EXPO_PUBLIC_FIREBASE_API_KEY: "key",
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "kawaii.firebaseapp.com",
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: "kawaii",
  EXPO_PUBLIC_FIREBASE_APP_ID: "1:2:web:3",
};

describe("resolveConfig", () => {
  it("uses demo mode without Firebase values", () => {
    expect(resolveConfig({})).toEqual({ mode: "demo" });
  });

  it("uses demo mode when a required value is missing or blank", () => {
    expect(resolveConfig({ ...full, EXPO_PUBLIC_FIREBASE_APP_ID: "  " })).toEqual({ mode: "demo" });
  });

  it("uses Firebase when every required value is set", () => {
    const config = resolveConfig({ ...full, EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: "" });
    expect(config.mode).toBe("firebase");
    if (config.mode === "firebase") {
      expect(config.firebase.projectId).toBe("kawaii");
      expect(config.firebase.storageBucket).toBeUndefined();
    }
  });

  it("prefers the emulators and defaults to an offline demo project", () => {
    const config = resolveConfig({ ...full, EXPO_PUBLIC_FIREBASE_PROJECT_ID: "", EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: "localhost" });
    expect(config).toMatchObject({ mode: "emulator", emulatorHost: "localhost", firebase: { projectId: "demo-kawaii-friend" } });
  });
});
