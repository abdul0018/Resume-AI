import express, { type NextFunction, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  EVENT_TYPES,
  ORDER_STATUSES,
  PACKAGE_FLAGS,
  createOrderSchema,
  resolvePackages,
  rsvpSchema,
  settingsSchema,
  updateOrderSchema,
  type InviteData,
  type PackageId,
} from "../shared/schema.ts";
import { eventTimestamp, formatDateLong, formatPrice, formatWeekday, slugify } from "../shared/format.ts";
import * as db from "./db.ts";
import {
  checkAdminPassword,
  clearAdminSession,
  isAdmin,
  issueAdminSession,
  randomCode,
  randomToken,
  rateLimit,
  requireAdmin,
  safeEqual,
  securityHeaders,
} from "./security.ts";
import { UploadError, storeUpload } from "./uploads.ts";
import { notifyAdmin } from "./notify.ts";

const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY ?? "loopback");
app.use(securityHeaders);
app.use("/api", express.json({ limit: "200kb" }));

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type Handler = (req: Request, res: Response) => unknown | Promise<unknown>;
const h = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

function validation(res: Response, error: z.ZodError) {
  const first = error.issues[0];
  return res.status(400).json({ error: first?.message || "Ma’lumotlar noto‘g‘ri", path: first?.path });
}

/** Strips features that the chosen package does not include. */
function applyPackage(data: InviteData, pkg: PackageId): InviteData {
  const flags = PACKAGE_FLAGS[pkg];
  return { ...data, photos: flags.photos ? data.photos : [], music: flags.music ? data.music : "none" };
}

function ownedOrder(req: Request, res: Response) {
  const order = db.getOrderRaw(String(req.params.id));
  const key = String(req.get("x-edit-key") || req.query.k || "");
  if (!order || !key || !safeEqual(key, order.editKey)) {
    res.status(404).json({ error: "Buyurtma topilmadi" });
    return null;
  }
  return order.view;
}

function uniqueSlug(groom: string, bride: string) {
  const base = [slugify(groom), slugify(bride)].filter(Boolean).join("-") || "toy";
  for (let i = 0; i < 10; i++) {
    const slug = `${base}-${randomCode(4)}`;
    if (!db.slugExists(slug)) return slug;
  }
  return `${base}-${randomCode(10)}`;
}

const rawBody = express.raw({ type: () => true, limit: "11mb" });

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/config", (_req, res) => {
  const s = db.getSettings();
  res.json({
    brandName: s.brandName,
    instagram: s.instagram,
    telegram: s.telegram,
    phone: s.phone,
    packages: resolvePackages(s),
    templates: db.listTemplates(true),
  });
});

app.post(
  "/api/uploads",
  rateLimit("upload", 40, 10 * 60_000),
  rawBody,
  h(async (req, res) => {
    const kind = req.query.kind === "audio" ? "audio" : "image";
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ error: "Fayl topilmadi" });
    const stored = await storeUpload(req.body, [kind]);
    res.status(201).json({ url: stored.url });
  }),
);

app.post(
  "/api/orders",
  rateLimit("order", 10, 60 * 60_000),
  h((req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return validation(res, parsed.error);
    const { template, package: pkg, data, customer } = parsed.data;
    if (!db.isTemplateActive(template)) return res.status(400).json({ error: "Bu shablon hozircha mavjud emas" });

    const settings = db.getSettings();
    const price = settings.packages.find((p) => p.id === pkg)!.price;
    const id = randomCode(8).toUpperCase();
    const editKey = randomToken(24);
    const slug = uniqueSlug(data.groom, data.bride);
    db.createOrder({ id, slug, editKey, pkg, template, price, data: applyPackage(data, pkg), customer });

    notifyAdmin(
      `🆕 Yangi buyurtma #${id}\n${data.groom} & ${data.bride} — ${formatDateLong(data.date)}\n` +
        `Paket: ${pkg} (${formatPrice(price)})\nMijoz: ${customer.name}, ${customer.phone}` +
        (customer.telegram ? `, @${customer.telegram}` : ""),
    );
    res.status(201).json({ id, key: editKey, slug });
  }),
);

app.get("/api/orders/:id", (req, res) => {
  const order = ownedOrder(req, res);
  if (!order) return;
  const settings = db.getSettings();
  res.json({
    order,
    payment: {
      cardNumber: settings.cardNumber,
      cardHolder: settings.cardHolder,
      clickUrl: settings.clickUrl,
      paymeUrl: settings.paymeUrl,
      note: settings.paymentNote,
      telegram: settings.telegram,
    },
  });
});

app.put("/api/orders/:id", (req, res) => {
  const order = ownedOrder(req, res);
  if (!order) return;
  if (order.status === "cancelled") return res.status(409).json({ error: "Buyurtma bekor qilingan" });
  const parsed = updateOrderSchema.safeParse(req.body);
  if (!parsed.success) return validation(res, parsed.error);
  db.updateOrderData(order.id, parsed.data.template, applyPackage(parsed.data.data, order.package));
  res.json({ ok: true });
});

app.post(
  "/api/orders/:id/receipt",
  rateLimit("receipt", 10, 60 * 60_000),
  rawBody,
  h(async (req, res) => {
    const order = ownedOrder(req, res);
    if (!order) return;
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ error: "Rasm topilmadi" });
    const stored = await storeUpload(req.body, ["image"]);
    db.setReceipt(order.id, stored.url);
    notifyAdmin(`🧾 Chek yuklandi: #${order.id} (${order.data.groom} & ${order.data.bride}) — ${formatPrice(order.price)}`);
    res.json({ receipt: stored.url });
  }),
);

app.get("/api/orders/:id/rsvps", (req, res) => {
  const order = ownedOrder(req, res);
  if (!order) return;
  res.json({ rsvps: db.listRsvps(order.id) });
});

function publicOrder(slug: string) {
  const order = db.getOrderBySlug(slug);
  return order && order.status !== "cancelled" ? order : null;
}

app.get("/api/invites/:slug", (req, res) => {
  const order = publicOrder(req.params.slug);
  if (!order) return res.status(404).json({ error: "Taklifnoma topilmadi" });
  res.setHeader("Cache-Control", "no-cache");
  res.json({ invite: db.toPublicInvite(order) });
});

app.post("/api/invites/:slug/rsvp", rateLimit("rsvp", 8, 10 * 60_000), (req, res) => {
  const order = publicOrder(req.params.slug);
  if (!order) return res.status(404).json({ error: "Taklifnoma topilmadi" });
  if (order.status !== "active" || !PACKAGE_FLAGS[order.package].rsvp) {
    return res.status(403).json({ error: "Javob qabul qilinmaydi" });
  }
  const parsed = rsvpSchema.safeParse(req.body);
  if (!parsed.success) return validation(res, parsed.error);
  db.addRsvp(order.id, parsed.data);
  notifyAdmin(`💌 ${order.data.groom} & ${order.data.bride}: ${parsed.data.name} — ${parsed.data.attending ? "keladi" : "kela olmaydi"}`);
  res.status(201).json({ ok: true });
});

app.get("/api/invites/:slug/calendar.ics", (req, res) => {
  const order = publicOrder(req.params.slug);
  if (!order) return res.status(404).end();
  const d = order.data;
  const start = new Date(eventTimestamp(d.date, d.time));
  const end = new Date(start.getTime() + 4 * 3600_000);
  const stamp = (t: Date) => t.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Visol//Taklifnoma//UZ",
    "BEGIN:VEVENT",
    `UID:${order.slug}@visol`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`${d.groom} & ${d.bride} — ${EVENT_TYPES[d.eventType]}`)}`,
    `LOCATION:${esc([d.venue, d.address].filter(Boolean).join(", "))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${order.slug}.ics"`);
  res.send(ics);
});

/* ------------------------------------------------------------------ */
/* Admin API                                                           */
/* ------------------------------------------------------------------ */

app.post("/api/admin/login", rateLimit("login", 8, 15 * 60_000), (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!checkAdminPassword(password)) return res.status(401).json({ error: "Parol noto‘g‘ri" });
  issueAdminSession(res);
  res.json({ ok: true });
});

app.post("/api/admin/logout", (_req, res) => {
  clearAdminSession(res);
  res.json({ ok: true });
});

app.get("/api/admin/me", (req, res) => res.json({ admin: isAdmin(req) }));

app.use("/api/admin", requireAdmin);

app.get("/api/admin/stats", (_req, res) => res.json(db.orderStats()));

app.get("/api/admin/orders", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  res.json(db.listOrders({ status: String(req.query.status || "all"), q: String(req.query.q || "").slice(0, 60), limit, offset }));
});

app.get("/api/admin/orders/:id/rsvps", (req, res) => res.json({ rsvps: db.listRsvps(req.params.id) }));

const adminPatchSchema = z.object({
  status: z.enum(Object.keys(ORDER_STATUSES) as [keyof typeof ORDER_STATUSES, ...(keyof typeof ORDER_STATUSES)[]]).optional(),
  adminNote: z.string().max(1000).optional(),
});

app.patch("/api/admin/orders/:id", (req, res) => {
  const parsed = adminPatchSchema.safeParse(req.body);
  if (!parsed.success) return validation(res, parsed.error);
  const updated = db.adminUpdateOrder(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ error: "Topilmadi" });
  res.json({ order: updated.view });
});

app.get("/api/admin/orders/:id/edit-link", (req, res) => {
  const order = db.getOrderRaw(req.params.id);
  if (!order) return res.status(404).json({ error: "Topilmadi" });
  res.json({ url: `/buyurtma/${order.view.id}?k=${order.editKey}` });
});

app.delete("/api/admin/orders/:id", (req, res) => {
  if (!db.deleteOrder(req.params.id)) return res.status(404).json({ error: "Topilmadi" });
  res.json({ ok: true });
});

app.get("/api/admin/templates", (_req, res) => res.json({ templates: db.listTemplates(false) }));

const templatePatchSchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  tagline: z.string().trim().max(120).optional(),
  badge: z.string().trim().max(24).optional(),
  active: z.boolean().optional(),
  sort: z.number().int().min(0).max(999).optional(),
});

app.patch("/api/admin/templates/:id", (req, res) => {
  const parsed = templatePatchSchema.safeParse(req.body);
  if (!parsed.success) return validation(res, parsed.error);
  const updated = db.updateTemplate(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ error: "Topilmadi" });
  res.json({ template: updated });
});

app.get("/api/admin/settings", (_req, res) => res.json({ settings: db.getSettings() }));

app.put("/api/admin/settings", (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) return validation(res, parsed.error);
  db.saveSettings(parsed.data);
  res.json({ settings: parsed.data });
});

app.use("/api", (_req, res) => res.status(404).json({ error: "Topilmadi" }));

/* ------------------------------------------------------------------ */
/* Files                                                               */
/* ------------------------------------------------------------------ */

app.use(
  "/uploads",
  express.static(db.UPLOAD_DIR, {
    immutable: true,
    maxAge: "365d",
    index: false,
    setHeaders: (res) => res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'"),
  }),
);

/* ------------------------------------------------------------------ */
/* HTML with per-page social preview meta (Telegram / WhatsApp / IG)   */
/* ------------------------------------------------------------------ */

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function pageMeta(req: Request) {
  const brand = db.getSettings().brandName;
  const origin = process.env.APP_URL?.replace(/\/$/, "") || `${req.protocol}://${req.get("host")}`;
  let title = `${brand} — premium raqamli to‘y taklifnomalari`;
  let description =
    "Lenta bilan bog‘langan, qo‘lda ochiladigan 3D taklifnoma. Ortga sanoq, xarita, musiqa va mehmonlar javobi — 15 daqiqada tayyor.";
  let image = `${origin}/og/home.jpg`;

  const match = req.path.match(/^\/i\/([a-z0-9-]{3,60})$/);
  if (match) {
    const order = publicOrder(match[1]);
    if (order) {
      const d = order.data;
      title = `${d.groom} & ${d.bride} — ${EVENT_TYPES[d.eventType]}ga taklifnoma`;
      description = `${formatDateLong(d.date)}, ${formatWeekday(d.date, false)} · soat ${d.time} · ${d.venue}`;
      image = `${origin}/og/${order.template}.jpg`;
    }
  }
  const url = `${origin}${req.path}`;
  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(brand)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    /^\/(admin|buyurtma)/.test(req.path) ? `<meta name="robots" content="noindex" />` : "",
  ].join("\n    ");
}

async function start() {
  let renderHtml: (req: Request) => Promise<string>;

  if (isProd) {
    const dist = path.join(ROOT, "dist", "client");
    const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
    app.use(
      "/assets",
      express.static(path.join(dist, "assets"), { immutable: true, maxAge: "365d", index: false }),
    );
    app.use(express.static(dist, { index: false, maxAge: "7d" }));
    renderHtml = async (req) => template.replace("<!--app-meta-->", pageMeta(req));
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      root: ROOT,
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR === "1" ? false : undefined },
      appType: "custom",
    });
    app.use(vite.middlewares);
    renderHtml = async (req) => {
      const template = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      return html.replace("<!--app-meta-->", pageMeta(req));
    };
  }

  app.get(
    "*",
    h(async (req, res) => {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.send(await renderHtml(req));
    }),
  );

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof UploadError) return res.status(400).json({ error: err.message });
    if ((err as { type?: string })?.type === "entity.too.large") return res.status(413).json({ error: "Fayl hajmi juda katta" });
    console.error(err);
    res.status(500).json({ error: "Serverda xatolik yuz berdi" });
  });

  app.listen(PORT, () => console.log(`[visol] http://localhost:${PORT}`));
}

start();
