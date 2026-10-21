import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AuthScreen } from "../src/components/AuthScreen";
import { Button } from "../src/components/Button";
import { FormError } from "../src/components/FormError";
import { TextField } from "../src/components/TextField";
import { authErrorMessage, type FieldErrors, MIN_PASSWORD, validateAuthForm } from "../src/lib/auth-form";
import { auth } from "../src/services";
import { AuthError } from "../src/services/types";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const found = validateAuthForm({ email, password, confirm }, "register");
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      await auth.signUp(email, password);
    } catch (error) {
      setFormError(authErrorMessage(error instanceof AuthError ? error.code : "unknown"));
      setBusy(false);
    }
  };

  return (
    <AuthScreen title="Hesap oluştur" subtitle="Bir arkadaş edinmeye bir adım kaldı." mood="hungry">
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
        />
        <TextField
          label="Şifre"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          hint={`En az ${MIN_PASSWORD} karakter.`}
          secret
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <TextField
          label="Şifre (tekrar)"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secret
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <FormError message={formError} />
        <Button label="Hesap oluştur" onPress={submit} loading={busy} />
      </View>
      <View className="flex-row justify-center gap-1">
        <Text className="font-sans text-sm text-muted dark:text-night-muted">Zaten hesabın var mı?</Text>
        <Link href="/login" replace className="font-semibold text-sm text-primary dark:text-night-primary">
          Giriş yap
        </Link>
      </View>
    </AuthScreen>
  );
}
