import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.SCREENSHOT_BASE_URL || "http://localhost:3002";
const OUT_DIR = path.resolve(process.cwd(), "screenshots");

const AUTH_STORAGE_KEY = "founderssuite.auth.user";

function founderUser() {
  return {
    id: "user_founder_local",
    email: "founder@example.com",
    name: "Founder",
    role: "founder",
    createdAt: new Date().toISOString(),
  };
}

function testerUser() {
  return {
    id: "user_tester_local",
    email: "tester@example.com",
    name: "Tester",
    role: "tester",
    createdAt: new Date().toISOString(),
  };
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function gotoAndShot(page, route, filename) {
  const url = `${BASE_URL}${route}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(250);
  // Work around occasional Page.captureScreenshot failures on some environments.
  try {
    await page.screenshot({
      path: path.join(OUT_DIR, filename),
      fullPage: true,
      animations: "disabled",
    });
  } catch {
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUT_DIR, filename),
      fullPage: false,
      animations: "disabled",
    });
  }
  process.stdout.write(`✓ ${route} -> ${filename}\n`);
}

async function run() {
  await ensureDir(OUT_DIR);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    deviceScaleFactor: 2,
  });

  // Unauthed screens
  {
    const page = await context.newPage();
    await gotoAndShot(page, "/", "01-landing.png");
    await gotoAndShot(page, "/login", "02-login.png");
    await gotoAndShot(page, "/signup", "03-signup.png");
    await page.close();
  }

  // Founder authed screens
  {
    const page = await context.newPage();
    await page.addInitScript(
      ({ key, value }) => window.localStorage.setItem(key, value),
      { key: AUTH_STORAGE_KEY, value: JSON.stringify(founderUser()) }
    );

    await gotoAndShot(page, "/founder/dashboard", "10-founder-dashboard.png");
    await gotoAndShot(page, "/founder/matches", "11-founder-matches.png");
    await gotoAndShot(page, "/founder/forms/new", "12-founder-forms-new.png");
    await gotoAndShot(page, "/founder/profile", "13-founder-profile.png");
    await gotoAndShot(page, "/founder/settings", "14-founder-settings.png");
    await gotoAndShot(page, "/agents", "18-agents.png");
    await gotoAndShot(page, "/agents/agent_1", "19-agent-detail.png");
    await page.close();
  }

  // Tester authed screens
  {
    const page = await context.newPage();
    await page.addInitScript(
      ({ key, value }) => window.localStorage.setItem(key, value),
      { key: AUTH_STORAGE_KEY, value: JSON.stringify(testerUser()) }
    );

    await gotoAndShot(page, "/tester", "30-tester-root.png");
    await gotoAndShot(page, "/tester/matches", "31-tester-matches.png");
    await gotoAndShot(page, "/tester/profile", "32-tester-profile.png");
    await gotoAndShot(page, "/tester/settings", "33-tester-settings.png");
    await gotoAndShot(page, "/tester/community", "15-community.png");
    await gotoAndShot(page, "/tester/community/SaaS", "16-community-domain-saas.png");
    await gotoAndShot(page, "/tester/community/post/post_1", "17-community-thread.png");
    await page.close();
  }

  await context.close();
  await browser.close();

  process.stdout.write(`\nScreenshots saved to: ${OUT_DIR}\n`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

