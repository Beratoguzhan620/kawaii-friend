// End-to-end check of the web build, in demo mode or against the Firebase emulators.
// Saves screenshots to tests/e2e/output.
import {
  button,
  field,
  heading,
  launch,
  noHorizontalOverflow,
  register,
  runner,
  shot,
  signIn,
  switchAuthScreen,
  tab,
  APP,
} from "./helpers.mjs";

const DEMO = (process.env.APP_MODE ?? "demo") === "demo";
const browser = await launch();
const { step, finish, failures } = runner();

for (const [device, viewport, scheme] of [
  ["mobile", { width: 390, height: 844 }, "light"],
  ["desktop", { width: 1280, height: 800 }, "dark"],
]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: scheme });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`${device} page error: ${error.message}`));
  const email = `ada.${device}.${Date.now()}@example.com`;
  const password = "mochi123";

  await step(`${device}: starts on the login screen`, async () => {
    await page.goto(APP);
    await heading(page, "Tekrar hoş geldin").waitFor();
    const banner = page.getByTestId("demo-banner");
    if (DEMO) await banner.waitFor();
    else if (await banner.count()) throw new Error("demo banner should not show with Firebase");
    await noHorizontalOverflow(page);
    await shot(page, `${device}-login`);
  }, page);

  await step(`${device}: explains empty and invalid fields`, async () => {
    await button(page, "Giriş yap").click();
    await page.getByText("E-posta adresini yaz.").waitFor();
    await page.getByText("Şifreni yaz.").waitFor();
    await switchAuthScreen(page, "register");
    await field(page, "E-posta").fill("ada@");
    await field(page, "Şifre").fill("123");
    await field(page, "Şifre (tekrar)").fill("1234");
    await button(page, "Hesap oluştur").click();
    await page.getByText("Bu bir e-posta adresine benzemiyor.").waitFor();
    await page.getByText("Şifre en az 6 karakter olmalı.").waitFor();
    await page.getByText("Şifreler aynı değil.").waitFor();
    await shot(page, `${device}-register-errors`);
    await switchAuthScreen(page, "login");
  }, page);

  await step(`${device}: registers and lands on the tabs`, async () => {
    await register(page, email, password);
    await heading(page, "Arkadaşım").waitFor();
    for (const name of ["Arkadaşım", "Geçmiş", "Ayarlar"]) await tab(page, name).waitFor();
  }, page);

  await step(`${device}: stays signed in after a reload`, async () => {
    await page.reload();
    await heading(page, "Arkadaşım").waitFor({ timeout: 15000 });
  }, page);

  await step(`${device}: tabs switch screens`, async () => {
    await tab(page, "Geçmiş").click();
    await heading(page, "Geçmiş").waitFor();
    await tab(page, "Ayarlar").click();
    await heading(page, "Ayarlar").waitFor();
    const shown = await page.getByTestId("account-email").filter({ visible: true }).textContent();
    if (shown !== email) throw new Error(`settings shows ${shown}`);
    await shot(page, `${device}-settings`);
  }, page);

  await step(`${device}: signing out returns to login and guards the tabs`, async () => {
    await button(page, "Çıkış yap").click();
    await heading(page, "Tekrar hoş geldin").waitFor();
    await page.goto(`${APP}/settings`);
    await heading(page, "Tekrar hoş geldin").waitFor();
  }, page);

  await step(`${device}: wrong password and duplicate account are explained`, async () => {
    await signIn(page, email, "wrong-pass");
    await page.getByText("E-posta ya da şifre hatalı.").waitFor();
    await register(page, email, password);
    await page.getByText("Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.").waitFor();
    await switchAuthScreen(page, "login");
  }, page);

  await step(`${device}: signs in again`, async () => {
    await signIn(page, email, password);
    await heading(page, "Arkadaşım").waitFor();
    await shot(page, `${device}-home`);
  }, page);

  await context.close();
}

await browser.close();
finish();
