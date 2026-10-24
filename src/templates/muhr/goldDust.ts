/** Gold dust on a canvas: a burst from the seal, then slow motes rising in the light. */

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  spark: boolean;
  phase: number;
}

function sprite(color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,245,1)");
  grad.addColorStop(0.22, color);
  grad.addColorStop(1, "rgba(255,200,100,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

export function startGoldDust(canvas: HTMLCanvasElement, origin: { x: number; y: number }, durationMs = 3600) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.scale(dpr, dpr);

  const glow = sprite("rgba(255,214,130,0.9)");
  const motes: Mote[] = [];
  const add = (burst: boolean) => {
    const a = burst ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
    const speed = burst ? 1.2 + Math.random() * 4.6 : 0.25 + Math.random() * 0.7;
    motes.push({
      x: origin.x + (burst ? 0 : (Math.random() - 0.5) * rect.width * 0.5),
      y: origin.y + (burst ? 0 : (Math.random() - 0.2) * rect.height * 0.25),
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0,
      max: burst ? 55 + Math.random() * 60 : 90 + Math.random() * 90,
      size: burst ? 2 + Math.random() * 4.5 : 1.5 + Math.random() * 3,
      spark: Math.random() < 0.22,
      phase: Math.random() * Math.PI * 2,
    });
  };
  for (let i = 0; i < 150; i++) add(true);

  const start = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const t = now - start;
    if (t < durationMs * 0.7 && t > 500) for (let i = 0; i < 3; i++) add(false);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.globalCompositeOperation = "lighter";
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.life++;
      m.vx *= 0.975;
      m.vy = m.vy * 0.975 + 0.012;
      m.x += m.vx;
      m.y += m.vy;
      const k = m.life / m.max;
      if (k >= 1) {
        motes.splice(i, 1);
        continue;
      }
      const alpha = Math.sin(k * Math.PI) * (0.65 + 0.35 * Math.sin(m.life * 0.3 + m.phase));
      ctx.globalAlpha = Math.max(0, alpha);
      const s = m.size * 4;
      ctx.drawImage(glow, m.x - s / 2, m.y - s / 2, s, s);
      if (m.spark) {
        ctx.fillStyle = "rgba(255,246,214,0.95)";
        const r = m.size * 1.8;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y - r);
        ctx.lineTo(m.x + r * 0.18, m.y);
        ctx.lineTo(m.x, m.y + r);
        ctx.lineTo(m.x - r * 0.18, m.y);
        ctx.closePath();
        ctx.moveTo(m.x - r, m.y);
        ctx.lineTo(m.x, m.y + r * 0.18);
        ctx.lineTo(m.x + r, m.y);
        ctx.lineTo(m.x, m.y - r * 0.18);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (t < durationMs || motes.length) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, rect.width, rect.height);
  };
}
