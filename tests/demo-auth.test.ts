/// <reference types="node" />
import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { createDemoAuth } from "../src/services/demo-auth";
import { memoryStore } from "../src/services/storage";
import type { AuthUser } from "../src/services/types";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: {} }));

const crypto = { hash: async (text: string) => createHash("sha256").update(text).digest("hex"), uuid: randomUUID };

const code = (promise: Promise<unknown>) => promise.then(() => "ok", (error: { code: string }) => error.code);

describe("demo auth", () => {
  it("registers, signs out and signs back in", async () => {
    const auth = createDemoAuth(memoryStore(), crypto);
    const user = await auth.signUp(" Ada@Example.com ", "secret1");
    expect(user.email).toBe("ada@example.com");
    await auth.signOut();
    expect(await auth.signIn("ada@example.com", "secret1")).toEqual(user);
  });

  it("uses Firebase's error codes", async () => {
    const auth = createDemoAuth(memoryStore(), crypto);
    expect(await code(auth.signUp("not-an-email", "secret1"))).toBe("auth/invalid-email");
    expect(await code(auth.signUp("ada@example.com", "123"))).toBe("auth/weak-password");
    await auth.signUp("ada@example.com", "secret1");
    expect(await code(auth.signUp("ADA@example.com", "secret1"))).toBe("auth/email-already-in-use");
    expect(await code(auth.signIn("ada@example.com", "wrong-pass"))).toBe("auth/invalid-credential");
    expect(await code(auth.signIn("nobody@example.com", "secret1"))).toBe("auth/invalid-credential");
  });

  it("never stores the password itself", async () => {
    const store = memoryStore();
    await createDemoAuth(store, crypto).signUp("ada@example.com", "secret1");
    expect([...store.data.values()].join()).not.toContain("secret1");
  });

  it("restores the session and notifies listeners", async () => {
    const store = memoryStore();
    const user = await createDemoAuth(store, crypto).signUp("ada@example.com", "secret1");

    const auth = createDemoAuth(store, crypto);
    const seen: (AuthUser | null)[] = [];
    auth.onChange((value) => seen.push(value));
    await vi.waitFor(() => expect(seen).toEqual([user]));
    await auth.signOut();
    expect(seen).toEqual([user, null]);
  });

  it("starts signed out with no session", async () => {
    const auth = createDemoAuth(memoryStore(), crypto);
    const seen: (AuthUser | null)[] = [];
    auth.onChange((value) => seen.push(value));
    await vi.waitFor(() => expect(seen).toEqual([null]));
  });
});
