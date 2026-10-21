import type { Interaction } from "../lib/friend";
import type { KeyValueStore } from "./storage";
import type { FriendStore } from "./types";

const friendKey = (uid: string) => `kawaii.demo.friend.${uid}`;
const historyKey = (uid: string) => `kawaii.demo.history.${uid}`;
const HISTORY_CAP = 100;

/** Same shape as the Firestore store, kept in AsyncStorage (localStorage on the web). */
export function createDemoFriends(store: KeyValueStore, uuid: () => string): FriendStore {
  const readHistory = async (uid: string): Promise<Interaction[]> => JSON.parse((await store.getItem(historyKey(uid))) ?? "[]");

  return {
    async load(uid) {
      const raw = await store.getItem(friendKey(uid));
      return raw ? JSON.parse(raw) : null;
    },
    async create(uid, _email, record) {
      await store.setItem(friendKey(uid), JSON.stringify(record));
      await store.removeItem(historyKey(uid));
    },
    async record(uid, next, interaction) {
      const history = [{ ...interaction, id: uuid() }, ...(await readHistory(uid))].slice(0, HISTORY_CAP);
      await store.setItem(friendKey(uid), JSON.stringify(next));
      await store.setItem(historyKey(uid), JSON.stringify(history));
    },
    async history(uid, limit) {
      return (await readHistory(uid)).slice(0, limit);
    },
    async reset(uid) {
      await store.removeItem(friendKey(uid));
      await store.removeItem(historyKey(uid));
    },
  };
}
