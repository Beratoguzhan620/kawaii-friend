import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AuthScreen } from "../src/components/AuthScreen";
import { Button } from "../src/components/Button";
import { FormError } from "../src/components/FormError";
import { TextField } from "../src/components/TextField";
import { authErrorMessage, type FieldErrors, validateAuthForm } from "../src/lib/auth-form";
import { auth } from "../src/services";
import { AuthError } from "../src/services/types";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const found = validateAuthForm({ email, password }, "login");
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      await auth.signIn(email, password);
    } catch (error) {
      setFormError(authErrorMessage(error instanceof AuthError ? error.code : "unknown"));
      setBusy(false);
    }
  };

  return (
    <AuthScreen title="Tekrar hoş geldin" subtitle="Arkadaşın seni bekliyor." mood="happy">
      <View className="gap-4">
        <TextField
          label="E-posta"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <TextField
          label="Şifre"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secret
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <FormError message={formError} />
        <Button label="Giriş yap" onPress={submit} loading={busy} />
      </View>
      <View className="flex-row justify-center gap-1">
        <Text className="font-sans text-sm text-muted dark:text-night-muted">Hesabın yok mu?</Text>
        <Link href="/register" replace className="font-semibold text-sm text-primary dark:text-night-primary">
          Kayıt ol
        </Link>
      </View>
    </AuthScreen>
  );
}
