// Shared helpers for the end-to-end scripts.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

export const APP = process.env.APP_URL ?? "http://localhost:8090";
export const OUT = new URL("./output/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

export const launch = () => chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

export function runner() {
  const failures = [];
  // Pass the page to keep a screenshot of the moment a step fails.
  const step = async (name, fn, page) => {
    try {
      await fn();
      console.log(`ok   ${name}`);
    } catch (error) {
      failures.push(name);
      console.log(`FAIL ${name}\n     ${String(error.message).split("\n")[0]}`);
      await page?.screenshot({ path: `${OUT}failed-${name.replace(/[^a-z0-9]+/gi, "-")}.png` }).catch(() => {});
    }
  };
  const finish = () => {
    if (failures.length > 0) {
      console.log(`\n${failures.length} step(s) failed`);
      process.exit(1);
    }
    console.log("\nall steps passed");
  };
  return { step, finish, failures };
}

export const shot = (page, name) => page.screenshot({ path: `${OUT}${name}.png` });
export const heading = (page, name) => page.getByRole("heading", { name, exact: true });
export const button = (page, name) => page.getByRole("button", { name, exact: true });
export const field = (page, label) => page.getByLabel(label, { exact: true });

export async function noHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) throw new Error(`page overflows horizontally by ${overflow}px`);
}

// Login and register replace each other; wait until the old screen is gone before typing,
// or the text can land in a field that is about to unmount.
export async function switchAuthScreen(page, to) {
  const [link, from, target] =
    to === "register" ? ["Kayıt ol", "Tekrar hoş geldin", "Hesap oluştur"] : ["Giriş yap", "Hesap oluştur", "Tekrar hoş geldin"];
  await page.getByRole("link", { name: link }).click();
  await heading(page, from).waitFor({ state: "detached" });
  await heading(page, target).waitFor();
}

export async function register(page, email, password) {
  await switchAuthScreen(page, "register");
  await field(page, "E-posta").fill(email);
  await field(page, "Şifre").fill(password);
  await field(page, "Şifre (tekrar)").fill(password);
  await button(page, "Hesap oluştur").click();
}

export async function signIn(page, email, password) {
  await field(page, "E-posta").fill(email);
  await field(page, "Şifre").fill(password);
  await button(page, "Giriş yap").click();
}

export const tab = (page, name) => page.getByRole("tab", { name });
