/** Client-side image downscaling — keeps uploads small for guests on mobile data. */
export async function resizeImage(file: File, maxSide = 1600, quality = 0.84): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) && !/\.(jpe?g|png|webp|heic)$/i.test(file.name)) {
    throw new Error("Faqat rasm fayllarini yuklash mumkin");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Rasmni o‘qib bo‘lmadi. JPG yoki PNG formatini sinab ko‘ring."));
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Rasmni tayyorlab bo‘lmadi");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ------------------------------------------------------------------ */
/* Paper & ribbon sound effects synthesised with Web Audio (no files)  */
/* ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBurst(at: number, duration: number, freq: number, q: number, gain: number) {
  const ac = audio();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 1.5;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = ac.createGain();
  const t = ac.currentTime + at;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(t);
}

/** Satin slipping off, then two soft paper swishes for the doors. */
export function playOpeningSounds() {
  try {
    noiseBurst(0, 0.55, 3800, 0.7, 0.05);
    noiseBurst(0.7, 0.35, 1800, 0.9, 0.035);
    noiseBurst(1.2, 0.9, 1100, 0.6, 0.06);
    noiseBurst(1.42, 0.9, 900, 0.6, 0.05);
  } catch {
    /* sound is decorative */
  }
}

/** The same sounds, placed on an opening film's own moments (seconds into the film). */
export function playFilmSounds(c: { knot: number; ribbon: number; doors: [number, number]; flaps: number; end: number }) {
  try {
    noiseBurst(0.05, 0.18, 5200, 0.8, 0.02);
    noiseBurst(Math.max(0.2, c.knot - 0.7), 0.8, 4600, 0.6, 0.035);
    noiseBurst(c.knot, 0.3, 3600, 0.8, 0.045);
    noiseBurst(c.ribbon, 0.8, 2600, 0.5, 0.022);
    c.doors.forEach((t, i) => noiseBurst(t, 0.9, i ? 950 : 1100, 0.6, 0.05));
    noiseBurst(c.flaps, 0.8, 1500, 0.7, 0.03);
    [2349, 2794, 3136, 3729].forEach((f, i) => bell(c.end + i * 0.11, f, 0.011, 2.4));
  } catch {
    /* sound is decorative */
  }
}

/** Must be called synchronously inside a user gesture to unlock audio on iOS. */
export function unlockAudio() {
  audio();
}

function bell(at: number, freq: number, gain: number, decay: number) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + at;
  for (const [mult, amp] of [
    [1, 1],
    [2.76, 0.35],
    [5.4, 0.12],
  ] as const) {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain * amp, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay / mult);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + decay + 0.1);
  }
}

/** Satin drawn through its knot and slipping free, a light flutter down, two doors, the inner flaps, a soft chime. */
export function playRibbonSounds() {
  try {
    noiseBurst(0.05, 0.18, 5200, 0.8, 0.025);
    noiseBurst(0.3, 0.7, 4600, 0.6, 0.04);
    noiseBurst(0.92, 0.3, 3600, 0.8, 0.045);
    noiseBurst(1.15, 0.9, 2600, 0.5, 0.02);
    noiseBurst(2.45, 0.9, 1100, 0.6, 0.05);
    noiseBurst(2.85, 0.9, 950, 0.6, 0.045);
    noiseBurst(3.7, 0.7, 1500, 0.7, 0.028);
    // the chime as the camera arrives at the card
    [2349, 2794, 3136, 3729].forEach((f, i) => bell(6.2 + i * 0.11, f, 0.011, 2.4));
  } catch {
    /* sound is decorative */
  }
}
