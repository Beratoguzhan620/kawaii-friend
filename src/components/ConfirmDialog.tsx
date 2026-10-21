import { Modal, Pressable, Text, View } from "react-native";

import { Button } from "./Button";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

export function ConfirmDialog({ visible, title, message, confirmLabel, onConfirm, onCancel, busy }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center px-6">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onCancel} accessibilityLabel="Kapat" />
        <View
          role="alertdialog"
          aria-modal
          aria-label={title}
          className="w-full max-w-[400px] gap-4 rounded-card bg-surface p-6 dark:bg-night-surface"
        >
          <Text role="heading" className="font-semibold text-lg text-ink dark:text-night-ink">
            {title}
          </Text>
          <Text className="font-sans text-base text-muted dark:text-night-muted">{message}</Text>
          <View className="gap-3">
            <Button label={confirmLabel} variant="danger" onPress={onConfirm} loading={busy} />
            <Button label="Vazgeç" variant="secondary" onPress={onCancel} disabled={busy} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
