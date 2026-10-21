import {
  collection,
  doc,
  type DocumentData,
  type Firestore,
  getDoc,
  getDocs,
  limit as take,
  orderBy,
  query,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

import type { FriendRecord, Interaction } from "../lib/friend";
import type { FriendStore } from "./types";

// users/{uid}                 email, friendName, character, friendState, lastInteraction,
//                             level, xp, hunger, energy, happiness, createdAt
// users/{uid}/interactions/*  type, at, friendState, level

const toRecord = (data: DocumentData): FriendRecord => ({
  friendName: data.friendName,
  character: data.character,
  friendState: data.friendState,
  level: data.level,
  xp: data.xp,
  hunger: data.hunger,
  energy: data.energy,
  happiness: data.happiness,
  lastInteraction: (data.lastInteraction as Timestamp).toMillis(),
  createdAt: (data.createdAt as Timestamp).toMillis(),
});

const toDocument = (record: FriendRecord) => ({
  friendName: record.friendName,
  character: record.character,
  friendState: record.friendState,
  level: record.level,
  xp: record.xp,
  hunger: record.hunger,
  energy: record.energy,
  happiness: record.happiness,
  lastInteraction: Timestamp.fromMillis(record.lastInteraction),
  createdAt: Timestamp.fromMillis(record.createdAt),
});

export function createFirestoreFriends(db: Firestore): FriendStore {
  const user = (uid: string) => doc(db, "users", uid);
  const interactions = (uid: string) => collection(db, "users", uid, "interactions");

  return {
    async load(uid) {
      const snapshot = await getDoc(user(uid));
      const data = snapshot.data();
      return data?.friendName ? toRecord(data) : null;
    },

    async create(uid, email, record) {
      await setDoc(user(uid), { email, ...toDocument(record) });
    },

    async record(uid, next, interaction) {
      const batch = writeBatch(db);
      batch.update(user(uid), toDocument(next));
      batch.set(doc(interactions(uid)), {
        type: interaction.type,
        at: Timestamp.fromMillis(interaction.at),
        friendState: interaction.friendState,
        level: interaction.level,
      });
      await batch.commit();
    },

    async history(uid, limit) {
      const snapshot = await getDocs(query(interactions(uid), orderBy("at", "desc"), take(limit)));
      return snapshot.docs.map((item): Interaction => {
        const data = item.data();
        return { id: item.id, type: data.type, at: (data.at as Timestamp).toMillis(), friendState: data.friendState, level: data.level };
      });
    },
  };
}
