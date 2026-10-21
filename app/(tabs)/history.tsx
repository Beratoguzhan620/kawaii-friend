import { Text, View } from "react-native";

import { Friend } from "../../src/components/Friend";
import { Screen } from "../../src/components/Screen";

export default function HistoryScreen() {
  return (
    <Screen title="Geçmiş" subtitle="Arkadaşınla yaptıkların burada listelenir.">
      <View className="items-center gap-3 rounded-card border border-dashed border-border p-8 dark:border-night-border">
        <Friend kind="mochi" mood="bored" size={96} />
        <Text className="text-center font-sans text-base text-muted dark:text-night-muted">Henüz bir şey yok.</Text>
      </View>
    </Screen>
  );
}
