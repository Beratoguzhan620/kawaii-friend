import * as Crypto from "expo-crypto";

import { config } from "./config";
import { createDemoAuth } from "./demo-auth";
import { createDemoFriends } from "./demo-friends";
import { connectFirebase, createFirebaseAuth } from "./firebase";
import { createFirestoreFriends } from "./firestore-friends";
import { deviceStore } from "./storage";
import type { AuthService, FriendStore } from "./types";

function createServices(): { auth: AuthService; friends: FriendStore } {
  if (config.mode === "demo") {
    return {
      auth: createDemoAuth(deviceStore, {
        hash: (text) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text),
        uuid: () => Crypto.randomUUID(),
      }),
      friends: createDemoFriends(deviceStore, () => Crypto.randomUUID()),
    };
  }
  const firebase = connectFirebase(config);
  return { auth: createFirebaseAuth(firebase, config.mode), friends: createFirestoreFriends(firebase.db) };
}

export const { auth, friends } = createServices();
export { config };
