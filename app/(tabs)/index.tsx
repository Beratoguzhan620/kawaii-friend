import { Cookie, Gamepad2, Moon } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import Animated, { BounceIn } from "react-native-reanimated";

import { ActionButton } from "../../src/components/ActionButton";
import { Friend } from "../../src/components/Friend";
import { Screen } from "../../src/components/Screen";
import { StatBar } from "../../src/components/StatBar";
import { useFriend } from "../../src/context/FriendProvider";
import {
  canInteract,
  type FriendKind,
  INTERACTION_TEXT,
  type InteractionType,
  MOOD_TEXT,
  XP_PER_INTERACTION,
  XP_PER_LEVEL,
} from "../../src/lib/friend";
import { useTheme } from "../../src/lib/theme";

const STAGE: Record<FriendKind, string> = {
  mochi: "bg-peach dark:bg-night-peach",
  tofu: "bg-mint dark:bg-night-mint",
  bulut: "bg-sky dark:bg-night-sky",
};

type Feedback = { tone: "info" | "warn"; text: string };

export default function HomeScreen() {
  const { record, stats, mood, act } = useFriend();
  const { colors } = useTheme();
  const [busy, setBusy] = useState<InteractionType | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [bounce, setBounce] = useState(0);

  if (!record || !stats || !mood) return null;
  const name = record.friendName;
  const xpInLevel = record.xp % XP_PER_LEVEL;

  const run = async (type: InteractionType) => {
    setBusy(type);
    const result = await act(type);
    setBusy(null);
    if (result.ok) {
      setBounce((value) => value + 1);
      const levelText = result.levelUp ? ` Seviye ${record.level + 1} oldu!` : "";
      setFeedback({ tone: "info", text: `${INTERACTION_TEXT[type].done(name)} +${XP_PER_INTERACTION} XP.${levelText}` });
    } else if (result.reason === "too-tired") {
      setFeedback({ tone: "warn", text: `${name} oynamak için çok yorgun. Önce biraz dinlensin.` });
    } else {
      setFeedback({ tone: "warn", text: "Kaydedilemedi. Bağlantını kontrol edip tekrar dene." });
    }
  };

  const actions: { type: InteractionType; icon: typeof Cookie; tone: string }[] = [
    { type: "feed", icon: Cookie, tone: "bg-peach dark:bg-night-peach" },
    { type: "play", icon: Gamepad2, tone: "bg-accent-soft dark:bg-night-accent-soft" },
    { type: "rest", icon: Moon, tone: "bg-sky dark:bg-night-sky" },
  ];

  return (
    <Screen title={name} subtitle={MOOD_TEXT[mood].line(name)}>
      <View className={`items-center rounded-card py-6 ${STAGE[record.character]}`}>
        <View className="absolute right-4 top-4 flex-row gap-2">
          <Text className="rounded-full bg-surface/80 px-3 py-1 font-semibold text-xs text-ink dark:bg-night-surface/80 dark:text-night-ink" testID="mood">
            {MOOD_TEXT[mood].label}
          </Text>
          <Text className="rounded-full bg-surface/80 px-3 py-1 font-semibold text-xs text-ink dark:bg-night-surface/80 dark:text-night-ink" testID="level">
            Seviye {record.level}
          </Text>
        </View>
        <Animated.View key={bounce} entering={bounce > 0 ? BounceIn.duration(600) : undefined}>
          <Friend kind={record.character} mood={mood} size={200} label={`${name}, ${MOOD_TEXT[mood].label.toLocaleLowerCase("tr-TR")}`} />
        </Animated.View>
      </View>

      <View className="gap-4 rounded-card border border-border bg-surface p-5 dark:border-night-border dark:bg-night-surface">
        <StatBar label="Tokluk" value={100 - stats.hunger} color={colors.food} track={colors.track} testID="stat-food" />
        <StatBar label="Enerji" value={stats.energy} color={colors.energy} track={colors.track} testID="stat-energy" />
        <StatBar label="Mutluluk" value={stats.happiness} color={colors.joy} track={colors.track} testID="stat-joy" />
        <Text className="font-sans text-xs text-muted dark:text-night-muted" testID="xp">
          {xpInLevel}/{XP_PER_LEVEL} XP · bir sonraki seviyeye {XP_PER_LEVEL - xpInLevel} XP
        </Text>
      </View>

      <View className="flex-row gap-3">
        {actions.map(({ type, icon, tone }) => (
          <ActionButton
            key={type}
            label={INTERACTION_TEXT[type].label}
            icon={icon}
            iconColor={colors.ink}
            tone={tone}
            onPress={() => run(type)}
            disabled={busy !== null || !canInteract(type, stats)}
            testID={`action-${type}`}
          />
        ))}
      </View>
      {!canInteract("play", stats) && (
        <Text className="text-center font-sans text-sm text-muted dark:text-night-muted">
          {name} oynamak için çok yorgun. Önce biraz dinlensin.
        </Text>
      )}
      {feedback && (
        <Text
          role="status"
          aria-live="polite"
          className={`text-center font-medium text-sm ${
            feedback.tone === "warn" ? "text-danger dark:text-night-danger" : "text-ink dark:text-night-ink"
          }`}
          testID="feedback"
        >
          {feedback.text}
        </Text>
      )}
    </Screen>
  );
}
