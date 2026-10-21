/// <reference types="node" />
// Checks firestore.rules against the Firestore emulator. Run with `pnpm test:rules`,
// which starts the emulator through firebase-tools.
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const friend = (email: string) => ({
  email,
  friendName: "Mochi",
  character: "mochi",
  friendState: "happy",
  lastInteraction: Timestamp.now(),
  createdAt: Timestamp.fromMillis(1_700_000_000_000),
  level: 1,
  xp: 0,
  hunger: 20,
  energy: 80,
  happiness: 80,
});

const interaction = { type: "feed", at: Timestamp.now(), friendState: "happy", level: 1 };

const as = (uid: string) => env.authenticatedContext(uid, { email: `${uid}@example.com` }).firestore();

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-kawaii-friend",
    firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8") },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

describe("users/{uid}", () => {
  it("lets a user create, read, update and delete their own friend", async () => {
    const db = as("ada");
    await assertSucceeds(setDoc(doc(db, "users/ada"), friend("ada@example.com")));
    await assertSucceeds(getDoc(doc(db, "users/ada")));
    await assertSucceeds(updateDoc(doc(db, "users/ada"), { hunger: 0, xp: 10, friendState: "happy" }));
    await assertSucceeds(deleteDoc(doc(db, "users/ada")));
  });

  it("keeps other users and signed-out visitors out", async () => {
    await assertSucceeds(setDoc(doc(as("ada"), "users/ada"), friend("ada@example.com")));
    await assertFails(getDoc(doc(as("eve"), "users/ada")));
    await assertFails(updateDoc(doc(as("eve"), "users/ada"), { hunger: 0 }));
    await assertFails(deleteDoc(doc(as("eve"), "users/ada")));
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "users/ada")));
  });

  it("rejects a friend with the wrong shape", async () => {
    const db = as("ada");
    await assertFails(setDoc(doc(db, "users/ada"), { ...friend("ada@example.com"), hunger: 120 }));
    await assertFails(setDoc(doc(db, "users/ada"), { ...friend("ada@example.com"), character: "dragon" }));
    await assertFails(setDoc(doc(db, "users/ada"), { ...friend("ada@example.com"), friendName: "" }));
    await assertFails(setDoc(doc(db, "users/ada"), { ...friend("ada@example.com"), level: 0 }));
    await assertFails(setDoc(doc(db, "users/ada"), { ...friend("ada@example.com"), admin: true }));
    await assertFails(setDoc(doc(db, "users/ada"), friend("someone-else@example.com")));
  });

  it("does not let the email or creation date change", async () => {
    const db = as("ada");
    await assertSucceeds(setDoc(doc(db, "users/ada"), friend("ada@example.com")));
    await assertFails(updateDoc(doc(db, "users/ada"), { email: "new@example.com" }));
    await assertFails(updateDoc(doc(db, "users/ada"), { createdAt: Timestamp.now() }));
  });
});

describe("users/{uid}/interactions", () => {
  it("lets a user add and read their own history", async () => {
    const db = as("ada");
    await assertSucceeds(addDoc(collection(db, "users/ada/interactions"), interaction));
    await assertSucceeds(getDoc(doc(db, "users/ada/interactions/x")));
  });

  it("keeps history private, valid and append-only", async () => {
    const db = as("ada");
    await assertFails(addDoc(collection(as("eve"), "users/ada/interactions"), interaction));
    await assertFails(addDoc(collection(db, "users/ada/interactions"), { ...interaction, type: "dance" }));
    await assertFails(addDoc(collection(db, "users/ada/interactions"), { ...interaction, extra: 1 }));
    await assertSucceeds(setDoc(doc(db, "users/ada/interactions/one"), interaction));
    await assertFails(updateDoc(doc(db, "users/ada/interactions/one"), { type: "play" }));
    await assertSucceeds(deleteDoc(doc(db, "users/ada/interactions/one")));
  });
});
