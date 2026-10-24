/**
 * End-to-end test of the full customer journey:
 * homepage → open invitation → builder → order → receipt → admin activation → guest RSVP → edit.
 *
 * Usage: npm run test:e2e            (starts its own server on a temp database)
 *        E2E_BASE_URL=https://… npm run test:e2e   (runs against an existing server)
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "e2e-secret";
let base = process.env.E2E_BASE_URL;
let server;
let dataDir;
let browser;


function log(step) {
  console.log(`  ✓ ${step}`);
}

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

async function startServer() {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "visol-e2e-"));
  const port = 3200 + Math.floor(Math.random() * 500);
  const prod = fs.existsSync("dist/server.js") && process.env.E2E_DEV !== "1";
  const args = prod
    ? ["--disable-warning=ExperimentalWarning", "dist/server.js"]
    : ["--disable-warning=ExperimentalWarning", "--import", "tsx", "server/index.ts"];
  server = spawn(process.execPath, args, {
    env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, ADMIN_PASSWORD, DISABLE_HMR: "1", NODE_ENV: prod ? "production" : "development" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));
  base = `http://localhost:${port}`;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${base}/api/health`);
      if (r.ok) return console.log(`Server (${prod ? "production build" : "dev"}) on ${base}`);
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Server did not start");
}

async function jpeg(page, color = "#c9a85c") {
  const dataUrl = await page.evaluate((c) => {
    const cv = document.createElement("canvas");
    cv.width = 600;
    cv.height = 800;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 600, 800);
    ctx.fillStyle = "#fff";
    ctx.font = "60px serif";
    ctx.fillText("Chek", 200, 400);
    return cv.toDataURL("image/jpeg", 0.9);
  }, color);
  return { name: "photo.jpg", mimeType: "image/jpeg", buffer: Buffer.from(dataUrl.split(",")[1], "base64") };
}

async function run() {
  if (!base) await startServer();
  browser = await chromium.launch();
  const errors = [];
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0",
  });
  ctx.setDefaultTimeout(15000);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));

  /* 1. Homepage + hero opening ------------------------------------- */
  await page.goto(base, { waitUntil: "networkidle" });
  assert((await page.locator("h1").innerText()).includes("ochiladigan"), "hero headline");
  await page.locator(".gf").first().tap();
  await page.waitForTimeout(3300);
  assert((await page.locator(".gf").first().getAttribute("data-state")) === "open", "hero card opens on tap");
  log("Homepage loads and the hero invitation opens on tap");

  /* 2. Live demo --------------------------------------------------- */
  await page.goto(`${base}/namuna/samarqand`, { waitUntil: "networkidle" });
  await page.locator(".gf").tap();
  await page.waitForTimeout(3300);
  assert(await page.getByText("Qadrli mehmon!").isVisible(), "demo content visible after opening");
  assert(await page.getByText("To‘ygacha qoldi").count(), "countdown rendered");
  log("Template demo opens and shows countdown, details and RSVP");

  /* 3. Builder ----------------------------------------------------- */
  await page.goto(`${base}/yaratish?t=suzani`, { waitUntil: "networkidle" });
  assert((await page.locator('button[aria-pressed="true"]').first().innerText()).includes("Suzani"), "template preselected from link");
  await page.getByText("Fotiha to‘yi").tap();
  await page.getByRole("button", { name: /Davom etish/ }).tap();
  // validation blocks empty names
  await page.getByRole("button", { name: /Davom etish/ }).tap();
  assert(await page.getByText("Kuyov ismini kiriting").isVisible(), "validation message for missing groom");
  await page.fill('input[placeholder="Masalan: Aziz"]', "Jahongir");
  await page.fill('input[placeholder="Masalan: Madina"]', "Oʻgʻiloy");
  await page.fill('input[placeholder="Karimovlar oilasi"]', "Toshmatovlar oilasi");
  await page.fill('input[type="date"]', "2027-05-15");
  await page.fill('input[placeholder="Masalan: Navro‘z to‘yxonasi"]', "Oqsaroy restorani");
  await page.fill('input[placeholder="Shahar, tuman, ko‘cha"]', "Samarqand sh., Registon ko‘chasi 1");
  await page.fill('input[placeholder="https://maps.google.com/…"]', "https://www.google.com/maps/@39.6548,66.9757,17z");
  assert(await page.getByText("Joylashuv aniqlandi").isVisible(), "map coordinates detected");
  await page.getByRole("button", { name: /Davom etish/ }).tap();
  // photos + music
  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(await jpeg(page, "#8f2a30"));
  await page.waitForSelector('img[src^="/uploads/"]', { timeout: 15000 });
  await page.getByText("Sokin — fortepiano").tap();
  log("Builder: template, validation, details, map parsing, photo upload, music");
  await page.getByRole("button", { name: /Davom etish/ }).tap();
  await page.getByRole("button", { name: /Buyurtmani tasdiqlash/ }).tap();
  assert(await page.getByText("Ismingizni kiriting").isVisible(), "customer validation");
  await page.fill('input[autocomplete="name"]', "Dilnoza Karimova");
  await page.fill('input[type="tel"]', "+998 90 123 45 67");
  await page.fill('input[placeholder="@username"]', "@dilnoza_k");
  await page.getByRole("button", { name: /Buyurtmani tasdiqlash/ }).tap();
  await page.waitForURL(/\/buyurtma\/[A-Z0-9]+\?k=/, { timeout: 15000 });
  const orderUrl = new URL(page.url());
  const orderId = orderUrl.pathname.split("/").pop();
  const editKey = orderUrl.searchParams.get("k");
  await page.getByText("Bir qadam qoldi — to‘lov").waitFor({ timeout: 10000 });
  assert(await page.getByText("249 000 so‘m").first().isVisible(), "premium price shown");
  log(`Order #${orderId} created and payment instructions shown`);

  /* 4. Receipt ----------------------------------------------------- */
  await page.locator('input[type="file"]').first().setInputFiles(await jpeg(page));
  await page.getByText("Chek tekshirilmoqda").first().waitFor({ timeout: 15000 });
  log("Receipt uploaded → status “Chek tekshirilmoqda”");

  const { order } = await (await fetch(`${base}/api/orders/${orderId}`, { headers: { "X-Edit-Key": editKey } })).json();
  const slug = order.slug;
  assert(order.status === "review", "status review");
  assert(order.data.photos.length === 1 && order.data.music === "sokin", "premium extras stored");
  assert((await fetch(`${base}/api/orders/${orderId}`, { headers: { "X-Edit-Key": "wrong" } })).status === 404, "wrong key rejected");

  /* 5. Social preview meta ---------------------------------------- */
  const html = await (await fetch(`${base}/i/${slug}`)).text();
  assert(html.includes('og:title" content="Jahongir &amp; Oʻgʻiloy — Fotiha to‘yiga taklifnoma'), "og:title for invite");
  assert(html.includes("/og/suzani.jpg"), "og:image per template");
  log("Invite link has Telegram/WhatsApp preview meta");

  /* 6. Not yet active → preview badge ------------------------------ */
  const guest = await ctx.newPage();
  guest.on("pageerror", (e) => errors.push(e.message));
  await guest.goto(`${base}/i/${slug}`, { waitUntil: "networkidle" });
  await guest.getByText("Namuna · to‘lovdan so‘ng faollashadi").waitFor({ timeout: 10000 });
  log("Inactive invitation shows the “Namuna” badge");

  /* 7. Admin ------------------------------------------------------- */
  const admin = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  admin.on("pageerror", (e) => errors.push(e.message));
  await admin.goto(`${base}/admin`, { waitUntil: "networkidle" });
  await admin.fill('input[type="password"]', "wrong");
  await admin.getByRole("button", { name: "Kirish" }).click();
  await admin.getByText("Parol noto‘g‘ri").waitFor();
  await admin.fill('input[type="password"]', ADMIN_PASSWORD);
  await admin.getByRole("button", { name: "Kirish" }).click();
  await admin.getByText(`#${orderId}`).first().click();
  await admin.getByRole("button", { name: "Faollashtirish" }).click();
  await admin.getByText("Holat: Faol").waitFor();
  await admin.keyboard.press("Escape");
  log("Admin logs in (wrong password rejected) and activates the order");

  // templates: disable then re-enable
  await admin.getByRole("button", { name: "Shablonlar" }).click();
  await admin.locator('button[role="switch"]').nth(5).click();
  await admin.getByText("Shablon saqlandi").waitFor();
  let cfg = await (await fetch(`${base}/api/config`)).json();
  assert(!cfg.templates.some((t) => t.id === "samarqand"), "disabled template hidden from public");
  await admin.waitForTimeout(2600);
  await admin.locator('button[role="switch"]').nth(5).click();
  await admin.getByText("Shablon saqlandi").waitFor();
  cfg = await (await fetch(`${base}/api/config`)).json();
  assert(cfg.templates.some((t) => t.id === "samarqand"), "re-enabled template visible");
  log("Admin toggles template visibility");

  // settings: change a price
  await admin.getByRole("button", { name: "Sozlamalar" }).click();
  const price = admin.locator('input[aria-label="Narx"]').first();
  await price.fill("159000");
  await admin.getByRole("button", { name: "Sozlamalarni saqlash" }).click();
  await admin.getByText("Sozlamalar saqlandi").waitFor();
  cfg = await (await fetch(`${base}/api/config`)).json();
  assert(cfg.packages[0].price === 159000, "price updated");
  log("Admin updates package prices");

  /* 8. Guest experience + RSVP ------------------------------------ */
  await guest.reload({ waitUntil: "networkidle" });
  assert(!(await guest.getByText("Namuna · to‘lovdan so‘ng faollashadi").count()), "badge gone when active");
  await guest.locator(".gf").tap();
  await guest.waitForTimeout(3300);
  assert(await guest.locator(".inv-music").isVisible(), "music toggle visible");
  await guest.fill('input[placeholder="Ism va familiyangiz"]', "Sardor aka");
  await guest.getByRole("button", { name: "Albatta kelaman" }).tap();
  await guest.getByRole("button", { name: "Ko‘paytirish" }).tap();
  await guest.fill("textarea", "Baxtli bo‘linglar!");
  await guest.getByRole("button", { name: "Javobni yuborish" }).tap();
  await guest.getByText("Rahmat, Sardor!").waitFor();
  const ics = await fetch(`${base}/api/invites/${slug}/calendar.ics`);
  assert(ics.ok && (await ics.text()).includes("DTSTART:20270515T130000Z"), "calendar file in UTC");
  log("Guest opens the active invitation, sends RSVP, calendar file works");

  /* 9. Couple sees RSVP + edits ----------------------------------- */
  await page.goto(`${base}/buyurtma/${orderId}?k=${encodeURIComponent(editKey)}`, { waitUntil: "networkidle" });
  await page.getByText("Taklifnomangiz tayyor!").waitFor({ timeout: 10000 });
  await page.getByText("Sardor aka").waitFor();
  assert(await page.getByText("Keladi · 2 kishi").isVisible(), "rsvp guest count");
  await page.getByRole("link", { name: "Tahrirlash" }).tap();
  await page.getByRole("button", { name: /Davom etish/ }).tap();
  await page.fill('input[placeholder="Masalan: Navro‘z to‘yxonasi"]', "Registon saroyi");
  await page.getByRole("button", { name: /Davom etish/ }).tap();
  await page.getByRole("button", { name: /O‘zgarishlarni saqlash/ }).tap();
  await page.getByText("O‘zgarishlar saqlandi").waitFor();
  const inv = await (await fetch(`${base}/api/invites/${slug}`)).json();
  assert(inv.invite.data.venue === "Registon saroyi", "edit saved");
  log("Couple sees RSVP list and edits the invitation");

  /* 10. Security checks ------------------------------------------- */
  assert((await fetch(`${base}/api/admin/orders`)).status === 401, "admin API requires auth");
  const bad = await fetch(`${base}/api/uploads?kind=image`, { method: "POST", body: "<svg onload=alert(1)>" });
  assert(bad.status === 400, "non-image upload rejected");
  const xss = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template: "rishton", package: "premium", data: { eventType: "nikoh", groom: "A", bride: "B", date: "2027-01-01", time: "18:00", venue: "X", photos: ["javascript:alert(1)"] }, customer: { name: "Test", phone: "+998901234567" } }),
  });
  assert(xss.status === 400, "invalid photo URL rejected");
  log("Admin API protected, uploads sniffed, inputs validated");

  assert(errors.length === 0, `no page errors (got: ${errors.join(" | ")})`);
  await browser.close();
  console.log("\nAll end-to-end checks passed.");
}

run()
  .catch((e) => {
    console.error("\n✗", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close().catch(() => undefined);
    server?.kill();
    if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
  });
