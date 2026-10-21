import { ActivityIndicator, Pressable, Text } from "react-native";

import { useTheme } from "../lib/theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
};

const BOX = {
  primary: "bg-primary dark:bg-night-primary",
  secondary: "border border-border bg-surface dark:border-night-border dark:bg-night-surface",
  danger: "border border-danger/30 bg-danger-soft dark:border-night-danger/30 dark:bg-night-danger-soft",
};

const TEXT = {
  primary: "text-white dark:text-ink",
  secondary: "text-ink dark:text-night-ink",
  danger: "text-danger dark:text-night-danger",
};

export function Button({ label, onPress, variant = "primary", loading, disabled, testID }: Props) {
  const { colors } = useTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      testID={testID}
      className={`h-12 flex-row items-center justify-center gap-2 rounded px-5 active:opacity-80 ${BOX[variant]} ${
        inactive ? "opacity-60" : ""
      }`}
    >
      {loading && <ActivityIndicator size="small" color={variant === "primary" ? colors.onPrimary : colors.ink} />}
      <Text className={`font-semibold text-base ${TEXT[variant]}`}>{label}</Text>
    </Pressable>
  );
}
