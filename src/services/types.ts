export type AuthUser = {
  uid: string;
  email: string;
};

/** Errors the screens know how to explain; anything else shows a generic message. */
export type AuthErrorCode =
  | "auth/invalid-email"
  | "auth/email-already-in-use"
  | "auth/weak-password"
  | "auth/invalid-credential"
  | "auth/too-many-requests"
  | "auth/network-request-failed";

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode | string) {
    super(code);
    this.name = "AuthError";
  }
}

export interface AuthService {
  readonly mode: "firebase" | "emulator" | "demo";
  /** Calls back with the signed-in user (or null) now and on every change. Returns an unsubscribe function. */
  onChange(listener: (user: AuthUser | null) => void): () => void;
  signUp(email: string, password: string): Promise<AuthUser>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
}
