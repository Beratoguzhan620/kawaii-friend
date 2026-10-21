// Records the README screenshots and walkthrough (tests/e2e/output) on a phone-sized
// viewport, using the demo-mode web build.
import { renameSync } from "node:fs";

import { APP, button, field, heading, launch, OUT, register, tab } from "./helpers.mjs";

const browser = await launch();
const viewport = { width: 390, height: 844 };

async function newFriend(page, kind, name) {
  await heading(page, "Bir arkadaş edin").waitFor();
  await page.getByRole("radio", { name: new RegExp(`^${kind}:`) }).click();
  await field(page, "Adı").fill(name);
  await button(page, "Arkadaşımı oluştur").click();
  await heading(page, name).waitFor();
}

const act = async (page, type) => {
  await page.getByTestId(`action-${type}`).filter({ visible: true }).click();
  await page.waitForTimeout(700);
};

// Stills
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: scheme });
  const page = await context.newPage();
  await page.clock.install();
  const snap = (name) => page.screenshot({ path: `${OUT}readme-${name}${scheme === "dark" ? "-dark" : ""}.png` });

  await page.goto(APP);
  await heading(page, "Tekrar hoş geldin").waitFor();
  if (scheme === "light") await snap("login");
  await register(page, `readme.${scheme}@example.com`, "mochi123");
  await heading(page, "Bir arkadaş edin").waitFor();
  await page.getByRole("radio", { name: /^Mochi:/ }).click();
  await field(page, "Adı").fill("Pamuk");
  if (scheme === "light") await snap("create");
  await button(page, "Arkadaşımı oluştur").click();
  await heading(page, "Pamuk").waitFor();
  await act(page, "feed");
  await act(page, "play");
  await act(page, "rest");
  await page.waitForTimeout(600);
  await snap("home");

  if (scheme === "light") {
    await page.clock.fastForward("13:00:00");
    await page.getByTestId("mood").filter({ visible: true, hasText: "Aç" }).waitFor();
    await page.waitForTimeout(1200);
    await snap("hungry");
    await tab(page, "Geçmiş").click();
    await heading(page, "Geçmiş").waitFor();
    await page.waitForTimeout(400);
    await snap("history");
    await tab(page, "Ayarlar").click();
    await heading(page, "Ayarlar").waitFor();
    await page.waitForTimeout(400);
    await snap("settings");
  }
  await context.close();
}

// Walkthrough
{
  const context = await browser.newContext({ viewport, recordVideo: { dir: OUT, size: viewport } });
  const page = await context.newPage();
  const pause = (ms) => page.waitForTimeout(ms);
  await page.goto(APP);
  await heading(page, "Tekrar hoş geldin").waitFor();
  await register(page, "walkthrough@example.com", "mochi123");
  await heading(page, "Bir arkadaş edin").waitFor();
  await pause(900);
  await page.getByRole("radio", { name: /^Tofu:/ }).click();
  await pause(600);
  await page.getByRole("radio", { name: /^Bulut:/ }).click();
  await pause(600);
  await page.getByRole("radio", { name: /^Mochi:/ }).click();
  await field(page, "Adı").pressSequentially("Pamuk", { delay: 110 });
  await pause(500);
  await button(page, "Arkadaşımı oluştur").click();
  await heading(page, "Pamuk").waitFor();
  await pause(1500);
  for (const type of ["feed", "play", "rest"]) {
    await page.getByTestId(`action-${type}`).filter({ visible: true }).click();
    await pause(1600);
  }
  await tab(page, "Geçmiş").click();
  await pause(1800);
  await tab(page, "Ayarlar").click();
  await pause(1200);
  await page.getByRole("radio", { name: "Tema: Koyu" }).click();
  await pause(900);
  await tab(page, "Arkadaşım").click();
  await pause(1800);

  const video = page.video();
  await context.close();
  renameSync(await video.path(), `${OUT}walkthrough.webm`);
}

await browser.close();
console.log("recorded README media");
