/**
 * Blind-embossed envelope paper, generated as one SVG data URI per size.
 * Every motif is paper-on-paper: the relief comes from a light/shadow filter, never ink.
 * One URI is shared by all four flap faces, so the browser rasterises it once.
 */

const RELIEF = "#fbf6ec";
const EDGE = "#ece0ca";

const PETAL = "M0,0 C-0.42,-0.16 -0.58,-0.78 -0.24,-0.98 C-0.09,-1.06 0.09,-1.06 0.24,-0.98 C0.58,-0.78 0.42,-0.16 0,0Z";
const LEAF = "M0,0 C0.24,-0.34 0.68,-0.38 1,0 C0.68,0.38 0.24,0.34 0,0Z";

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(2);

function rose(cx: number, cy: number, r: number, rot = 0) {
  const sw = f(0.9 / r);
  const ring = (n: number, scale: number, offset: number) =>
    Array.from({ length: n }, (_, i) => `<path d="${PETAL}" transform="rotate(${f((360 / n) * i + offset)}) scale(${scale})"/>`).join("");
  return (
    `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)}) scale(${f(r)})" fill="${RELIEF}" stroke="${EDGE}" stroke-width="${sw}">` +
    ring(8, 1, 0) +
    ring(6, 0.72, 22) +
    ring(5, 0.48, 40) +
    `<path d="M-0.22,0.02 C-0.2,-0.2 0.18,-0.24 0.22,0 C0.2,0.18 -0.08,0.22 -0.12,0.04 C-0.1,-0.08 0.08,-0.1 0.1,0.02" fill="none"/>` +
    `</g>`
  );
}

function leaf(x: number, y: number, s: number, rot: number) {
  const sw = f(0.9 / s);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})" stroke="${EDGE}" stroke-width="${sw}"><path d="${LEAF}" fill="${RELIEF}"/><path d="M0.06,0 L0.88,0" fill="none"/></g>`;
}

function bud(x: number, y: number, s: number, rot: number) {
  const sw = f(0.9 / s);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})" fill="${RELIEF}" stroke="${EDGE}" stroke-width="${sw}"><path d="M0,0 C-0.5,-0.4 -0.42,-1.1 0,-1.32 C0.42,-1.1 0.5,-0.4 0,0Z"/><path d="M0,0 C-0.45,-0.12 -0.6,-0.5 -0.46,-0.72 M0,0 C0.45,-0.12 0.6,-0.5 0.46,-0.72" fill="none"/></g>`;
}

function floret(x: number, y: number, s: number) {
  let out = `<g transform="translate(${f(x)} ${f(y)})" fill="${RELIEF}" stroke="${EDGE}" stroke-width="0.6">`;
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    out += `<circle cx="${f(Math.cos(a) * s * 0.62)}" cy="${f(Math.sin(a) * s * 0.62)}" r="${f(s * 0.46)}"/>`;
  }
  return out + `<circle r="${f(s * 0.3)}"/></g>`;
}

function stroke(d: string, width: number) {
  return `<path d="${d}" fill="none" stroke="${RELIEF}" stroke-width="${f(width)}" stroke-linecap="round"/>`;
}

/** Scroll curl: an S-curve ending in a small spiral, mirrored with sx = -1. */
function curl(x: number, y: number, s: number, sx = 1) {
  const p = (dx: number, dy: number) => `${f(x + dx * s * sx)},${f(y + dy * s)}`;
  return stroke(`M${p(0, 0)} C${p(0.35, -0.3)} ${p(0.75, -0.25)} ${p(1, 0.05)} C${p(1.2, 0.3)} ${p(0.95, 0.55)} ${p(0.75, 0.4)} C${p(0.6, 0.28)} ${p(0.72, 0.12)} ${p(0.86, 0.2)}`, 1.6);
}

export function envelopeArt(W: number, H: number) {
  const rand = rng(41);
  const u = Math.min(W, H * 0.55); // motif unit, stable across phone aspect ratios
  const parts: string[] = [];

  // Double embossed border
  parts.push(`<rect x="13" y="13" width="${f(W - 26)}" height="${f(H - 26)}" rx="3" fill="none" stroke="${RELIEF}" stroke-width="1.6"/>`);
  parts.push(`<rect x="19" y="19" width="${f(W - 38)}" height="${f(H - 38)}" rx="2" fill="none" stroke="${RELIEF}" stroke-width="0.9"/>`);

  // Top medallion — garland, three roses, leaves and buds
  const mx = W / 2;
  const my = H * 0.19;
  parts.push(stroke(`M${f(W * 0.16)},${f(my - u * 0.06)} C${f(W * 0.3)},${f(my + u * 0.16)} ${f(W * 0.7)},${f(my + u * 0.16)} ${f(W * 0.84)},${f(my - u * 0.06)}`, 1.8));
  parts.push(curl(W * 0.16, my - u * 0.06, u * 0.12, -1), curl(W * 0.84, my - u * 0.06, u * 0.12, 1));
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI + (i / 9) * Math.PI * 2;
    parts.push(leaf(mx + Math.cos(a) * u * 0.115, my + Math.sin(a) * u * 0.105, u * 0.085, (a * 180) / Math.PI));
  }
  parts.push(bud(mx, my - u * 0.13, u * 0.05, 0), bud(mx - u * 0.07, my - u * 0.12, u * 0.04, -28), bud(mx + u * 0.07, my - u * 0.12, u * 0.04, 28));
  for (const sx of [-1, 1]) {
    const cx = mx + sx * u * 0.2;
    const cy = my + u * 0.035;
    parts.push(leaf(cx + sx * u * 0.06, cy - u * 0.05, u * 0.065, sx > 0 ? -35 : -145), leaf(cx + sx * u * 0.07, cy + u * 0.04, u * 0.06, sx > 0 ? 25 : 155));
    parts.push(rose(cx, cy, u * 0.058, sx * 18));
    parts.push(floret(mx + sx * u * 0.33, my + u * 0.02, u * 0.018));
  }
  parts.push(rose(mx, my, u * 0.088, 8));

  // Bottom bouquet — fan of leaves, three roses, stems
  const bx = W / 2;
  const by = H * 0.835;
  for (let i = 0; i < 7; i++) {
    const a = -160 + i * (140 / 6);
    const rad = (a * Math.PI) / 180;
    parts.push(leaf(bx + Math.cos(rad) * u * 0.07, by + Math.sin(rad) * u * 0.06, u * 0.1, a));
  }
  parts.push(stroke(`M${f(bx)},${f(by + u * 0.05)} C${f(bx - u * 0.02)},${f(by + u * 0.12)} ${f(bx - u * 0.05)},${f(by + u * 0.16)} ${f(bx - u * 0.09)},${f(by + u * 0.19)}`, 1.5));
  parts.push(stroke(`M${f(bx)},${f(by + u * 0.05)} C${f(bx + u * 0.02)},${f(by + u * 0.12)} ${f(bx + u * 0.05)},${f(by + u * 0.16)} ${f(bx + u * 0.09)},${f(by + u * 0.19)}`, 1.5));
  for (const sx of [-1, 1]) {
    parts.push(rose(bx + sx * u * 0.13, by + u * 0.03, u * 0.05, sx * 30));
    parts.push(bud(bx + sx * u * 0.21, by - u * 0.03, u * 0.035, sx * 40));
    parts.push(curl(bx + sx * u * 0.26, by + u * 0.06, u * 0.1, sx));
  }
  parts.push(rose(bx, by, u * 0.072, -6));

  // Side vines with leaves and florets (mirrored)
  for (const side of [0, 1]) {
    const x0 = side ? W - W * 0.075 : W * 0.075;
    const amp = W * 0.028 * (side ? -1 : 1);
    const top = H * 0.12;
    const bot = H * 0.88;
    const step = H * 0.11;
    let d = `M${f(x0)},${f(top)}`;
    for (let y = top, k = 0; y < bot; y += step, k++) {
      const dir = k % 2 ? -1 : 1;
      d += ` C${f(x0 + amp * dir)},${f(y + step * 0.33)} ${f(x0 + amp * dir)},${f(y + step * 0.66)} ${f(x0)},${f(y + step)}`;
    }
    parts.push(stroke(d, 1.6));
    for (let y = top + step * 0.25, k = 0; y < bot; y += step * 0.5, k++) {
      const out = k % 2 ? 1 : -1;
      const lx = x0 + amp * 0.7 * (k % 4 < 2 ? 1 : -1);
      parts.push(leaf(lx, y, u * 0.045, (side ? 180 : 0) + out * 50 + (rand() - 0.5) * 16));
      if (k % 3 === 1) parts.push(floret(lx + (side ? -1 : 1) * u * 0.025, y + u * 0.02, u * 0.016));
    }
  }

  // Sprinkled florets on the open paper
  const spots: [number, number][] = [
    [0.3, 0.33],
    [0.7, 0.33],
    [0.22, 0.58],
    [0.78, 0.58],
    [0.36, 0.7],
    [0.64, 0.7],
    [0.5, 0.36],
    [0.5, 0.66],
  ];
  for (const [x, y] of spots) parts.push(floret(W * x, H * y, u * 0.013));

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs>` +
    `<filter id="e" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">` +
    `<feGaussianBlur in="SourceAlpha" stdDeviation="0.7" result="b"/>` +
    `<feOffset in="b" dx="-1" dy="-1" result="hl"/><feOffset in="b" dx="1.1" dy="1.3" result="sh"/>` +
    `<feFlood flood-color="#ffffff" flood-opacity="0.95"/><feComposite in2="hl" operator="in" result="hlc"/>` +
    `<feFlood flood-color="#8a6738" flood-opacity="0.32"/><feComposite in2="sh" operator="in" result="shc"/>` +
    `<feMerge><feMergeNode in="shc"/><feMergeNode in="hlc"/><feMergeNode in="SourceGraphic"/></feMerge>` +
    `</filter>` +
    `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>` +
    `<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0.07 0"/></filter>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" filter="url(#n)"/>` +
    `<g filter="url(#e)">${parts.join("")}</g>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
