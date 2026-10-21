import "../global.css";
import "../src/lib/interop";

import { IBMPlexMono_400Regular } from "@expo-google-fonts/ibm-plex-mono";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import { Friend } from "../src/components/Friend";
import { AuthProvider, useAuth } from "../src/context/AuthProvider";
import { FriendProvider, useFriend } from "../src/context/FriendProvider";
import { PreferencesProvider, usePreferences } from "../src/context/PreferencesProvider";
import { ReminderScheduler } from "../src/components/ReminderScheduler";
import { useTheme } from "../src/lib/theme";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, ready } = useAuth();
  const { status, reload } = useFriend();
  const { ready: preferencesReady } = usePreferences();
  const { dark, colors } = useTheme();
  const started = ready && preferencesReady;

  useEffect(() => {
    if (started) SplashScreen.hideAsync();
  }, [started]);

  // Keep the splash screen up until we know who is signed in and which theme to use.
  if (!started) return null;

  if (user && status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-bg dark:bg-night-bg" accessibilityLabel="Yükleniyor">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (user && status === "error") {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-6 dark:bg-night-bg">
        <Friend kind="mochi" mood="tired" size={120} />
        <Text className="text-center font-sans text-base text-ink dark:text-night-ink">
          Arkadaşın yüklenemedi. Bağlantını kontrol edip tekrar dene.
        </Text>
        <Button label="Tekrar dene" variant="secondary" onPress={reload} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={user !== null && status === "ready"}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={user !== null && status === "none"}>
          <Stack.Screen name="create-friend" />
        </Stack.Protected>
        <Stack.Protected guard={user === null}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular,
  });
  if (!fontsLoaded && fontError === null) return null;

  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <AuthProvider>
          <FriendProvider>
            <ReminderScheduler />
            <RootNavigator />
          </FriendProvider>
        </AuthProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
