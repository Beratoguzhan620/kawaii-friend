import type { Persistence } from "firebase/auth";

// Metro resolves firebase/auth to its React Native build, which exports this; the
// default type definitions (for the web build) do not declare it.
declare module "firebase/auth" {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
