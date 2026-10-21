import type { FirebaseApp } from "firebase/app";
import { type Auth, browserLocalPersistence, initializeAuth } from "firebase/auth";

// Web: keep the session in localStorage. The native version is firebase-auth.native.ts.
export function createAuth(app: FirebaseApp): Auth {
  return initializeAuth(app, { persistence: browserLocalPersistence });
}
