import { type FirebaseApp, initializeApp } from "firebase/app";
import {
  type Auth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { connectFirestoreEmulator, type Firestore, getFirestore } from "firebase/firestore";

import type { ResolvedConfig } from "./config";
import { createAuth } from "./firebase-auth";
import { AuthError, type AuthService, type AuthUser } from "./types";

export type FirebaseServices = { app: FirebaseApp; auth: Auth; db: Firestore };

export function connectFirebase(config: Exclude<ResolvedConfig, { mode: "demo" }>): FirebaseServices {
  const app = initializeApp(config.firebase);
  const auth = createAuth(app);
  const db = getFirestore(app);
  if (config.mode === "emulator") {
    connectAuthEmulator(auth, `http://${config.emulatorHost}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, config.emulatorHost, 8080);
  }
  return { app, auth, db };
}

const toUser = (user: User): AuthUser => ({ uid: user.uid, email: user.email ?? "" });

/** Firebase errors carry a `code` such as "auth/weak-password"; keep only that. */
const wrap = async <T>(action: () => Promise<T>): Promise<T> => {
  try {
    return await action();
  } catch (error) {
    const code = (error as { code?: unknown }).code;
    throw new AuthError(typeof code === "string" ? code : "unknown");
  }
};

export function createFirebaseAuth(services: FirebaseServices, mode: "firebase" | "emulator"): AuthService {
  const { auth } = services;
  return {
    mode,
    onChange: (listener) => onAuthStateChanged(auth, (user) => listener(user ? toUser(user) : null)),
    signUp: (email, password) =>
      wrap(async () => toUser((await createUserWithEmailAndPassword(auth, email.trim(), password)).user)),
    signIn: (email, password) =>
      wrap(async () => toUser((await signInWithEmailAndPassword(auth, email.trim(), password)).user)),
    signOut: () => wrap(() => signOut(auth)),
  };
}
