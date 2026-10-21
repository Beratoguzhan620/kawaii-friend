import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, type TextInputProps, View } from "react-native";

import { useTheme } from "../lib/theme";

type Props = Omit<TextInputProps, "className" | "secureTextEntry"> & {
  label: string;
  error?: string;
  hint?: string;
  secret?: boolean;
};

export function TextField({ label, error, hint, secret, ...input }: Props) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(true);
  return (
    <View className="gap-1.5">
      <Text className="font-medium text-sm text-ink dark:text-night-ink">{label}</Text>
      <View
        className={`h-12 flex-row items-center rounded border bg-surface px-4 dark:bg-night-surface ${
          error ? "border-danger dark:border-night-danger" : "border-border dark:border-night-border"
        }`}
      >
        <TextInput
          {...input}
          accessibilityLabel={label}
          aria-invalid={!!error}
          secureTextEntry={secret && hidden}
          placeholderTextColor={colors.muted}
          className="h-full flex-1 font-sans text-base text-ink outline-none dark:text-night-ink"
        />
        {secret && (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Şifreyi göster" : "Şifreyi gizle"}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center"
          >
            {hidden ? <Eye size={20} color={colors.muted} /> : <EyeOff size={20} color={colors.muted} />}
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="font-sans text-sm text-danger dark:text-night-danger" role="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text className="font-sans text-xs text-muted dark:text-night-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
