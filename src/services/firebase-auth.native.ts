import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FirebaseApp } from "firebase/app";
import { type Auth, getReactNativePersistence, initializeAuth } from "firebase/auth";

// iOS and Android: keep the session in AsyncStorage so it survives app restarts.
export function createAuth(app: FirebaseApp): Auth {
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}
