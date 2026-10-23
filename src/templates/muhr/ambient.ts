/** Rose petals drifting down over the photograph, with soft motes of sunset light rising through it. */

interface Petal {
  x: number;
  y: number;
  vy: number;
  sway: number;
  swayAmp: number;
  phase: number;
  spin: number;
  angle: number;
  flip: number;
  size: number;
  tint: number;
}

interface Mote {
  x: number;
  y: number;
  vy: number;
  r: number;
  phase: number;
}

const TINTS = [
  ["#fff6ea", "#f1d9c2"],
  ["#fbe9dc", "#e9c3a8"],
  ["#fdf1e1", "#e6caa0"],
];

function moteSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 48;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
  grad.addColorStop(0, "rgba(255,246,220,0.9)");
  grad.addColorStop(0.35, "rgba(255,214,150,0.45)");
  grad.addColorStop(1, "rgba(255,200,120,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 48, 48);
  return c;
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  const [light, deep] = TINTS[p.tint];
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  // turning over in the air: the petal narrows as it shows its edge
  ctx.scale(Math.max(0.18, Math.abs(Math.cos(p.flip))), 1);
  const s = p.size;
  const g = ctx.createLinearGradient(0, -s, 0, s);
  g.addColorStop(0, light);
  g.addColorStop(1, deep);
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(90,55,25,0.18)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.9, -s * 0.7, s * 0.75, s * 0.55, 0, s);
  ctx.bezierCurveTo(-s * 0.75, s * 0.55, -s * 0.9, -s * 0.7, 0, -s);
  ctx.fill();
  ctx.restore();
}

export function startAmbient(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;
  const size = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();

  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const petal = (top: boolean): Petal => ({
    x: rand(0, w),
    y: top ? rand(-60, -10) : rand(0, h),
    vy: rand(0.45, 0.95),
    sway: rand(0.006, 0.014),
    swayAmp: rand(0.4, 1.1),
    phase: rand(0, Math.PI * 2),
    spin: rand(-0.012, 0.012),
    angle: rand(0, Math.PI * 2),
    flip: rand(0, Math.PI * 2),
    size: rand(5, 9.5),
    tint: Math.floor(rand(0, TINTS.length)),
  });
  const mote = (): Mote => ({ x: rand(0, w), y: rand(h * 0.35, h), vy: rand(0.12, 0.35), r: rand(6, 16), phase: rand(0, Math.PI * 2) });

  // the first petals are already in the air when the scene appears
  const petals = Array.from({ length: 11 }, (_, i) => petal(i > 4));
  const motes = Array.from({ length: 16 }, mote);
  const glow = moteSprite();

  let raf = 0;
  let last = performance.now();
  let tick = 0;
  let running = true;
  const frame = (now: number) => {
    const k = Math.min(3, (now - last) / 16.67);
    last = now;
    tick += k;
    ctx.clearRect(0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";
    for (const m of motes) {
      m.y -= m.vy * k;
      m.x += Math.sin(tick * 0.01 + m.phase) * 0.15 * k;
      if (m.y < h * 0.2) Object.assign(m, mote(), { y: h + 10 });
      const fade = Math.min(1, (m.y - h * 0.2) / (h * 0.25));
      ctx.globalAlpha = fade * (0.35 + 0.3 * Math.sin(tick * 0.03 + m.phase));
      ctx.drawImage(glow, m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.92;
    for (const p of petals) {
      p.y += p.vy * k;
      p.x += Math.sin(tick * p.sway + p.phase) * p.swayAmp * k;
      p.angle += p.spin * k;
      p.flip += 0.03 * k;
      if (p.y > h + 20) Object.assign(p, petal(true));
      drawPetal(ctx, p);
    }
    ctx.globalAlpha = 1;
    if (running) raf = requestAnimationFrame(frame);
  };

  // only animate while the photograph is on screen and the tab is visible
  const resume = () => {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? resume() : pause()));
  io.observe(canvas);
  const onVisibility = () => (document.hidden ? pause() : resume());
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", size);
  raf = requestAnimationFrame(frame);

  return () => {
    pause();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", size);
    ctx.clearRect(0, 0, w, h);
  };
}
