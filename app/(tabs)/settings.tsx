import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../src/components/Button";
import { Screen } from "../../src/components/Screen";
import { useAuth } from "../../src/context/AuthProvider";
import { auth } from "../../src/services";

const MODE_LABEL = { firebase: "Firebase", emulator: "Firebase emülatörü", demo: "Demo (bu cihaz)" } as const;

export default function SettingsScreen() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await auth.signOut();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Ayarlar">
      <View className="gap-3 rounded-card border border-border bg-surface p-5 dark:border-night-border dark:bg-night-surface">
        <Text className="font-semibold text-xs text-muted dark:text-night-muted">HESAP</Text>
        <Row label="E-posta" value={user?.email ?? ""} testID="account-email" />
        <Row label="Veriler" value={MODE_LABEL[auth.mode]} />
        <Button label="Çıkış yap" variant="secondary" onPress={signOut} loading={busy} />
      </View>
    </Screen>
  );
}

function Row({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="font-sans text-sm text-muted dark:text-night-muted">{label}</Text>
      <Text className="shrink font-medium text-sm text-ink dark:text-night-ink" numberOfLines={1} testID={testID}>
        {value}
      </Text>
    </View>
  );
}
