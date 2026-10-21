import { Text, View } from "react-native";

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View className="rounded border border-danger/30 bg-danger-soft p-3 dark:border-night-danger/30 dark:bg-night-danger-soft">
      <Text role="alert" className="font-sans text-sm text-danger dark:text-night-danger">
        {message}
      </Text>
    </View>
  );
}
