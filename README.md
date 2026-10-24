# Visol — premium raqamli to‘y taklifnomalari

Personalized digital wedding invitations for the Uzbek market, sold via Instagram.
Every invitation opens like a real luxury card: the satin bow unties, the corner flaps fold
along the creases, and the gatefold doors swing open in 3D to reveal the inner card.

## What's inside

| Area | What it does |
| --- | --- |
| **Homepage** `/` | Uzbek copy, a live tappable invitation in the hero (switch templates via swatches), how it works, template gallery, features, pricing, FAQ, sticky mobile CTA |
| **Live demos** `/namuna/:template` | Full-screen sample invitation for each template, with a "Shu shablonda yaratish" CTA |
| **Builder** `/yaratish` | 4-step wizard (design → details → photos & music → package & contact) with a live phone preview, draft autosave, validation, map-link parsing, client-side photo compression |
| **Order page** `/buyurtma/:id?k=…` | Payment instructions (card / Click / Payme), receipt upload, status tracker (auto-refreshes), share links, RSVP list, edit link |
| **Invitation** `/i/:slug` | The guest experience: 3D opening, music, greeting, calendar, live countdown, program, photo gallery, Google/Yandex maps, RSVP, add-to-calendar (.ics), share buttons; per-invite Telegram/WhatsApp preview image + title |
| **Admin** `/admin` | Orders (filter, search, receipt, activate/cancel, notes, RSVPs, client link, delete), templates (rename, tagline, badge, order, enable/disable), settings (brand, contacts, payment details, package prices/texts) |

### Templates

Six designs inspired by Uzbek craft, drawn procedurally in SVG (crisp, tiny, no image downloads):
**Rishton** (cobalt ceramics florals, silver ribbon), **Zumrad** (emerald + gold girih arch),
**Atlas** (Margilan ikat), **Suzani** (embroidered rosettes, burgundy ribbon),
**Oq oltin** (white, black ribbon, gold arch), **Samarqand tuni** (midnight + gold stars).

## Stack

- **Client:** React 19, TypeScript, Tailwind CSS 4, Vite. Pages are code-split; the guest invitation bundle stays small.
- **Animation:** pure CSS 3D transforms/keyframes (compositor-only) — smooth on low-end Android and in Instagram/Telegram in-app browsers. Opening sounds are synthesised with Web Audio; music starts inside the tap gesture (required by iOS).
- **Server:** Express + Node's built-in SQLite (`node:sqlite`), zod validation shared with the client.
- **Assets:** two original royalty-free background tracks in `public/music`, social preview images in `public/og`.

## Run locally

Requires **Node.js 22.13+**.

```bash
npm install
npm run dev            # http://localhost:3000 (admin password: "admin" in development)
```

## Production

```bash
npm run build
ADMIN_PASSWORD='long-secret' SESSION_SECRET="$(openssl rand -hex 32)" APP_URL=https://your-domain.uz npm start
```

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | **Required in production.** Password for `/admin` |
| `SESSION_SECRET` | Signs admin sessions (set it so logins survive restarts) |
| `APP_URL` | Public URL used for social previews and share links |
| `DATA_DIR` | Where the SQLite DB and uploads live (default `./data`) — put it on a persistent volume |
| `PORT` | Default `3000` |
| `TRUST_PROXY` | Express trust-proxy setting when behind a load balancer (default `loopback`) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` | Optional: Telegram notifications for new orders, receipts and RSVPs |

Serve behind HTTPS (e.g. Nginx/Caddy). Back up `DATA_DIR` regularly.

## Business workflow

1. A visitor from Instagram opens the site, taps the hero card, browses templates.
2. They build their invitation in `/yaratish` and confirm the order → they land on their private order page.
3. They pay (card / Click / Payme — set in **Admin → Sozlamalar**) and upload the receipt.
4. You get a Telegram notification (if configured), check the receipt in **Admin → Buyurtmalar**, press **Faollashtirish**.
5. The couple's link `/i/:slug` becomes live (before that it shows a "Namuna" badge); they share it via Telegram, WhatsApp, Instagram and see guest RSVPs on their order page.

## Security notes

- Order pages are protected by a random 192-bit key in the link; admin uses an HMAC-signed, `HttpOnly`, `SameSite=Strict` cookie.
- All input is validated with zod on the server; uploads are type-sniffed from magic bytes (images ≤ 6 MB, audio ≤ 10 MB) and served with a locked-down CSP.
- Rate limiting on orders, uploads, RSVPs and admin login; strict CSP, HSTS and other security headers in production.

## Tests

```bash
npm run lint           # TypeScript
npm run build
npm run test:e2e       # full customer journey in a mobile browser (Instagram user agent)
```

The end-to-end test starts its own server on a temporary database and covers: hero opening, demos,
builder validation, photo upload, ordering, receipt upload, social meta tags, admin login/activation,
template toggling, price settings, guest RSVP, calendar export, editing and basic security checks.
