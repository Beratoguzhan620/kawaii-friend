import { type ReactNode, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";

import { Button } from "../../src/components/Button";
import { ConfirmDialog } from "../../src/components/ConfirmDialog";
import { Screen } from "../../src/components/Screen";
import { useAuth } from "../../src/context/AuthProvider";
import { useFriend } from "../../src/context/FriendProvider";
import { usePreferences } from "../../src/context/PreferencesProvider";
import type { ThemePreference } from "../../src/lib/preferences";
import { testReminder } from "../../src/lib/reminders";
import { useTheme } from "../../src/lib/theme";
import { auth } from "../../src/services";
import { sendTest } from "../../src/services/notifications";

const MODE_LABEL = { firebase: "Firebase", emulator: "Firebase emülatörü", demo: "Demo (bu cihaz)" } as const;
const THEMES: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistem" },
  { value: "light", label: "Açık" },
  { value: "dark", label: "Koyu" },
];

export default function SettingsScreen() {
  const { user } = useAuth();
  const { record, reset } = useFriend();
  const { preferences, permission, setTheme, setReminders } = usePreferences();
  const { colors } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await auth.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const confirmReset = async () => {
    setResetting(true);
    setResetError(null);
    try {
      await reset();
    } catch {
      setResetError("Sıfırlanamadı. Bağlantını kontrol edip tekrar dene.");
      setResetting(false);
      setConfirming(false);
    }
  };

  const sendTestReminder = async () => {
    if (!record) return;
    await sendTest(testReminder(record));
    setTestSent(true);
  };

  const reminderNote =
    permission === "unsupported"
      ? "Hatırlatmalar telefon uygulamasında çalışır; tarayıcıda bildirim gönderilmez."
      : permission === "denied" && preferences.reminders
        ? "Bildirim izni kapalı. Telefonun ayarlarından açabilirsin."
        : record
          ? `${record.friendName} acıkınca ya da yorulunca haber verir.`
          : "Arkadaşın acıkınca ya da yorulunca haber verir.";

  return (
    <Screen title="Ayarlar">
      <Section title="BİLDİRİMLER">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 gap-0.5">
            <Text className="font-medium text-base text-ink dark:text-night-ink">Hatırlatmalar</Text>
            <Text className="font-sans text-sm text-muted dark:text-night-muted" testID="reminder-note">
              {reminderNote}
            </Text>
          </View>
          <Switch
            value={preferences.reminders}
            onValueChange={setReminders}
            accessibilityLabel="Hatırlatmalar"
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.surface}
            testID="reminders-switch"
          />
        </View>
        {__DEV__ && permission === "granted" && record && (
          <View className="gap-2">
            <Button label="Test bildirimi gönder" variant="secondary" onPress={sendTestReminder} />
            {testSent && (
              <Text role="status" className="font-sans text-sm text-muted dark:text-night-muted">
                Birkaç saniye içinde gelecek.
              </Text>
            )}
          </View>
        )}
      </Section>

      <Section title="GÖRÜNÜM">
        <View role="radiogroup" aria-label="Tema" className="flex-row gap-2 rounded bg-surface-2 p-1 dark:bg-night-surface-2">
          {THEMES.map((theme) => {
            const selected = preferences.theme === theme.value;
            return (
              <Pressable
                key={theme.value}
                role="radio"
                aria-checked={selected}
                aria-label={`Tema: ${theme.label}`}
                onPress={() => setTheme(theme.value)}
                className={`h-10 flex-1 items-center justify-center rounded ${selected ? "bg-surface dark:bg-night-surface" : ""}`}
              >
                <Text
                  className={`text-sm ${selected ? "font-semibold text-ink dark:text-night-ink" : "font-medium text-muted dark:text-night-muted"}`}
                >
                  {theme.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {record && (
        <Section title="ARKADAŞ">
          <Text className="font-sans text-sm text-muted dark:text-night-muted">
            {record.friendName} ve bütün geçmişi silinir; yeni bir arkadaşla baştan başlarsın.
          </Text>
          {resetError && (
            <Text role="alert" className="font-sans text-sm text-danger dark:text-night-danger">
              {resetError}
            </Text>
          )}
          <Button label="Arkadaşı sıfırla" variant="danger" onPress={() => setConfirming(true)} />
        </Section>
      )}

      <Section title="HESAP">
        <Row label="E-posta" value={user?.email ?? ""} testID="account-email" />
        <Row label="Veriler" value={MODE_LABEL[auth.mode]} />
        <Button label="Çıkış yap" variant="secondary" onPress={signOut} loading={signingOut} />
      </Section>

      <ConfirmDialog
        visible={confirming}
        title={`${record?.friendName ?? "Arkadaşın"} sıfırlansın mı?`}
        message="Seviyesi, durumu ve geçmişi silinir. Bu işlem geri alınamaz."
        confirmLabel="Evet, sıfırla"
        onConfirm={confirmReset}
        onCancel={() => setConfirming(false)}
        busy={resetting}
      />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-5 dark:border-night-border dark:bg-night-surface">
      <Text role="heading" aria-level={2} className="font-semibold text-xs text-muted dark:text-night-muted">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="shrink-0 font-sans text-sm text-muted dark:text-night-muted">{label}</Text>
      <Text className="shrink font-medium text-sm text-ink dark:text-night-ink" numberOfLines={1} testID={testID}>
        {value}
      </Text>
    </View>
  );
}
