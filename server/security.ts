import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const isProd = process.env.NODE_ENV === "production";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProd ? "" : "admin");
if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD environment variable is required in production");
}
if (!process.env.ADMIN_PASSWORD) console.warn("[visol] ADMIN_PASSWORD is not set — using development password 'admin'");

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.SESSION_SECRET) console.warn("[visol] SESSION_SECRET is not set — admin sessions reset on restart");

const SESSION_COOKIE = "visol_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function safeEqual(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const randomToken = (bytes: number) => crypto.randomBytes(bytes).toString("base64url");

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export function randomCode(length: number) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/* ------------------------------------------------------------------ */
/* Admin sessions (stateless HMAC-signed cookie)                       */
/* ------------------------------------------------------------------ */

function sign(payload: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

function readCookie(req: Request, name: string) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function checkAdminPassword(password: string) {
  return safeEqual(password, ADMIN_PASSWORD);
}

export function issueAdminSession(res: Response) {
  const payload = `admin.${Date.now() + SESSION_TTL_MS}`;
  const token = `${payload}.${sign(payload)}`;
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}${isProd ? "; Secure" : ""}`,
  );
}

export function clearAdminSession(res: Response) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0`);
}

export function isAdmin(req: Request) {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (!safeEqual(sig, sign(payload))) return false;
  const expires = Number(payload.split(".")[1]);
  return Number.isFinite(expires) && expires > Date.now();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAdmin(req)) return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
  next();
}

/* ------------------------------------------------------------------ */
/* Rate limiting (in-memory, per IP + bucket)                          */
/* ------------------------------------------------------------------ */

const hits = new Map<string, { count: number; reset: number }>();
setInterval(() => {
  const t = Date.now();
  for (const [k, v] of hits) if (v.reset < t) hits.delete(k);
}, 60_000).unref();

export function rateLimit(bucket: string, max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${bucket}:${req.ip}`;
    const t = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < t) {
      hits.set(key, { count: 1, reset: t + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.reset - t) / 1000));
      return res.status(429).json({ error: "Juda ko‘p so‘rov. Birozdan so‘ng urinib ko‘ring." });
    }
    next();
  };
}

/* ------------------------------------------------------------------ */
/* Security headers                                                    */
/* ------------------------------------------------------------------ */

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "media-src 'self' blob:",
        "connect-src 'self'",
        "frame-src https://www.google.com https://maps.google.com",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; "),
    );
  }
  next();
}
