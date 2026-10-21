import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  tone: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

export function ActionButton({ label, icon: Icon, iconColor, tone, onPress, disabled, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      className={`flex-1 items-center gap-2 rounded-card border border-border bg-surface py-4 active:opacity-80 dark:border-night-border dark:bg-night-surface ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <View className={`h-12 w-12 items-center justify-center rounded-full ${tone}`}>
        <Icon size={24} color={iconColor} />
      </View>
      <Text className="font-semibold text-sm text-ink dark:text-night-ink">{label}</Text>
    </Pressable>
  );
}
