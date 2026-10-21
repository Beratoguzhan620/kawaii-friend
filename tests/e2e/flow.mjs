// End-to-end check of the web build, in demo mode or against the Firebase emulators.
// Saves screenshots to tests/e2e/output.
import {
  APP,
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
} from "./helpers.mjs";

const DEMO = (process.env.APP_MODE ?? "demo") === "demo";
const browser = await launch();
const { step, finish, failures } = runner();

const stat = async (page, id) => Number(await page.getByTestId(id).filter({ visible: true }).getAttribute("aria-valuenow"));
const text = async (page, id) => (await page.getByTestId(id).filter({ visible: true }).textContent())?.trim();
const act = async (page, type) => {
  await page.getByTestId(`action-${type}`).filter({ visible: true }).click();
  await page.getByTestId(`action-${type}`).filter({ visible: true }).and(page.locator(":not([aria-disabled=true])")).waitFor();
};

async function createFriend(page, kind, name) {
  await heading(page, "Bir arkadaş edin").waitFor();
  await page.getByRole("radio", { name: new RegExp(`^${kind}:`) }).click();
  await field(page, "Adı").fill(name);
  await button(page, "Arkadaşımı oluştur").click();
  await heading(page, name).waitFor();
}

for (const [device, viewport, scheme] of [
  ["mobile", { width: 390, height: 844 }, "light"],
  ["desktop", { width: 1280, height: 800 }, "dark"],
]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: scheme });
  const page = await context.newPage();
  await page.clock.install();
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

  await step(`${device}: registers and is asked to make a friend`, async () => {
    await register(page, email, password);
    await heading(page, "Bir arkadaş edin").waitFor();
    await button(page, "Arkadaşımı oluştur").click();
    await page.getByText("Arkadaşına bir ad ver.").waitFor();
    await page.getByRole("radio", { name: /^Tofu:/ }).click();
    if ((await page.getByRole("radio", { name: /^Tofu:/ }).getAttribute("aria-checked")) !== "true") {
      throw new Error("Tofu should be selected");
    }
    await noHorizontalOverflow(page);
    await shot(page, `${device}-create`);
  }, page);

  await step(`${device}: creates the friend and lands on its tab`, async () => {
    await createFriend(page, "Tofu", "Pamuk");
    for (const name of ["Arkadaşım", "Geçmiş", "Ayarlar"]) await tab(page, name).waitFor();
    if ((await text(page, "mood")) !== "Mutlu") throw new Error(`mood ${await text(page, "mood")}`);
    if ((await text(page, "level")) !== "Seviye 1") throw new Error("expected level 1");
    const stats = [await stat(page, "stat-food"), await stat(page, "stat-energy"), await stat(page, "stat-joy")];
    if (stats.join() !== "80,80,80") throw new Error(`stats ${stats}`);
    await noHorizontalOverflow(page);
    await shot(page, `${device}-home`);
  }, page);

  await step(`${device}: feed, play and rest change the stats and are saved`, async () => {
    await act(page, "feed");
    await page.getByText("Pamuk afiyetle yedi. +10 XP.").waitFor();
    if ((await stat(page, "stat-food")) !== 100) throw new Error("feeding should fill Pamuk up");
    await act(page, "play");
    await page.getByText("Pamuk oyuna doyamadı. +10 XP.").waitFor();
    if ((await stat(page, "stat-joy")) !== 100) throw new Error("playing should make Pamuk happy");
    const before = await stat(page, "stat-energy");
    await act(page, "rest");
    await page.getByText("Pamuk güzel bir şekerleme yaptı. +10 XP.").waitFor();
    if ((await stat(page, "stat-energy")) <= before) throw new Error("resting should restore energy");
    if (!(await text(page, "xp"))?.startsWith("30/100 XP")) throw new Error(`xp ${await text(page, "xp")}`);
    await page.reload();
    await heading(page, "Pamuk").waitFor({ timeout: 15000 });
    if (!(await text(page, "xp"))?.startsWith("30/100 XP")) throw new Error("xp was not saved");
  }, page);

  await step(`${device}: history lists the interactions, newest first`, async () => {
    await tab(page, "Geçmiş").click();
    await heading(page, "Geçmiş").waitFor();
    const items = page.getByTestId("history-item").filter({ visible: true });
    await items.first().waitFor();
    const rows = await items.allTextContents();
    if (rows.length !== 3) throw new Error(`expected 3 rows, got ${rows.length}`);
    if (!rows[0].startsWith("Dinlendirdin") || !rows[2].startsWith("Besledin")) throw new Error(`order ${rows}`);
    await shot(page, `${device}-history`);
    await tab(page, "Arkadaşım").click();
    await heading(page, "Pamuk").waitFor();
  }, page);

  await step(`${device}: reaches level 2 after ten interactions`, async () => {
    for (const type of ["feed", "rest", "feed", "rest", "feed", "rest"]) await act(page, type);
    await act(page, "feed");
    await page.getByText("Seviye 2 oldu!", { exact: false }).waitFor();
    if ((await text(page, "level")) !== "Seviye 2") throw new Error("expected level 2");
  }, page);

  await step(`${device}: gets hungry with time and cannot play when worn out`, async () => {
    await page.clock.fastForward("12:00:00");
    await page.getByTestId("mood").filter({ visible: true, hasText: "Aç" }).waitFor();
    await page.getByText("Pamuk'un karnı zil çalıyor.").waitFor();
    await shot(page, `${device}-hungry`);
    await page.clock.fastForward("12:00:00");
    await page.getByText("Pamuk oynamak için çok yorgun. Önce biraz dinlensin.").waitFor();
    if (!(await page.getByTestId("action-play").filter({ visible: true }).isDisabled())) throw new Error("play should be disabled");
    await act(page, "feed");
    await act(page, "rest");
    if (await page.getByTestId("action-play").filter({ visible: true }).isDisabled()) throw new Error("play should be back");
  }, page);

  await step(`${device}: signing out guards the app; signing in brings the friend back`, async () => {
    await tab(page, "Ayarlar").click();
    await heading(page, "Ayarlar").waitFor();
    const shown = await page.getByTestId("account-email").filter({ visible: true }).textContent();
    if (shown !== email) throw new Error(`settings shows ${shown}`);
    await button(page, "Çıkış yap").click();
    await heading(page, "Tekrar hoş geldin").waitFor();
    await page.goto(`${APP}/settings`);
    await heading(page, "Tekrar hoş geldin").waitFor();
    await signIn(page, email, "wrong-pass");
    await page.getByText("E-posta ya da şifre hatalı.").waitFor();
    await signIn(page, email, password);
    await heading(page, "Pamuk").waitFor();
  }, page);

  await step(`${device}: duplicate accounts are explained`, async () => {
    await tab(page, "Ayarlar").click();
    await button(page, "Çıkış yap").click();
    await heading(page, "Tekrar hoş geldin").waitFor();
    await register(page, email, password);
    await page.getByText("Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.").waitFor();
  }, page);

  await context.close();
}

await browser.close();
finish();
