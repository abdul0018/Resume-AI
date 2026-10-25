import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./film.css";

/**
 * A pre-rendered opening film: the satin bow untied, the doors and the inner envelope opened. Closed, the
 * film's first frame is the poster, with the couple's names set on it in type, so one film serves every
 * couple. It ends one of two ways: it dissolves into the live scene waiting under it ("scene"), or the
 * camera moves into the card lying in its last frame until it fills the screen ("card").
 */
export interface FilmSpec {
  /** MP4 (H.264) — as a data: URI in the single-file showcase, or a URL. */
  src: string;
  /** The film's first frame. */
  poster: string;
  end?: "scene" | "card";
  /** For end "card": where the card lies in the film's last frame, as fractions of the frame. */
  card?: { x: number; y: number; w: number; h: number };
  /** Heights of the printed names and the hint on the closed card, as fractions of the frame. */
  names?: number;
  hint?: number;
  /** Height of an optional line set under the flowers (the date), as a fraction of the frame. */
  sub?: number;
  /** When things happen in the film (seconds), so the sounds land on them. */
  cues?: FilmCues;
  /** Playback speed: the films are generated slow and played a little faster (default 1). */
  rate?: number;
  /** For end "scene": seconds of film time before its end at which the live page starts to come in over it
      (a template may lay its mist and lettering above the film), default 0. */
  lead?: number;
  /** For end "scene": where the photograph and its roses lie in the film's last frame (frame pixels), so the
      live scene can be laid exactly over it and the film melt away without a seam. */
  scene?: FilmScene;
}

export interface FilmScene {
  frame: [number, number];
  photo: { x: number; y: number; w: number; h: number };
  sprays?: { w: number; l: [number, number]; r: [number, number] };
}

/** Maps a point and a length in the film's frame onto the screen, as the film is drawn (object-fit: cover). */
export function frameToScreen(scene: FilmScene, box: { w: number; h: number }) {
  const [fw, fh] = scene.frame;
  const s = Math.max(box.w / fw, box.h / fh);
  const ox = (box.w - fw * s) / 2;
  const oy = (box.h - fh * s) / 2;
  return { x: (x: number) => ox + x * s, y: (y: number) => oy + y * s, len: (l: number) => l * s };
}

export interface FilmCues {
  /** the knot gives */
  knot: number;
  /** the ribbon slides away */
  ribbon: number;
  /** each door swings */
  doors: [number, number];
  /** the inner flaps fold back */
  flaps: number;
  /** the film hands over */
  end: number;
}

type Films = Record<string, FilmSpec | null | undefined>;

/** The film's cues on the clock, at the speed it is played. */
export function filmCues(spec: FilmSpec): FilmCues | null {
  const c = spec.cues;
  if (!c) return null;
  const k = 1 / (spec.rate ?? 1);
  return { knot: c.knot * k, ribbon: c.ribbon * k, doors: [c.doors[0] * k, c.doors[1] * k], flaps: c.flaps * k, end: c.end * k };
}

/** A template's film, supplied by the build (showcase) or, for tests, set on the window before the page loads. */
export function filmSpec(template: string): FilmSpec | null {
  if (typeof window === "undefined") return null;
  const w = window as { __FILM_OVERRIDE__?: Films; __VISOL_FILMS__?: Films };
  const override = w.__FILM_OVERRIDE__;
  if (override && template in override) return override[template] ?? null;
  return w.__VISOL_FILMS__?.[template] ?? null;
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
/** Time the film's last frame takes to melt into the live scene laid exactly beneath it. */
const DISSOLVE_MS = 900;
/** If the film has not visibly started this long after the tap, the drawn envelope takes over. */
const START_GRACE_MS = 2500;
/** If the film stops moving this long part-way, it hands over where it is. */
const STALL_MS = 3000;

export function Film({
  spec,
  names,
  nameSize,
  sub,
  box,
  state,
  onOpen,
  onFail,
  onHandover,
  onDone,
}: {
  spec: FilmSpec;
  names: string;
  nameSize: number;
  /** A line set lower on the closed card, at `spec.sub` (the date). */
  sub?: string;
  box: { w: number; h: number };
  state: "closed" | "opening";
  /** Called inside the tap, so music and sound may start with it. */
  onOpen: () => void;
  /** The film cannot play here: the caller falls back to the drawn opening. */
  onFail: () => void;
  /** The live page beneath starts to show through. */
  onHandover: () => void;
  /** The film is gone; the live page has the screen. */
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

  const ended = useRef(false);
  const handed = useRef(false);
  const handOver = () => {
    if (handed.current) return;
    handed.current = true;
    onHandover();
  };
  const finish = () => {
    if (ended.current) return;
    ended.current = true;
    if (spec.end === "card" && spec.card) moveIn(spec.card);
    else {
      // the film dissolves into the live scene beneath it
      handOver();
      setHandover(true);
      timers.current.push(window.setTimeout(onDone, DISSOLVE_MS));
    }
  };

  /** Moves the camera so the card in the last frame fills the screen. */
  const moveIn = (c: NonNullable<FilmSpec["card"]>) => {
    const v = video.current;
    if (!v || zoom) return;
    const vw = v.videoWidth || 1080;
    const vh = v.videoHeight || 1920;
    // where the film sits on screen (object-fit: cover)
    const s = Math.max(box.w / vw, box.h / vh);
    const ox = (box.w - vw * s) / 2;
    const oy = (box.h - vh * s) / 2;
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
      window.setTimeout(() => {
        onHandover();
        setHandover(true);
      }, HANDOVER_MS),
      window.setTimeout(onDone, ZOOM_MS),
    );
  };

  const started = useRef(false);
  const lastMove = useRef(0);
  const failed = useRef(false);
  const fail = () => {
    if (failed.current || started.current) return;
    failed.current = true;
    onFail();
  };

  const start = () => {
    const v = video.current;
    if (!v || state !== "closed") return;
    onOpen();
    // some browsers neither play nor refuse (a codec they lack): give the film a moment, then hand back
    timers.current.push(window.setTimeout(fail, START_GRACE_MS));
    const rate = spec.rate ?? 1;
    v.defaultPlaybackRate = rate;
    v.playbackRate = rate;
    v.play().then(() => {
      // if "ended" never arrives, hand over anyway
      const ms = Number.isFinite(v.duration) ? (v.duration * 1000) / rate + 2500 : 15000;
      timers.current.push(window.setTimeout(finish, ms));
    }, fail);
  };

  // a film that stops part-way (a starved connection) hands over where it is rather than holding the guest
  useEffect(() => {
    if (state !== "opening") return;
    const id = window.setInterval(() => {
      if (started.current && !ended.current && performance.now() - lastMove.current > STALL_MS) finish();
    }, 500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div
      className="film"
      data-state={state}
      data-end={spec.end ?? "scene"}
      data-handover={handover || undefined}
      data-opener=""
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
        className="film-video"
        src={src}
        poster={spec.poster}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={finish}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.currentTime > 0.05) started.current = true;
          lastMove.current = performance.now();
          if (spec.lead && spec.end !== "card" && Number.isFinite(v.duration) && v.currentTime >= v.duration - spec.lead) handOver();
        }}
        onError={() => state === "opening" && fail()}
        style={zoom ?? undefined}
        data-zoom={zoom ? "" : undefined}
      />
      <p className="film-names" style={{ top: `${(spec.names ?? 0.35) * 100}%`, fontSize: nameSize }} aria-hidden="true">
        {names}
      </p>
      {sub && spec.sub !== undefined && (
        <p className="film-sub" style={{ top: `${spec.sub * 100}%` }} aria-hidden="true">
          {sub}
        </p>
      )}
      <p className="film-hint" style={{ top: `${(spec.hint ?? 0.8) * 100}%` }} aria-hidden="true">
        Ochish uchun bosing
      </p>
    </div>
  );
}
