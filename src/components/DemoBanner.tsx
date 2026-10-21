import { Info } from "lucide-react-native";
import { Text, View } from "react-native";

import { useTheme } from "../lib/theme";
import { config } from "../services";

/** Shown only when no Firebase project is configured. */
export function DemoBanner() {
  const { colors } = useTheme();
  if (config.mode !== "demo") return null;
  return (
    <View
      className="flex-row gap-3 rounded border border-border bg-butter/60 p-3 dark:border-night-border dark:bg-night-butter"
      testID="demo-banner"
    >
      <Info size={18} color={colors.ink} />
      <Text className="flex-1 font-sans text-sm text-ink dark:text-night-ink">
        Demo modu: Firebase ayarlanmadı, hesabın ve arkadaşın yalnızca bu cihazda saklanır.
      </Text>
    </View>
  );
}
