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
import { colorScheme } from "nativewind";
import { useEffect } from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import { Friend } from "../src/components/Friend";
import { AuthProvider, useAuth } from "../src/context/AuthProvider";
import { FriendProvider, useFriend } from "../src/context/FriendProvider";
import { useTheme } from "../src/lib/theme";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, ready } = useAuth();
  const { status, reload } = useFriend();
  const { dark, colors } = useTheme();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Keep the splash screen up until we know whether someone is signed in.
  if (!ready) return null;

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
  const system = useColorScheme();

  // Follow the device theme. Tailwind uses darkMode: "class", and on web "system"
  // would only clear the class, so pass the resolved scheme instead.
  useEffect(() => {
    colorScheme.set(system === "dark" ? "dark" : "light");
  }, [system]);

  if (!fontsLoaded && fontError === null) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FriendProvider>
          <RootNavigator />
        </FriendProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
