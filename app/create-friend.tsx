import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import { FormError } from "../src/components/FormError";
import { Friend } from "../src/components/Friend";
import { TextField } from "../src/components/TextField";
import { useFriend } from "../src/context/FriendProvider";
import { CHARACTERS, type FriendKind, NAME_MAX, validateFriendName } from "../src/lib/friend";

const BACKDROP: Record<FriendKind, string> = {
  mochi: "bg-peach dark:bg-night-peach",
  tofu: "bg-mint dark:bg-night-mint",
  bulut: "bg-sky dark:bg-night-sky",
};

export default function CreateFriendScreen() {
  const { create } = useFriend();
  const [kind, setKind] = useState<FriendKind>("mochi");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const error = validateFriendName(name);
    setNameError(error);
    setFormError(null);
    if (error) return;
    setBusy(true);
    try {
      await create(name, kind);
    } catch {
      setFormError("Arkadaşın kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-night-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerClassName="grow justify-center px-6 py-8" keyboardShouldPersistTaps="handled">
          <View className="w-full max-w-[520px] gap-6 self-center">
            <View className="gap-1">
              <Text role="heading" aria-level={1} className="font-semibold text-2xl text-ink dark:text-night-ink">
                Bir arkadaş edin
              </Text>
              <Text className="font-sans text-base text-muted dark:text-night-muted">
                Birini seç ve ona bir ad ver. Onu beslemek, oyalamak ve dinlendirmek sana kalmış.
              </Text>
            </View>

            <View role="radiogroup" aria-label="Karakter" className="flex-row gap-3">
              {CHARACTERS.map((character) => {
                const selected = character.kind === kind;
                return (
                  <Pressable
                    key={character.kind}
                    onPress={() => setKind(character.kind)}
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${character.name}: ${character.blurb}`}
                    className={`flex-1 items-center gap-2 rounded-card border-2 bg-surface p-3 dark:bg-night-surface ${
                      selected ? "border-primary dark:border-night-primary" : "border-border dark:border-night-border"
                    }`}
                  >
                    <View className={`w-full items-center rounded py-2 ${BACKDROP[character.kind]}`}>
                      <Friend kind={character.kind} mood="happy" size={84} />
                    </View>
                    <Text className="font-semibold text-sm text-ink dark:text-night-ink">{character.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="-mt-3 text-center font-sans text-sm text-muted dark:text-night-muted">
              {CHARACTERS.find((character) => character.kind === kind)?.blurb}
            </Text>

            <TextField
              label="Adı"
              value={name}
              onChangeText={setName}
              error={nameError ?? undefined}
              hint={`En fazla ${NAME_MAX} karakter.`}
              placeholder={CHARACTERS.find((character) => character.kind === kind)?.name}
              maxLength={NAME_MAX + 5}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            <FormError message={formError} />
            <Button label="Arkadaşımı oluştur" onPress={submit} loading={busy} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
