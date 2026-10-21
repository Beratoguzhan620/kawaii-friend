// Which backend the app talks to, decided once from the EXPO_PUBLIC_* variables in .env.
//
// - firebase: a real Firebase project (all config values set)
// - emulator: the local Firebase emulators (EXPO_PUBLIC_FIREBASE_EMULATOR_HOST set), used in CI
// - demo:     no Firebase at all; accounts and data stay on this device

export type BackendMode = "firebase" | "emulator" | "demo";

export type FirebaseSettings = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

export type ResolvedConfig =
  | { mode: "demo" }
  | { mode: "firebase"; firebase: FirebaseSettings }
  | { mode: "emulator"; firebase: FirebaseSettings; emulatorHost: string };

type Env = Record<string, string | undefined>;

export function resolveConfig(env: Env): ResolvedConfig {
  const emulatorHost = env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST?.trim();
  if (emulatorHost) {
    // Emulators accept any key; a "demo-" project id keeps them fully offline.
    const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "demo-kawaii-friend";
    return {
      mode: "emulator",
      emulatorHost,
      firebase: { apiKey: "emulator", authDomain: `${projectId}.firebaseapp.com`, projectId, appId: "emulator" },
    };
  }

  const firebase = {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? "",
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "",
    storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
    messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined,
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? "",
  };
  if (firebase.apiKey && firebase.authDomain && firebase.projectId && firebase.appId) {
    return { mode: "firebase", firebase };
  }
  return { mode: "demo" };
}

// Expo only inlines EXPO_PUBLIC_* variables that are read by their full name.
export const config = resolveConfig({
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST,
});
