import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_SETTINGS,
  DEFAULT_TEMPLATES,
  settingsSchema,
  type AdminOrder,
  type Customer,
  type InviteData,
  type OrderStatus,
  type OrderView,
  type PackageId,
  type PublicInvite,
  type RsvpEntry,
  type Settings,
  type TemplateId,
  type TemplateMeta,
} from "../shared/schema.ts";

export const DATA_DIR = path.resolve(process.env.DATA_DIR || "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, "visol.db"));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT '',
    badge TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    sort INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    edit_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    package TEXT NOT NULL,
    template TEXT NOT NULL,
    price INTEGER NOT NULL,
    data TEXT NOT NULL,
    customer TEXT NOT NULL,
    receipt TEXT,
    admin_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS orders_status ON orders(status, created_at);

  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    attending INTEGER NOT NULL,
    guests INTEGER NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS rsvps_order ON rsvps(order_id);
`);

/* Seed templates so admins can manage them from day one. */
const seedTemplate = db.prepare(
  "INSERT OR IGNORE INTO templates (id, name, tagline, badge, active, sort) VALUES (?, ?, ?, ?, ?, ?)",
);
for (const t of DEFAULT_TEMPLATES) seedTemplate.run(t.id, t.name, t.tagline, t.badge, t.active ? 1 : 0, t.sort);

const now = () => new Date().toISOString();

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export function getSettings(): Settings {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'main'").get() as { value: string } | undefined;
  if (!row) return DEFAULT_SETTINGS;
  const parsed = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...JSON.parse(row.value) });
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings) {
  db.prepare("INSERT INTO settings (key, value) VALUES ('main', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
    JSON.stringify(settings),
  );
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

type TemplateRow = { id: TemplateId; name: string; tagline: string; badge: string; active: number; sort: number };
const toTemplate = (r: TemplateRow): TemplateMeta => ({ ...r, active: r.active === 1 });

export function listTemplates(onlyActive: boolean): TemplateMeta[] {
  const rows = db
    .prepare(`SELECT * FROM templates ${onlyActive ? "WHERE active = 1" : ""} ORDER BY sort, id`)
    .all() as TemplateRow[];
  return rows.map(toTemplate);
}

export function updateTemplate(id: string, patch: Partial<Omit<TemplateMeta, "id">>) {
  const current = db.prepare("SELECT * FROM templates WHERE id = ?").get(id) as TemplateRow | undefined;
  if (!current) return null;
  const next = { ...toTemplate(current), ...patch };
  db.prepare("UPDATE templates SET name = ?, tagline = ?, badge = ?, active = ?, sort = ? WHERE id = ?").run(
    next.name,
    next.tagline,
    next.badge,
    next.active ? 1 : 0,
    next.sort,
    id,
  );
  return next;
}

export function isTemplateActive(id: string) {
  const row = db.prepare("SELECT active FROM templates WHERE id = ?").get(id) as { active: number } | undefined;
  return row?.active === 1;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

type OrderRow = {
  id: string;
  slug: string;
  edit_key: string;
  status: OrderStatus;
  package: PackageId;
  template: TemplateId;
  price: number;
  data: string;
  customer: string;
  receipt: string | null;
  admin_note: string;
  created_at: string;
  updated_at: string;
  rsvp_count?: number;
};

function toOrderView(r: OrderRow): OrderView {
  return {
    id: r.id,
    slug: r.slug,
    status: r.status,
    package: r.package,
    template: r.template,
    price: r.price,
    data: JSON.parse(r.data) as InviteData,
    customer: JSON.parse(r.customer) as Customer,
    receipt: r.receipt,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function toPublicInvite(o: OrderView): PublicInvite {
  return { slug: o.slug, template: o.template, package: o.package, status: o.status, data: o.data };
}

export function createOrder(input: {
  id: string;
  slug: string;
  editKey: string;
  pkg: PackageId;
  template: TemplateId;
  price: number;
  data: InviteData;
  customer: Customer;
}) {
  const ts = now();
  db.prepare(
    `INSERT INTO orders (id, slug, edit_key, status, package, template, price, data, customer, created_at, updated_at)
     VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    input.id,
    input.slug,
    input.editKey,
    input.pkg,
    input.template,
    input.price,
    JSON.stringify(input.data),
    JSON.stringify(input.customer),
    ts,
    ts,
  );
}

export function slugExists(slug: string) {
  return !!db.prepare("SELECT 1 FROM orders WHERE slug = ?").get(slug);
}

export function getOrderRaw(id: string) {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? { view: toOrderView(row), editKey: row.edit_key, adminNote: row.admin_note } : null;
}

export function getOrderBySlug(slug: string) {
  const row = db.prepare("SELECT * FROM orders WHERE slug = ?").get(slug) as OrderRow | undefined;
  return row ? toOrderView(row) : null;
}

export function updateOrderData(id: string, template: TemplateId, data: InviteData) {
  db.prepare("UPDATE orders SET template = ?, data = ?, updated_at = ? WHERE id = ?").run(template, JSON.stringify(data), now(), id);
}

export function setReceipt(id: string, receipt: string) {
  db.prepare(
    "UPDATE orders SET receipt = ?, status = CASE WHEN status = 'pending' THEN 'review' ELSE status END, updated_at = ? WHERE id = ?",
  ).run(receipt, now(), id);
}

export function adminUpdateOrder(id: string, patch: { status?: OrderStatus; adminNote?: string }) {
  const current = getOrderRaw(id);
  if (!current) return null;
  db.prepare("UPDATE orders SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?").run(
    patch.status ?? current.view.status,
    patch.adminNote ?? current.adminNote,
    now(),
    id,
  );
  return getOrderRaw(id);
}

export function deleteOrder(id: string) {
  return db.prepare("DELETE FROM orders WHERE id = ?").run(id).changes > 0;
}

export function listOrders(filter: { status?: string; q?: string; limit: number; offset: number }): {
  orders: AdminOrder[];
  total: number;
} {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filter.status && filter.status !== "all") {
    where.push("o.status = ?");
    params.push(filter.status);
  }
  if (filter.q) {
    where.push("(o.id LIKE ? OR o.slug LIKE ? OR o.data LIKE ? OR o.customer LIKE ?)");
    const like = `%${filter.q.replace(/[%_]/g, "")}%`;
    params.push(like, like, like, like);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM orders o ${clause}`).get(...params) as { n: number }).n;
  const rows = db
    .prepare(
      `SELECT o.*, (SELECT COUNT(*) FROM rsvps r WHERE r.order_id = o.id) AS rsvp_count
       FROM orders o ${clause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, filter.limit, filter.offset) as OrderRow[];
  return {
    total,
    orders: rows.map((r) => ({ ...toOrderView(r), adminNote: r.admin_note, rsvpCount: r.rsvp_count ?? 0 })),
  };
}

export function orderStats() {
  const rows = db.prepare("SELECT status, COUNT(*) AS n, SUM(price) AS sum FROM orders GROUP BY status").all() as {
    status: OrderStatus;
    n: number;
    sum: number | null;
  }[];
  const by = Object.fromEntries(rows.map((r) => [r.status, r])) as Partial<Record<OrderStatus, (typeof rows)[number]>>;
  return {
    total: rows.reduce((a, r) => a + r.n, 0),
    pending: (by.pending?.n ?? 0) + (by.review?.n ?? 0),
    review: by.review?.n ?? 0,
    active: by.active?.n ?? 0,
    revenue: by.active?.sum ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/* RSVPs                                                               */
/* ------------------------------------------------------------------ */

export function addRsvp(orderId: string, r: { name: string; attending: boolean; guests: number; message: string }) {
  db.prepare("INSERT INTO rsvps (order_id, name, attending, guests, message, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    orderId,
    r.name,
    r.attending ? 1 : 0,
    r.attending ? r.guests : 0,
    r.message,
    now(),
  );
}

export function listRsvps(orderId: string): RsvpEntry[] {
  const rows = db.prepare("SELECT * FROM rsvps WHERE order_id = ? ORDER BY created_at DESC").all(orderId) as {
    id: number;
    name: string;
    attending: number;
    guests: number;
    message: string;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    attending: r.attending === 1,
    guests: r.guests,
    message: r.message,
    createdAt: r.created_at,
  }));
}
