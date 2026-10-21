import { useRouter } from "expo-router";
import { Cookie, Gamepad2, Moon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../src/components/Button";
import { Friend } from "../../src/components/Friend";
import { Screen } from "../../src/components/Screen";
import { useAuth } from "../../src/context/AuthProvider";
import { useFriend } from "../../src/context/FriendProvider";
import { type Interaction, type InteractionType, MOOD_TEXT, timeAgo } from "../../src/lib/friend";
import { useTheme } from "../../src/lib/theme";
import { friends } from "../../src/services";

const LIMIT = 50;

const ROW: Record<InteractionType, { text: string; icon: typeof Cookie; tone: string }> = {
  feed: { text: "Besledin", icon: Cookie, tone: "bg-peach dark:bg-night-peach" },
  play: { text: "Oyun oynadınız", icon: Gamepad2, tone: "bg-accent-soft dark:bg-night-accent-soft" },
  rest: { text: "Dinlendirdin", icon: Moon, tone: "bg-sky dark:bg-night-sky" },
};

type Loaded = { key: string; items: Interaction[] | null; failed: boolean };

export default function HistoryScreen() {
  const { user } = useAuth();
  const { record, historyVersion, now } = useFriend();
  const { colors } = useTheme();
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${user?.uid}:${historyVersion}:${attempt}`;

  useEffect(() => {
    if (!user) return;
    let active = true;
    friends
      .history(user.uid, LIMIT)
      .then((items) => active && setLoaded({ key, items, failed: false }))
      .catch(() => active && setLoaded({ key, items: null, failed: true }));
    return () => {
      active = false;
    };
  }, [user, key]);

  // Keep showing the previous list while a newer one loads.
  const items = loaded?.items ?? null;
  const failed = loaded?.key === key && loaded.failed;

  return (
    <Screen title="Geçmiş" subtitle={record ? `${record.friendName} ile yaptıkların` : undefined}>
      {failed ? (
        <View className="items-center gap-3 rounded-card border border-border bg-surface p-6 dark:border-night-border dark:bg-night-surface">
          <Text className="text-center font-sans text-base text-ink dark:text-night-ink">Geçmiş yüklenemedi.</Text>
          <Button label="Tekrar dene" variant="secondary" onPress={() => setAttempt((value) => value + 1)} />
        </View>
      ) : items === null ? (
        <View className="gap-3" accessibilityLabel="Yükleniyor">
          {[0, 1, 2].map((index) => (
            <View key={index} className="h-16 rounded-card bg-surface-2 dark:bg-night-surface-2" />
          ))}
        </View>
      ) : items.length === 0 ? (
        <View className="items-center gap-3 rounded-card border border-dashed border-border p-8 dark:border-night-border">
          {record && <Friend kind={record.character} mood="bored" size={96} />}
          <Text className="text-center font-sans text-base text-muted dark:text-night-muted">
            Henüz bir şey yapmadınız. Onu besleyerek başlayabilirsin.
          </Text>
          <Button label="Arkadaşıma git" variant="secondary" onPress={() => router.navigate("/")} />
        </View>
      ) : (
        <View
          role="list"
          className="overflow-hidden rounded-card border border-border bg-surface dark:border-night-border dark:bg-night-surface"
        >
          {items.map((item, index) => {
            const row = ROW[item.type];
            const Icon = row.icon;
            return (
              <View
                key={item.id}
                role="listitem"
                testID="history-item"
                className={`flex-row items-center gap-3 px-4 py-3 ${index > 0 ? "border-t border-border dark:border-night-border" : ""}`}
              >
                <View className={`h-10 w-10 items-center justify-center rounded-full ${row.tone}`}>
                  <Icon size={20} color={colors.ink} />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-base text-ink dark:text-night-ink">{row.text}</Text>
                  <Text className="font-sans text-xs text-muted dark:text-night-muted">
                    Sonra: {MOOD_TEXT[item.friendState].label.toLocaleLowerCase("tr-TR")} · Seviye {item.level}
                  </Text>
                </View>
                <Text className="font-sans text-xs text-muted dark:text-night-muted">{timeAgo(item.at, now)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
