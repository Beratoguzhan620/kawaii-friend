import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DemoBanner } from "./DemoBanner";
import { Friend, type Mood } from "./Friend";

type Props = { title: string; subtitle: string; mood: Mood; children: ReactNode };

/** Shared frame for the login and register screens. */
export function AuthScreen({ title, subtitle, mood, children }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-night-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerClassName="grow justify-center px-6 py-8" keyboardShouldPersistTaps="handled">
          <View className="w-full max-w-[440px] gap-6 self-center">
            <View className="items-center gap-3">
              <View className="h-36 w-36 items-center justify-center rounded-full bg-accent-soft dark:bg-night-accent-soft">
                <Friend kind="mochi" mood={mood} size={120} label="Mochi" />
              </View>
              <Text role="heading" aria-level={1} className="text-center font-semibold text-2xl text-ink dark:text-night-ink">
                {title}
              </Text>
              <Text className="text-center font-sans text-base text-muted dark:text-night-muted">{subtitle}</Text>
            </View>
            <DemoBanner />
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
