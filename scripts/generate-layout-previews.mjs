import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const LAYOUTS = ["hero-overlay", "split-screen", "editorial", "ticket-first", "timeline"];
const BASE_URL = process.env.PREVIEW_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(process.cwd(), "public/layout-previews");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const layout of LAYOUTS) {
    const url = `${BASE_URL}/dev/layout-previews/${layout}`;
    console.log(`Capturing ${layout} from ${url}`);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUT_DIR, `${layout}.png`),
      clip: { x: 0, y: 0, width: 1280, height: 720 },
    });
  }

  await browser.close();
  console.log(`Wrote ${LAYOUTS.length} screenshots to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
