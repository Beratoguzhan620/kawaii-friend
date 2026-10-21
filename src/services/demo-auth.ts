import type { KeyValueStore } from "./storage";
import { AuthError, type AuthService, type AuthUser } from "./types";

type StoredAccount = { uid: string; email: string; passwordHash: string };

export type DemoCrypto = {
  hash(text: string): Promise<string>;
  uuid(): string;
};

const ACCOUNTS = "kawaii.demo.accounts";
const SESSION = "kawaii.demo.session";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Auth without Firebase: accounts are kept on this device only, and passwords are stored
 * as salted SHA-256 hashes. It follows Firebase's rules and error codes so the screens
 * behave the same in both modes.
 */
export function createDemoAuth(store: KeyValueStore, crypto: DemoCrypto): AuthService {
  const listeners = new Set<(user: AuthUser | null) => void>();
  let current: AuthUser | null | undefined;

  const accounts = async (): Promise<Record<string, StoredAccount>> =>
    JSON.parse((await store.getItem(ACCOUNTS)) ?? "{}");

  const publish = (user: AuthUser | null) => {
    current = user;
    for (const listener of listeners) listener(user);
  };

  const restore = async () => {
    const uid = await store.getItem(SESSION);
    const account = uid ? Object.values(await accounts()).find((a) => a.uid === uid) : undefined;
    return account ? { uid: account.uid, email: account.email } : null;
  };

  const hash = (uid: string, password: string) => crypto.hash(`${uid}:${password}`);

  return {
    mode: "demo",

    onChange(listener) {
      listeners.add(listener);
      if (current !== undefined) listener(current);
      else restore().then((user) => current === undefined && publish(user));
      return () => listeners.delete(listener);
    },

    async signUp(rawEmail, password) {
      const email = rawEmail.trim().toLowerCase();
      if (!EMAIL.test(email)) throw new AuthError("auth/invalid-email");
      if (password.length < 6) throw new AuthError("auth/weak-password");
      const all = await accounts();
      if (all[email]) throw new AuthError("auth/email-already-in-use");
      const uid = crypto.uuid();
      all[email] = { uid, email, passwordHash: await hash(uid, password) };
      await store.setItem(ACCOUNTS, JSON.stringify(all));
      await store.setItem(SESSION, uid);
      const user = { uid, email };
      publish(user);
      return user;
    },

    async signIn(rawEmail, password) {
      const email = rawEmail.trim().toLowerCase();
      if (!EMAIL.test(email)) throw new AuthError("auth/invalid-email");
      const account = (await accounts())[email];
      if (!account || account.passwordHash !== (await hash(account.uid, password))) {
        throw new AuthError("auth/invalid-credential");
      }
      await store.setItem(SESSION, account.uid);
      const user = { uid: account.uid, email };
      publish(user);
      return user;
    },

    async signOut() {
      await store.removeItem(SESSION);
      publish(null);
    },
  };
}
