import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  type FriendKind,
  type FriendRecord,
  interact,
  type InteractionType,
  newFriend,
  statsAt,
  moodOf,
  type Stats,
  type Mood,
} from "../lib/friend";
import { friends } from "../services";
import { useAuth } from "./AuthProvider";

type Status = "loading" | "none" | "ready" | "error";

export type ActResult = { ok: true; levelUp: boolean } | { ok: false; reason: "too-tired" | "save-failed" };

type FriendContextValue = {
  status: Status;
  record: FriendRecord | null;
  /** Stats and mood as of now; refreshed every half minute. */
  stats: Stats | null;
  mood: Mood | null;
  /** The clock the stats were worked out with (ticks every half minute). */
  now: number;
  /** Bumped after every saved interaction, so the history can reload. */
  historyVersion: number;
  create(name: string, kind: FriendKind): Promise<void>;
  act(type: InteractionType): Promise<ActResult>;
  reset(): Promise<void>;
  reload(): void;
};

const FriendContext = createContext<FriendContextValue | null>(null);
const TICK_MS = 30_000;

type Loaded = { key: string; status: Exclude<Status, "loading">; record: FriendRecord | null };

export function FriendProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [historyVersion, setHistoryVersion] = useState(0);

  // Whatever was loaded belongs to one user and one attempt; anything else is still loading.
  const key = user ? `${user.uid}:${attempt}` : null;
  const current = loaded && loaded.key === key ? loaded : null;
  const status: Status = current?.status ?? "loading";
  const record = current?.record ?? null;

  useEffect(() => {
    if (!user || !key) return;
    let active = true;
    friends
      .load(user.uid)
      .then((value) => {
        if (!active) return;
        setLoaded({ key, status: value ? "ready" : "none", record: value });
        setNow(Date.now());
      })
      .catch(() => active && setLoaded({ key, status: "error", record: null }));
    return () => {
      active = false;
    };
  }, [user, key]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const create = useCallback(
    async (name: string, kind: FriendKind) => {
      if (!user) return;
      const fresh = newFriend(name, kind, Date.now());
      await friends.create(user.uid, user.email, fresh);
      setLoaded({ key: key ?? "", status: "ready", record: fresh });
      setNow(fresh.createdAt);
    },
    [user, key],
  );

  const act = useCallback(
    async (type: InteractionType): Promise<ActResult> => {
      if (!user || !record) return { ok: false, reason: "save-failed" };
      const at = Date.now();
      const result = interact(record, type, at);
      if (!result.ok) return result;
      // Show the change straight away; put it back if the save fails.
      const saved = { key: key ?? "", status: "ready" as const };
      setLoaded({ ...saved, record: result.record });
      setNow(at);
      try {
        await friends.record(user.uid, result.record, {
          type,
          at,
          friendState: result.record.friendState,
          level: result.record.level,
        });
        setHistoryVersion((value) => value + 1);
        return { ok: true, levelUp: result.levelUp };
      } catch {
        setLoaded({ ...saved, record });
        return { ok: false, reason: "save-failed" };
      }
    },
    [user, record, key],
  );

  const reset = useCallback(async () => {
    if (!user) return;
    await friends.reset(user.uid);
    setLoaded({ key: key ?? "", status: "none", record: null });
    setHistoryVersion((value) => value + 1);
  }, [user, key]);

  const value = useMemo<FriendContextValue>(() => {
    const stats = record ? statsAt(record, now) : null;
    return {
      status,
      record,
      stats,
      mood: stats ? moodOf(stats) : null,
      now,
      historyVersion,
      create,
      act,
      reset,
      reload: () => setAttempt((value) => value + 1),
    };
  }, [status, record, now, historyVersion, create, act, reset]);

  return <FriendContext.Provider value={value}>{children}</FriendContext.Provider>;
}

export function useFriend() {
  const value = useContext(FriendContext);
  if (!value) throw new Error("useFriend must be used inside FriendProvider");
  return value;
}
