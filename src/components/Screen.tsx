import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { title: string; subtitle?: string; children: ReactNode; scroll?: boolean };

/** Tab screen frame: safe area, page title and a centred column on wide screens. */
export function Screen({ title, subtitle, children, scroll = true }: Props) {
  const body = (
    <View className="w-full max-w-[560px] gap-5 self-center px-5 pb-8 pt-4">
      <View className="gap-1">
        <Text role="heading" aria-level={1} className="font-semibold text-2xl text-ink dark:text-night-ink">
          {title}
        </Text>
        {subtitle && <Text className="font-sans text-base text-muted dark:text-night-muted">{subtitle}</Text>}
      </View>
      {children}
    </View>
  );
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg dark:bg-night-bg">
      {scroll ? <ScrollView contentContainerClassName="grow">{body}</ScrollView> : body}
    </SafeAreaView>
  );
}
