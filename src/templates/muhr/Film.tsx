import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * A pre-rendered opening film: the satin bow untied, the doors and the inner envelope opened, ending on the
 * card lying in the open envelope. When it ends, the camera moves into that card until it fills the screen,
 * and the live card (CardHero) takes over under it. Closed, the film's first frame is the poster, with the
 * couple's names set on it in type, so one film serves every couple.
 */
export interface FilmSpec {
  /** MP4 (H.264) — as a data: URI in the single-file showcase, or a URL. */
  src: string;
  /** The film's first frame. */
  poster: string;
  /** Where the card lies in the film's last frame, as fractions of the frame. */
  card: { x: number; y: number; w: number; h: number };
  /** Height of the printed names on the closed card, as a fraction of the frame (default 0.35). */
  names?: number;
}

/** A film supplied by the build (showcase) or, for tests, set on the window before the page loads. */
export function filmSpec(): FilmSpec | null {
  const w = window as { __MUHR_FILM__?: FilmSpec; __VISOL_FILM__?: FilmSpec };
  return w.__MUHR_FILM__ ?? w.__VISOL_FILM__ ?? null;
}

/** iOS will not play a <video> from a data: URI, but it will from a blob: URL made of the same bytes. */
function playableSrc(src: string) {
  const m = /^data:([^;]+);base64,(.*)$/.exec(src);
  if (!m) return src;
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: m[1] }));
}

/** Time the camera takes to move into the card, and when the live card starts to show through. */
const ZOOM_MS = 1500;
const HANDOVER_MS = 1050;

export function Film({
  spec,
  names,
  nameSize,
  box,
  state,
  onOpen,
  onFail,
  onDone,
}: {
  spec: FilmSpec;
  names: string;
  nameSize: number;
  box: { w: number; h: number };
  state: "closed" | "opening";
  /** Called inside the tap, so music and sound may start with it. */
  onOpen: () => void;
  /** The film cannot play here: the caller falls back to the drawn opening. */
  onFail: () => void;
  /** The camera has arrived at the card. */
  onDone: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [src] = useState(() => playableSrc(spec.src));
  const [zoom, setZoom] = useState<CSSProperties | null>(null);
  const [handover, setHandover] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (src.startsWith("blob:")) URL.revokeObjectURL(src);
    },
    [src],
  );

  /** Moves the camera so the card in the last frame fills the screen. */
  const moveIn = () => {
    const v = video.current;
    if (!v || zoom) return;
    const vw = v.videoWidth || 1080;
    const vh = v.videoHeight || 1920;
    // where the film sits on screen (object-fit: cover)
    const s = Math.max(box.w / vw, box.h / vh);
    const ox = (box.w - vw * s) / 2;
    const oy = (box.h - vh * s) / 2;
    const c = spec.card;
    const cw = c.w * vw * s;
    const ch = c.h * vh * s;
    const cx = ox + (c.x * vw + (c.w * vw) / 2) * s;
    const cy = oy + (c.y * vh + (c.h * vh) / 2) * s;
    const z = Math.max(box.w / cw, box.h / ch);
    setZoom({
      transformOrigin: `${cx}px ${cy}px`,
      transform: `translate(${box.w / 2 - cx}px, ${box.h / 2 - cy}px) scale(${z})`,
    });
    timers.current.push(
      window.setTimeout(() => setHandover(true), HANDOVER_MS),
      window.setTimeout(onDone, ZOOM_MS),
    );
  };

  const start = () => {
    const v = video.current;
    if (!v || state !== "closed") return;
    onOpen();
    v.play().then(
      () => {
        // if "ended" never arrives (a stalled stream), move in anyway
        const ms = Number.isFinite(v.duration) ? v.duration * 1000 + 2500 : 15000;
        timers.current.push(window.setTimeout(moveIn, ms));
      },
      onFail,
    );
  };

  return (
    <div
      className="mh-film"
      data-state={state}
      data-handover={handover || undefined}
      role={state === "closed" ? "button" : undefined}
      tabIndex={state === "closed" ? 0 : undefined}
      aria-label={state === "closed" ? "Taklifnomani ochish" : undefined}
      onClick={start}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          start();
        }
      }}
    >
      <video
        ref={video}
        className="mh-film-video"
        src={src}
        poster={spec.poster}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={moveIn}
        onError={() => state === "opening" && onFail()}
        style={zoom ?? undefined}
        data-zoom={zoom ? "" : undefined}
      />
      <p className="mh-film-names" style={{ top: `${(spec.names ?? 0.35) * 100}%`, fontSize: nameSize }} aria-hidden="true">
        {names}
      </p>
      <p className="mh-film-hint" aria-hidden="true">
        Ochish uchun bosing
      </p>
    </div>
  );
}
