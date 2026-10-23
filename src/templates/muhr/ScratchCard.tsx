import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/** Paints a square of brushed gold foil with soft glints. */
function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#b8893a");
  g.addColorStop(0.28, "#f3dc9c");
  g.addColorStop(0.5, "#c99a4c");
  g.addColorStop(0.72, "#f6e4ae");
  g.addColorStop(1, "#a77a2c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // brushed grain
  for (let i = 0; i < h; i += 2) {
    ctx.fillStyle = `rgba(255,248,220,${0.05 + Math.random() * 0.06})`;
    ctx.fillRect(0, i, w, 1);
  }
  for (let i = 0; i < (w * h) / 40; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? "rgba(120,82,24,0.10)" : "rgba(255,250,230,0.16)";
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
  const glint = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, w * 0.6);
  glint.addColorStop(0, "rgba(255,252,236,0.75)");
  glint.addColorStop(1, "rgba(255,252,236,0)");
  ctx.fillStyle = glint;
  ctx.fillRect(0, 0, w, h);
}

/**
 * A card whose gold foil is scratched away with a finger or mouse to reveal its value.
 * Keyboard: Enter or Space reveals it at once.
 */
export function ScratchCard({ value, label, onReveal }: { value: string; label: string; onReveal: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = c.getBoundingClientRect();
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    paintFoil(ctx, width, height);
  }, []);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    onReveal();
  };

  const clearedShare = () => {
    const c = canvas.current!;
    const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++;
      if (data[i] < 40) clear++;
    }
    return clear / total;
  };

  const scratch = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current;
    if (!c || revealed) return;
    const r = c.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = r.width * 0.3;
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 6 === 0 && clearedShare() > 0.5) reveal();
  };

  return (
    <div className="mh-scratch">
      <div
        className="mh-scratch-card"
        data-revealed={revealed}
        tabIndex={revealed ? -1 : 0}
        role="button"
        aria-label={revealed ? `${label}: ${value}` : `${label} — qirib oching`}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            reveal();
          }
        }}
      >
        <span className="mh-scratch-value">{value}</span>
        <canvas
          ref={canvas}
          className="mh-scratch-foil"
          aria-hidden="true"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = null;
            scratch(e);
          }}
          onPointerMove={(e) => e.buttons && scratch(e)}
          onPointerUp={() => (last.current = null)}
        />
      </div>
      <span className="mh-scratch-label">{label}</span>
    </div>
  );
}
