import { Text, View } from "react-native";

import { Friend } from "../../src/components/Friend";
import { Screen } from "../../src/components/Screen";
import { useAuth } from "../../src/context/AuthProvider";

export default function HomeScreen() {
  const { user } = useAuth();
  return (
    <Screen title="Arkadaşım" subtitle={user?.email}>
      <View className="items-center gap-4 rounded-card border border-border bg-surface p-6 dark:border-night-border dark:bg-night-surface">
        <Friend kind="mochi" mood="happy" size={160} label="Mochi" />
        <Text className="text-center font-sans text-base text-ink dark:text-night-ink">
          Giriş yaptın. Arkadaşını bir sonraki adımda tanıyacaksın.
        </Text>
      </View>
    </Screen>
  );
}
