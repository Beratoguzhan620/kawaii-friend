import * as Crypto from "expo-crypto";

import { config } from "./config";
import { createDemoAuth } from "./demo-auth";
import { connectFirebase, createFirebaseAuth, type FirebaseServices } from "./firebase";
import { deviceStore } from "./storage";
import type { AuthService } from "./types";

const firebase: FirebaseServices | null = config.mode === "demo" ? null : connectFirebase(config);

export const auth: AuthService = firebase
  ? createFirebaseAuth(firebase, config.mode === "emulator" ? "emulator" : "firebase")
  : createDemoAuth(deviceStore, {
      hash: (text) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text),
      uuid: () => Crypto.randomUUID(),
    });

export { config };
