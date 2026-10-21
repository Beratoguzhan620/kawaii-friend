import { describe, expect, it } from "vitest";

import { authErrorMessage, validateAuthForm } from "../src/lib/auth-form";

describe("validateAuthForm", () => {
  it("accepts a valid login", () => {
    expect(validateAuthForm({ email: " ada@example.com ", password: "x" }, "login")).toEqual({});
  });

  it("asks for missing fields", () => {
    const errors = validateAuthForm({ email: "", password: "" }, "login");
    expect(errors.email).toBe("E-posta adresini yaz.");
    expect(errors.password).toBe("Şifreni yaz.");
  });

  it("rejects an address without a domain", () => {
    expect(validateAuthForm({ email: "ada@", password: "secret1" }, "login").email).toBeDefined();
  });

  it("only checks the password length when registering", () => {
    expect(validateAuthForm({ email: "a@b.co", password: "123" }, "login").password).toBeUndefined();
    expect(validateAuthForm({ email: "a@b.co", password: "123", confirm: "123" }, "register").password).toBe(
      "Şifre en az 6 karakter olmalı.",
    );
  });

  it("needs matching passwords to register", () => {
    expect(validateAuthForm({ email: "a@b.co", password: "secret1", confirm: "secret2" }, "register").confirm).toBe(
      "Şifreler aynı değil.",
    );
    expect(validateAuthForm({ email: "a@b.co", password: "secret1", confirm: "secret1" }, "register")).toEqual({});
  });
});

describe("authErrorMessage", () => {
  it("explains known Firebase codes", () => {
    expect(authErrorMessage("auth/email-already-in-use")).toContain("zaten bir hesap var");
    expect(authErrorMessage("auth/invalid-credential")).toBe("E-posta ya da şifre hatalı.");
  });

  it("maps the older wrong-password codes to the same message", () => {
    expect(authErrorMessage("auth/wrong-password")).toBe("E-posta ya da şifre hatalı.");
    expect(authErrorMessage("auth/user-not-found")).toBe("E-posta ya da şifre hatalı.");
  });

  it("falls back to a generic message", () => {
    expect(authErrorMessage("auth/something-new")).toBe("Bir şeyler ters gitti. Tekrar dene.");
  });
});
