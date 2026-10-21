import type { AuthErrorCode } from "../services/types";

export type FieldErrors = Partial<Record<"email" | "password" | "confirm", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 6;

/** Checks the form before it is sent, so most mistakes are shown next to the field. */
export function validateAuthForm(
  values: { email: string; password: string; confirm?: string },
  kind: "login" | "register",
): FieldErrors {
  const errors: FieldErrors = {};
  const email = values.email.trim();
  if (!email) errors.email = "E-posta adresini yaz.";
  else if (!EMAIL.test(email)) errors.email = "Bu bir e-posta adresine benzemiyor.";

  if (!values.password) errors.password = "Şifreni yaz.";
  else if (kind === "register" && values.password.length < MIN_PASSWORD) {
    errors.password = `Şifre en az ${MIN_PASSWORD} karakter olmalı.`;
  }

  if (kind === "register" && values.password && values.confirm !== values.password) {
    errors.confirm = "Şifreler aynı değil.";
  }
  return errors;
}

const MESSAGES: Record<AuthErrorCode, string> = {
  "auth/invalid-email": "Bu bir e-posta adresine benzemiyor.",
  "auth/email-already-in-use": "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.",
  "auth/weak-password": `Şifre en az ${MIN_PASSWORD} karakter olmalı.`,
  "auth/invalid-credential": "E-posta ya da şifre hatalı.",
  "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
  "auth/network-request-failed": "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.",
};

// Older Firebase versions report a wrong password or unknown user separately.
const ALIASES: Record<string, AuthErrorCode> = {
  "auth/wrong-password": "auth/invalid-credential",
  "auth/user-not-found": "auth/invalid-credential",
  "auth/invalid-login-credentials": "auth/invalid-credential",
};

export function authErrorMessage(code: string): string {
  const known = (ALIASES[code] ?? code) as AuthErrorCode;
  return MESSAGES[known] ?? "Bir şeyler ters gitti. Tekrar dene.";
}
