// Renders the app icon, Android icon layers, splash marks, favicon and the Android
// notification icon from the same Mochi drawing the app uses (src/components/Friend.tsx).
// Run with: node scripts/make-icons.mjs
import { chromium } from "playwright";

const OUT = new URL("../assets/", import.meta.url).pathname;
const ROSE_SOFT = "#F8E3E9";

const mochi = (ink = "#3A2E36") => `
  <path d="M100 40 C146 40 178 82 178 124 C178 158 146 174 100 174 C54 174 22 158 22 124 C22 82 54 40 100 40 Z"
        fill="#F9D9C4" stroke="#D9A27F" stroke-width="4"/>
  <ellipse cx="62" cy="132" rx="11" ry="7" fill="#F2A7B8" opacity="0.75"/>
  <ellipse cx="138" cy="132" rx="11" ry="7" fill="#F2A7B8" opacity="0.75"/>
  <g stroke="${ink}" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M68 116 Q78 104 88 116"/><path d="M112 116 Q122 104 132 116"/>
  </g>
  <path d="M88 132 Q100 148 112 132 Z" fill="${ink}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`;

// White shape with the eyes cut out, for Android's monochrome and notification icons.
const silhouette = `<mask id="cut"><rect width="200" height="200" fill="#000"/>
    <path d="M100 40 C146 40 178 82 178 124 C178 158 146 174 100 174 C54 174 22 158 22 124 C22 82 54 40 100 40 Z" fill="#FFF"/>
    <g stroke="#000" stroke-width="9" stroke-linecap="round" fill="none">
      <path d="M68 116 Q78 104 88 116"/><path d="M112 116 Q122 104 132 116"/></g></mask>
  <rect width="200" height="200" fill="#FFFFFF" mask="url(#cut)"/>`;

// Mochi's body spans x 22–178 and y 40–174 in a 200 box; centre it vertically.
const svg = (size, { background, scale, body }) => {
  const s = scale;
  const offset = (200 - 200 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
    ${background ? `<rect width="200" height="200" fill="${background}"/>` : ""}
    <g transform="translate(${offset} ${offset - 7 * s}) scale(${s})">${body}</g>
  </svg>`;
};

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();

async function render(name, size, options, transparent = !options.background) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(size, options)}</body></html>`);
  await page.locator("svg").screenshot({ path: `${OUT}${name}`, omitBackground: transparent });
}

await render("icon.png", 1024, { background: ROSE_SOFT, scale: 0.8, body: mochi() });
await render("favicon.png", 48, { background: ROSE_SOFT, scale: 0.86, body: mochi() });
await render("android-icon-foreground.png", 1024, { scale: 0.5, body: mochi() });
await render("android-icon-background.png", 1024, { background: ROSE_SOFT, scale: 1, body: "" });
await render("android-icon-monochrome.png", 1024, { scale: 0.5, body: silhouette });
await render("notification-icon.png", 96, { scale: 0.9, body: silhouette });
await render("splash-icon.png", 1024, { scale: 0.9, body: mochi() });

await browser.close();
console.log("icons written to assets/");
