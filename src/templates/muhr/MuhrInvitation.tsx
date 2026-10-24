import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { EVENT_TYPES } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { eventTimestamp, formatDateLong, formatWeekday, initials, MONTHS, parseDate } from "@shared/format";
import { useCountdown, useMusic } from "@/lib/hooks";
import { defaultMessage, mapLinks } from "@/lib/invite";
import { copyText } from "@/lib/share";
import { playFilmSounds, playRibbonSounds, unlockAudio } from "@/lib/media";
import { startAmbient } from "./ambient";
import { startGoldDust } from "./goldDust";
import { LineArt, type LineArtKind } from "./LineArt";
import { archPath } from "./Ornaments";
import { SatinBow } from "./SatinBow";
import { Film, filmSpec, frameToScreen, type FilmScene, type FilmSpec } from "../film/Film";
import { ScratchCard } from "./ScratchCard";
import heroUrl from "./assets/hero.jpg";
import paperUrl from "./assets/paper.jpg";
import sealUrl from "./assets/seal.png";
import sprayUrl from "./assets/spray.jpg";
import ringsUrl from "./assets/rings.jpg";
import "./muhr.css";

type Stage = "closed" | "opening" | "scene";

/** "… to our wedding", with the possessive ending each ceremony name takes in Uzbek. */
const WELCOME: Record<keyof typeof EVENT_TYPES, string> = {
  nikoh: "Nikoh to‘yimizga",
  fotiha: "Fotiha to‘yimizga",
  unashtiruv: "Unashtiruv marosimimizga",
  qizbazmi: "Qiz bazmimizga",
};

/** "We invite you to our children's …" for the card, per ceremony. */
const INVITE_LINE: Record<keyof typeof EVENT_TYPES, string> = {
  nikoh: "Sizni farzandlarimizning nikoh to‘yiga taklif etamiz",
  fotiha: "Sizni farzandlarimizning fotiha to‘yiga taklif etamiz",
  unashtiruv: "Sizni farzandlarimizning unashtiruv marosimiga taklif etamiz",
  qizbazmi: "Sizni qizimizning bazmiga taklif etamiz",
};

/** Splits a caption into balanced lines: `head` words on their own, then the rest halved by length. */
function captionLines(text: string, head = 2) {
  const words = text.split(" ");
  const rest = words.slice(head);
  const total = rest.join(" ").length;
  let cut = 1;
  while (cut < rest.length - 1 && rest.slice(0, cut + 1).join(" ").length <= total / 2) cut++;
  return [words.slice(0, head).join(" "), rest.slice(0, cut).join(" "), rest.slice(cut).join(" ")].filter(Boolean);
}

/** Staggers the card's lines as it is laid down. */
const line = (i: number) => ({ ["--i" as string]: i });

/** A gold leaf sprig, as the card's marks. */
function CardSprig({ flip = false, className = "mh-card-sprig", style }: { flip?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} viewBox="0 0 40 20" style={{ ...style, transform: flip ? "scaleX(-1)" : undefined }} aria-hidden="true">
      <g fill="currentColor">
        <path d="M2,10 C12,10 24,10 38,10" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        {[10, 18, 26].map((x, k) => (
          <g key={x}>
            <path d="M0,0 C2,-3 6,-4 9,-3 C6,0 3,1 0,0Z" transform={`translate(${x} 10) rotate(${-24 + k * 4})`} />
            <path d="M0,0 C2,3 6,4 9,3 C6,0 3,-1 0,0Z" transform={`translate(${x + 3} 10) rotate(${24 - k * 4})`} />
          </g>
        ))}
        <circle cx="38" cy="10" r="1.3" />
      </g>
    </svg>
  );
}


/** The drawn envelope: milliseconds from the tap until the scene has the screen, and until the photograph
    starts to come through it (keep in sync with muhr.css). */
const TO_SCENE = 5100;
const DRAWN_T0 = 3700;

interface Props {
  data: InviteData;
  /** Changing this closes the envelope again. */
  replayToken?: number;
  /** Rendered after the closing section (showcase navigation). */
  endSlot?: ReactNode;
}

export function MuhrInvitation({ data, replayToken = 0, endSlot }: Props) {
  const [stage, setStage] = useState<Stage>("closed");
  // the photograph starts to come through: with the drawn envelope as it opens, with a film at its hand-over
  const [play, setPlay] = useState(false);
  const music = useMusic(data.music);
  // the rendered opening film, when one is supplied and motion is welcome; otherwise the drawn envelope
  const [film, setFilm] = useState<FilmSpec | null>(() =>
    typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? null : filmSpec("muhr"),
  );
  const heroRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const [box, setBox] = useState({ w: 390, h: 844 });

  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Replay: back to the sealed envelope
  const first = useRef(replayToken);
  useEffect(() => {
    if (replayToken === first.current) return;
    timers.current.forEach(clearTimeout);
    setStage("closed");
    setPlay(false);
    window.scrollTo(0, 0);
  }, [replayToken]);

  // The page stays put until the scene is revealed.
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = stage === "scene" ? "" : "hidden";
    if (stage !== "scene") window.scrollTo(0, 0);
    return () => {
      root.style.overflow = "";
    };
  }, [stage]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // the music coin steps back while the page moves under it
  const coin = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (stage !== "scene") return;
    let t = 0;
    const onScroll = () => {
      coin.current?.setAttribute("data-scrolling", "");
      window.clearTimeout(t);
      t = window.setTimeout(() => coin.current?.removeAttribute("data-scrolling"), 650);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
    };
  }, [stage]);

  /** The drawn envelope's opening: sounds and the hand-over are timed to its choreography. */
  const runDrawnOpening = () => {
    setPlay(true);
    playRibbonSounds();
    // a light touch, then the give of the knot as it slips
    navigator.vibrate?.([8, 920, 14]);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    timers.current = [window.setTimeout(() => setStage("scene"), reduce ? 450 : TO_SCENE)];
  };

  const open = () => {
    if (stage !== "closed") return;
    unlockAudio();
    music.play();
    setStage("opening");
    if (film) {
      navigator.vibrate?.(8);
      if (film.cues) playFilmSounds(film.cues);
    } else runDrawnOpening();
  };

  /** The film will not play here: the drawn envelope takes over from its first beat. */
  const filmFailed = () => {
    setFilm(null);
    runDrawnOpening();
  };

  const names = `${data.groom} & ${data.bride}`;

  return (
    <div className="mh">
      <div className="mh-col">
        <section
          ref={heroRef}
          className="mh-hero"
          data-stage={stage}
          data-play={play || undefined}
          data-film={film?.scene ? "" : undefined}
          style={{ ["--t0" as string]: `${film ? 0 : DRAWN_T0}ms` }}
          aria-label="Taklifnoma"
        >
          {/* the scene waits under the opening, which dissolves into it */}
          {stage !== "closed" && (
            <PhotoHero data={data} play={play} t0={film ? 0 : DRAWN_T0} fit={film?.scene ? { scene: film.scene, box } : undefined} />
          )}
          {stage !== "scene" &&
            (film ? (
              <Film
                spec={film}
                names={names}
                nameSize={Math.min(box.w * 0.13, (box.w * 2.1) / Math.max(names.length, 8))}
                box={box}
                state={stage}
                onOpen={open}
                onFail={filmFailed}
                onHandover={() => setPlay(true)}
                onDone={() => setStage("scene")}
              />
            ) : (
              <Envelope data={data} box={box} state={stage} onOpen={open} />
            ))}
        </section>

        {stage === "scene" && (
          <>
            <Sections data={data} />
            {endSlot}
          </>
        )}
      </div>

      {music.available && stage === "scene" && (
        <button type="button" ref={coin} className="mh-music" onClick={music.toggle} aria-label={music.playing ? "Musiqani to‘xtatish" : "Musiqani yoqish"}>
          {music.playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
              <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

/* ================================================================== */
/* Envelope                                                            */
/* ================================================================== */

/** The closed invitation as a thumbnail: the opening film's first frame with the names set on it, or the drawn envelope. */
export function ClosedCard({ data, box }: { data: InviteData; box: { w: number; h: number } }) {
  const film = filmSpec("muhr");
  if (!film) return <Envelope data={data} box={box} state="closed" interactive={false} />;
  const names = `${data.groom} & ${data.bride}`;
  return (
    <div className="film" aria-hidden="true">
      <img className="film-video" src={film.poster} alt="" />
      <p className="film-names" style={{ top: `${(film.names ?? 0.35) * 100}%`, fontSize: Math.min(box.w * 0.13, (box.w * 2.1) / Math.max(names.length, 8)) }}>
        {names}
      </p>
    </div>
  );
}

/** The owner's wax seal photograph with the couple's initials pressed into its centre in gold. */
export function Seal({ pair, size, className = "" }: { pair: [string, string]; size: number; className?: string }) {
  return (
    <span className={`mh-wax ${className}`} style={{ width: size, height: size * (585 / 560) }}>
      <img src={sealUrl} alt="" draggable={false} />
      <span className="mh-wax-mono" style={{ fontSize: size * 0.2 }}>
        <span>{pair[0]}</span>
        <i aria-hidden="true" />
        <span>{pair[1]}</span>
      </span>
    </span>
  );
}

/** The closed card's face: embossed paper, its folds, the names and the hint, printed across both doors. */
function DoorPrint({ names, nameSize, hint }: { names: string; nameSize: number; hint: boolean }) {
  return (
    <div className="mh-print">
      <svg className="mh-creases" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {["M0,0 L50,56 L0,100", "M100,0 L50,56 L100,100"].map((d) => (
          <g key={d} fill="none">
            <path d={d} stroke="rgba(255,253,246,0.95)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" transform="translate(0.35 0.2)" />
            <path d={d} stroke="rgba(120,92,52,0.42)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      <p className="mh-print-names" style={{ fontSize: nameSize }}>
        {names}
      </p>
      {hint && <p className="mh-print-tap">Lentani torting</p>}
    </div>
  );
}

/** Satin gives a little, then resists: displacement eases toward `max` however far the finger travels. */
const rubber = (d: number, max: number) => Math.sign(d) * max * (1 - 1 / (Math.abs(d) / (max * 1.8) + 1));
const DEG = 180 / Math.PI;

/**
 * A gatefold card tied with a satin bow. The guest taps it, or takes the ribbon and pulls: the bow
 * follows the finger under tension and springs back if let go early. Past the knot's give, one loop
 * slips through, the other follows, the satin flutters down and crumples, each door is lifted at its
 * edge and swung open, and the inner envelope's flaps fold back off the photograph.
 */
export function Envelope({
  data,
  box,
  state,
  onOpen,
  interactive = true,
}: {
  data: Pick<InviteData, "groom" | "bride">;
  box: { w: number; h: number };
  state: Exclude<Stage, "scene">;
  onOpen?: () => void;
  interactive?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef<HTMLDivElement>(null);
  const press = useRef<{ id: number; x: number; y: number; dx: number; dy: number } | null>(null);
  const [pull, setPull] = useState<"l" | "r">("r");
  const [touch, setTouch] = useState<{ x: number; y: number; n: number } | null>(null);
  const canOpen = interactive && state === "closed";
  const names = `${data.groom} & ${data.bride}`;
  const print = <DoorPrint names={names} nameSize={Math.min(box.w * 0.13, (box.w * 2.1) / Math.max(names.length, 8))} hint={interactive} />;

  /** Moves the bow toward the finger and lets the band's two halves follow its knot. */
  const tension = (dx: number, dy: number) => {
    const el = root.current;
    if (!el) return;
    const px = rubber(dx, 34);
    const py = rubber(dy, 26);
    const half = box.w / 2;
    const set = (k: string, v: string) => el.style.setProperty(k, v);
    set("--px", `${px}px`);
    set("--py", `${py}px`);
    set("--pr", `${px * 0.22}deg`);
    set("--bl", `${Math.atan2(py, half + px) * DEG}deg`);
    set("--br", `${-Math.atan2(py, half - px) * DEG}deg`);
    set("--bls", `${Math.hypot(half + px, py) / half}`);
    set("--brs", `${Math.hypot(half - px, py) / half}`);
    set("--tail", `${-px * 0.5}deg`);
    set("--tails", `${1 + Math.hypot(px, py) / 160}`);
  };

  const release = (open: boolean, dx: number) => {
    root.current?.removeAttribute("data-drag");
    tension(0, 0);
    if (!open) return;
    setPull(dx < -4 ? "l" : "r");
    onOpen?.();
  };

  const handlers = canOpen
    ? {
        onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
          if (press.current) return;
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.setPointerCapture(e.pointerId);
          press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
          setTouch((t) => ({ x: e.clientX - r.left, y: e.clientY - r.top, n: (t?.n ?? 0) + 1 }));
        },
        onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
          const p = press.current;
          if (!p || p.id !== e.pointerId) return;
          p.dx = e.clientX - p.x;
          p.dy = e.clientY - p.y;
          if (Math.hypot(p.dx, p.dy) > 8) root.current?.setAttribute("data-drag", "");
          tension(p.dx, p.dy);
        },
        onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => {
          const p = press.current;
          if (!p || p.id !== e.pointerId) return;
          press.current = null;
          const d = Math.hypot(p.dx, p.dy);
          // a tap opens; so does a pull past the knot's give; a short tug springs back
          release(d < 10 || d > 56, p.dx);
        },
        onPointerCancel: () => {
          press.current = null;
          release(false, 0);
        },
      }
    : {};

  const door = (side: "l" | "r") => (
    <div className={`mh-door mh-door-${side}`}>
      <div className="mh-dface front">{print}</div>
      <div className="mh-dface back" />
    </div>
  );
  const flap = (k: "t" | "b" | "l" | "r") => (
    <div className={`mh-iflap mh-iflap-${k}`}>
      <i className="mh-iface front" />
      <i className="mh-iface back" />
    </div>
  );
  const shade = (k: "t" | "b" | "l" | "r") => (
    <div className={`mh-ishade mh-ishade-${k}`}>
      <i />
    </div>
  );
  return (
    <div
      ref={root}
      className="mh-env"
      data-opener=""
      data-state={state}
      data-pull={pull}
      style={{
        ["--mh-art" as string]: `url("${paperUrl}")`,
        ["--bw" as string]: `${box.w}px`,
        ["--fall" as string]: `${Math.round(box.h * 0.38)}px`,
      }}
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      aria-label={canOpen ? "Lentani yechib, taklifnomani oching" : undefined}
      onKeyDown={(e) => {
        if (canOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen?.();
        }
      }}
      {...handlers}
    >
      <div className="mh-env-3d">
        {/* the inner envelope over the photograph: diamond gaps above and below the side flaps' tips */}
        <div className="mh-inner">
          {shade("t")}
          {shade("b")}
          {flap("t")}
          {flap("b")}
          {shade("l")}
          {shade("r")}
          {flap("l")}
          {flap("r")}
          <i className="mh-dshadow mh-dshadow-l" />
          <i className="mh-dshadow mh-dshadow-r" />
        </div>
        {door("l")}
        {door("r")}
        {touch && <i key={touch.n} className="mh-touch" style={{ left: touch.x, top: touch.y }} aria-hidden="true" />}
        {/* outer layers follow the finger; inner layers carry the untying, so a release never jumps */}
        <div className="mh-ribbon" aria-hidden="true">
          <div className="mh-band mh-band-l">
            <i />
          </div>
          <div className="mh-band mh-band-r">
            <i />
          </div>
          <div className="mh-bow">
            <div className="mh-bow-in">
              <SatinBow uid={uid} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* The invitation card                                                 */
/* ================================================================== */

/** The card's stock: the envelope's embossed paper with the scene's roses in two corners. */
function CardStock() {
  return (
    <>
      <img className="mh-card-spray tl" src={sprayUrl} alt="" aria-hidden="true" />
      <img className="mh-card-spray br" src={sprayUrl} alt="" aria-hidden="true" />
    </>
  );
}

const cardArt = { ["--mh-art" as string]: `url("${paperUrl}")` };

/** The card that was inside the envelope, laid on the page after the date has been scratched open. */
function InvitationCard({ data }: { data: InviteData }) {
  const { d, m, y } = parseDate(data.date);
  const month = MONTHS[m - 1];
  return (
    <section className="mh-sec mh-sec-card">
      <div className="mh-card mh-card--section" data-reveal="card" style={cardArt}>
        <CardStock />
          <div className="mh-card-text">
            {data.bismillah && (
              <p className="mh-bismillah" lang="ar" dir="rtl" style={line(0)}>
                بسم الله الرحمن الرحيم
              </p>
            )}
            <p className="mh-verse" style={line(1)}>
              <span>Va Uning alomatlaridan biri —</span>
              <span>sizlar uchun o‘zingizdan</span>
              <span>juftlar yaratgani, toki ular</span>
              <span>bilan orom topgaysiz.</span>
              <span className="mh-verse-ref">Rum surasi, 21-oyat</span>
            </p>
            <Divider className="mh-card-rule" i={2} />
            <p className="mh-card-caps" style={line(3)}>
              {captionLines(data.hosts || "Ota-onalari duosi bilan", 0).map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
            <p className="mh-card-name" style={line(4)}>
              {data.groom}
            </p>
            <p className="mh-card-with" style={line(5)}>
              <CardSprig />
              va
              <CardSprig flip />
            </p>
            <p className="mh-card-name" style={line(6)}>
              {data.bride}
            </p>
            <p className="mh-card-caps mh-card-invite" style={line(7)}>
              {captionLines(INVITE_LINE[data.eventType], 0).map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
            <Divider className="mh-card-rule" i={8} />
            <div className="mh-card-date" style={line(9)}>
              <span className="mh-cd-small">{formatWeekday(data.date)}</span>
              <span className="mh-cd-row">
                <span>{month}</span>
                <b>{d}</b>
                <span>{y}</span>
              </span>
              <span className="mh-cd-small">soat {data.time}</span>
            </div>
            <Divider className="mh-card-rule" i={10} />
            <p className="mh-card-venue" style={line(11)}>
              {data.venue}
            </p>
            {data.address && (
              <p className="mh-card-addr" style={line(12)}>
                {captionLines(data.address, 0).map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </p>
            )}
          </div>
      </div>
    </section>
  );
}

/**
 * Where the photograph and its two roses lie when a film's last frame shows the scene: the live scene is laid
 * exactly over the film so the film can melt away without a seam (sprays turn about their foot by ±12deg).
 */
function sceneLayout(scene: FilmScene, box: { w: number; h: number }) {
  const m = frameToScreen(scene, box);
  const p = scene.photo;
  // images are capped at their container's width by the base styles; these are laid wider on purpose
  const at = { right: "auto", bottom: "auto", maxWidth: "none" } as const;
  const photo: CSSProperties = { ...at, left: m.x(p.x), top: m.y(p.y), width: m.len(p.w), height: m.len(p.h) };
  if (!scene.sprays) return { photo };
  const w = m.len(scene.sprays.w);
  const h = (w * 1360) / 760;
  const place = ([cx, cy]: [number, number], deg: number): CSSProperties => {
    const t = (deg * Math.PI) / 180;
    const footX = m.x(cx) - (h / 2) * Math.sin(t);
    const footY = m.y(cy) + (h / 2) * Math.cos(t);
    return { ...at, left: footX - w / 2, top: footY - h, width: w };
  };
  return { photo, sprayL: place(scene.sprays.l, 12), sprayR: place(scene.sprays.r, -12) };
}

/**
 * The couple's photograph with the welcome set in its sky: the first screen once the card is open. It waits
 * under the opening; when `play` turns on, it comes into focus `t0` ms later and its lines are written in.
 * With `fit`, it is laid exactly where a film's last frame shows it, and needs no entrance of its own.
 */
function PhotoHero({
  data,
  play,
  t0,
  fit,
}: {
  data: InviteData;
  play: boolean;
  t0: number;
  fit?: { scene: FilmScene; box: { w: number; h: number } };
}) {
  const layout = fit ? sceneLayout(fit.scene, fit.box) : null;
  const petals = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = petals.current;
    if (!play || !c || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let stop = () => undefined as void;
    // with a film, the live petals take over from the film's own as it melts away
    const t = window.setTimeout(() => (stop = startAmbient(c)), t0 + (fit ? 300 : 1200));
    return () => {
      window.clearTimeout(t);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, t0]);
  const longest = Math.max(data.groom.length, data.bride.length, 5);
  const nameSize = `min(${Math.min(17, 110 / longest).toFixed(1)}vw, ${Math.min(80, 520 / longest).toFixed(0)}px)`;
  return (
    <>
      <img className="mh-photo" src={heroUrl} alt={`${data.groom} va ${data.bride}`} style={layout?.photo} />
      <div className="mh-photo-veil" aria-hidden="true" />
      <canvas ref={petals} className="mh-petals" aria-hidden="true" />
      <div className="mh-welcome-block">
        <p className="mh-line mh-welcome-small" style={{ ["--i" as string]: 0 }}>
          Xush kelibsiz
        </p>
        <p className="mh-line mh-welcome-script" style={{ ["--i" as string]: 1 }}>
          {WELCOME[data.eventType]}
        </p>
        <Divider className="mh-line" i={2} />
        <h1 className="mh-line mh-hero-name" style={{ ["--i" as string]: 3, fontSize: nameSize }}>
          {data.groom}
        </h1>
        <p className="mh-line mh-hero-name mh-hero-name-2" style={{ ["--i" as string]: 4, fontSize: nameSize }}>
          <span className="mh-amp">&amp;</span> {data.bride}
        </p>
      </div>
      <img className="mh-hero-spray l" src={sprayUrl} alt="" aria-hidden="true" style={layout?.sprayL} />
      <img className="mh-hero-spray r" src={sprayUrl} alt="" aria-hidden="true" style={layout?.sprayR} />
      <div className="mh-cue" aria-hidden="true">
        <span>Pastga suring</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </>
  );
}

/* ================================================================== */
/* Sections                                                            */
/* ================================================================== */

function Divider({ className = "", i }: { className?: string; i?: number }) {
  return (
    <div className={`mh-divider ${className}`} style={i === undefined ? undefined : { ["--i" as string]: i }} aria-hidden="true">
      <svg viewBox="0 0 220 20" width="220" height="20">
        <path d="M6,10 H86 M134,10 H214" stroke="currentColor" strokeWidth="0.9" />
        <path d="M86,10 C94,4 100,4 104,10 C100,16 94,16 86,10Z M134,10 C126,4 120,4 116,10 C120,16 126,16 134,10Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
        <path d="M110,3 L113,10 L110,17 L107,10Z" fill="currentColor" />
        <circle cx="4" cy="10" r="1.6" fill="currentColor" />
        <circle cx="216" cy="10" r="1.6" fill="currentColor" />
      </svg>
    </div>
  );
}

function Spark() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0 L9.6 6.4 L16 8 L9.6 9.6 L8 16 L6.4 9.6 L0 8 L6.4 6.4Z" fill="currentColor" />
    </svg>
  );
}

/** Chooses a timeline drawing from the event's wording. */
function artFor(title: string, index: number): LineArtKind | "rings" {
  const t = title.toLowerCase();
  if (/nikoh|fotiha|unashtiruv/.test(t)) return "rings";
  if (/kutib|kelish|xush/.test(t)) return "door";
  if (/ziyofat|dasturxon|osh|kechki/.test(t)) return "feast";
  if (/raqs|bazm|musiqa/.test(t)) return "doira";
  return (["door", "rings", "feast", "doira"] as const)[index % 4];
}

/** Marks each `[data-reveal]` element with `data-in` the first time it scrolls into view. */
function useReveal() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? []);
    const show = (el: Element) => el.setAttribute("data-in", "");
    if (!("IntersectionObserver" in window) || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return root;
}

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

function Sections({ data }: { data: InviteData }) {
  const message = data.message || defaultMessage(data);
  const [opened, setOpened] = useState(0);
  const { d, m, y } = parseDate(data.date);
  const month = MONTHS[m - 1];
  const root = useReveal();
  const burst = useRef<HTMLCanvasElement>(null);
  const row = useRef<HTMLDivElement>(null);

  // all three dates scratched: a shower of gold over the row
  useEffect(() => {
    const c = burst.current;
    const r = row.current;
    if (opened < 3 || !c || !r || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    return startGoldDust(c, { x: c.clientWidth / 2, y: r.offsetTop + r.offsetHeight / 2 }, 1600);
  }, [opened]);

  return (
    <div ref={root}>
      <section className="mh-sec mh-sec-date">
        <canvas ref={burst} className="mh-date-dust" aria-hidden="true" />
        <h2 className="mh-script-h" data-reveal="write">
          Sana
        </h2>
        <p className="mh-hint-line" data-reveal="up" style={delay(350)}>
          <Spark /> Sanani ko‘rish uchun qirib oching <Spark />
        </p>
        <div className="mh-scratch-row" ref={row} data-reveal="deal">
          <ScratchCard value={String(d)} label="Kun" onReveal={() => setOpened((n) => n + 1)} />
          <ScratchCard value={month[0].toUpperCase() + month.slice(1)} label="Oy" onReveal={() => setOpened((n) => n + 1)} />
          <ScratchCard value={String(y)} label="Yil" onReveal={() => setOpened((n) => n + 1)} />
        </div>
        <div className="mh-after-date" data-shown={opened >= 3}>
          <div className="mh-after-date-inner">
            <p className="mh-p mh-muted" style={{ fontStyle: "italic" }}>
              {formatWeekday(data.date)}, soat {data.time}
            </p>
            <Countdown date={data.date} time={data.time} />
          </div>
        </div>
      </section>


      <InvitationCard data={data} />

      {/* the section, not the roses, is observed: a fully clipped image never reports as visible */}
      <section className="mh-sec mh-sec-message" data-reveal="bloom">
        <img className="mh-side-spray l" src={sprayUrl} alt="" aria-hidden="true" />
        <img className="mh-side-spray r" src={sprayUrl} alt="" aria-hidden="true" style={delay(150)} />
        <h2 className="mh-script-h" data-reveal="write">
          Qadrli do‘stlar va yaqinlar
        </h2>
        <p className="mh-p mh-message" data-reveal="up" style={delay(500)}>
          {message}
        </p>
        {data.hosts && (
          <p className="mh-p mh-muted" data-reveal="up" style={{ marginTop: 22, fontStyle: "italic", ...delay(750) }}>
            Hurmat bilan, <span style={{ color: "var(--mh-ink)" }}>{data.hosts}</span>
          </p>
        )}
      </section>

      {data.program.length > 0 && (
        <section className="mh-sec mh-sec-time">
          <h2 className="mh-script-h" data-reveal="write">
            To‘y dasturi
          </h2>
          <Divider />
          <ol className="mh-timeline" data-reveal="line">
            {data.program.map((p, i) => {
              const art = artFor(p.title, i);
              return (
                <li key={`${p.time}${p.title}`} data-side={i % 2 ? "r" : "l"} data-reveal="step">
                  <div className="mh-tl-art">
                    {art === "rings" ? <img src={ringsUrl} alt="" aria-hidden="true" /> : <LineArt kind={art} />}
                  </div>
                  <span className="mh-tl-node" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      {[0, 60, 120, 180, 240, 300].map((a) => (
                        <ellipse key={a} cx="12" cy="6.5" rx="3" ry="5" transform={`rotate(${a} 12 12)`} fill="#fbf3e2" stroke="#b8924a" strokeWidth="0.9" />
                      ))}
                      <circle cx="12" cy="12" r="2.4" fill="#b8924a" />
                    </svg>
                  </span>
                  <div className="mh-tl-text">
                    <time>{p.time}</time>
                    <span>{p.title}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="mh-sec">
        <h2 className="mh-script-h" data-reveal="write">
          To‘yxona
        </h2>
        <p className="mh-h" data-reveal="up" style={{ marginTop: 6, ...delay(300) }}>
          {data.venue}
        </p>
        {data.address && <p className="mh-p mh-muted" style={{ marginTop: 10, fontSize: 16 }}>{data.address}</p>}
        {data.dressCode && (
          <p className="mh-p" style={{ marginTop: 10, fontSize: 15 }}>
            <span className="mh-muted">Kiyinish uslubi:</span> {data.dressCode}
          </p>
        )}
        <VenueMap data={data} />
      </section>

      <section className="mh-sec">
        <h2 className="mh-script-h" data-reveal="write">
          Javobingizni kutamiz
        </h2>
        <p className="mh-p mh-muted" style={{ marginTop: 6, fontSize: 16 }}>
          To‘y kunidan oldin tashrifingizni tasdiqlang.
        </p>
        <Rsvp />
      </section>

      {data.giftCardNumber && (
        <section className="mh-sec">
          <h2 className="mh-script-h" data-reveal="write">
            To‘yana
          </h2>
          <p className="mh-p mh-muted" data-reveal="up" style={{ marginTop: 6, fontSize: 16, ...delay(300) }}>
            Duolaringiz biz uchun eng qimmatli sovg‘a. To‘yana yubormoqchi bo‘lsangiz:
          </p>
          <GiftCard number={data.giftCardNumber} holder={data.giftCardHolder} />
        </section>
      )}

      <section className="mh-sec mh-sec-close">
        <div className="mh-stamp" data-reveal="stamp">
          <Seal pair={initials(data.groom, data.bride).split("") as [string, string]} size={112} className="mh-closing-seal" />
        </div>
        <p className="mh-script-h" data-reveal="write" style={{ marginTop: 18, ...delay(700) }}>
          Sizni intiqlik bilan kutamiz!
        </p>
        <p className="mh-closing-names" data-reveal="write" style={delay(1200)}>
          {data.groom} &amp; {data.bride}
        </p>
        <p className="mh-muted" style={{ marginTop: 10, fontSize: 14, letterSpacing: "0.18em" }}>
          {formatDateLong(data.date)}
        </p>
      </section>
    </div>
  );
}

/** The couple's card for wedding gifts, laid on the paper like a foil-stamped card, with a copy button. */
function GiftCard({ number, holder }: { number: string; holder?: string }) {
  const [copied, setCopied] = useState(false);
  const groups = number.match(/.{1,4}/g) ?? [number];
  const network = number.startsWith("9860") ? "HUMO" : number.startsWith("8600") || number.startsWith("5614") ? "UZCARD" : "";
  const copy = async () => {
    if (!(await copyText(number))) return;
    setCopied(true);
    navigator.vibrate?.(10);
    window.setTimeout(() => setCopied(false), 2200);
  };
  return (
    <div className="mh-gift" data-reveal="card">
      <div className="mh-gift-card">
        <span className="mh-gift-chip" aria-hidden="true" />
        {network && <span className="mh-gift-net">{network}</span>}
        <p className="mh-gift-number" aria-label={`Karta raqami ${groups.join(" ")}`}>
          {groups.map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </p>
        {holder && <p className="mh-gift-holder">{holder}</p>}
      </div>
      <button type="button" className="mh-btn mh-gift-copy" onClick={copy} aria-live="polite">
        {copied ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            Nusxa olindi
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="8" y="8" width="12" height="12" rx="2.5" />
              <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
            </svg>
            Karta raqamini nusxalash
          </>
        )}
      </button>
    </div>
  );
}

function Countdown({ date, time }: { date: string; time: string }) {
  const c = useCountdown(eventTimestamp(date, time));
  if (c.done) return <p className="mh-p" style={{ fontStyle: "italic" }}>Baxtli kun keldi!</p>;
  return (
    <div className="mh-tiles" role="timer" aria-label="To‘ygacha qolgan vaqt">
      {(
        [
          [c.days, "kun"],
          [c.hours, "soat"],
          [c.minutes, "daqiqa"],
          [c.seconds, "soniya"],
        ] as const
      ).map(([n, label]) => (
        <div key={label} className="mh-tile">
          <b>{String(n).padStart(2, "0")}</b>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

/** Stylised city map inside a pointed arch, with the venue pinned. */
function VenueMap({ data }: { data: InviteData }) {
  const links = mapLinks(data);
  const W = 300;
  const H = 360;
  const arch = archPath(W, H, 2);
  const roads = [
    { d: "M-20,250 C70,232 140,270 220,240 C270,222 300,232 330,220", w: 14 },
    { d: "M96,40 C104,140 88,230 120,380", w: 12 },
    { d: "M214,40 C206,130 230,210 218,380", w: 10 },
    { d: "M-20,150 C80,160 180,130 330,152", w: 8 },
    { d: "M-20,310 C90,300 200,326 330,300", w: 7 },
    { d: "M156,152 C160,190 152,214 158,248", w: 5 },
  ];
  const label = data.venue.length > 22 ? `${data.venue.slice(0, 21)}…` : data.venue;
  return (
    <div>
      <svg className="mh-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Xarita: ${data.venue}`} data-reveal="up">
        <defs>
          <clipPath id="mh-map-arch">
            <path d={arch} />
          </clipPath>
        </defs>
        <g clipPath="url(#mh-map-arch)">
          <rect width={W} height={H} fill="#fbf5e8" />
          <path d="M-20,190 C40,180 70,214 110,190 C140,172 150,160 176,174" fill="none" stroke="#e6d3a8" strokeWidth="12" strokeLinecap="round" />
          <rect x="168" y="168" width="40" height="52" rx="8" fill="#efe1c0" />
          {roads.map((r) => (
            <path key={`e${r.d}`} d={r.d} fill="none" stroke="#e6d6b6" strokeWidth={r.w + 2} strokeLinecap="round" />
          ))}
          {roads.map((r) => (
            <path key={`r${r.d}`} d={r.d} fill="none" stroke="#fffdf7" strokeWidth={r.w} strokeLinecap="round" />
          ))}
          <g transform="translate(150 206)">
            <ellipse cy="38" rx="15" ry="4.5" fill="#4a331b" opacity="0.18" />
            <circle r="24" fill="#d9b25f" opacity="0.18">
              <animate attributeName="r" values="12;30;12" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <g className="mh-pin">
              <path d="M0,36 C-6,24 -19,13 -19,0 A19,19 0 1 1 19,0 C19,13 6,24 0,36Z" fill="#a77a2c" />
              <circle r="6.5" fill="#fff7e6" />
            </g>
          </g>
          <g transform="translate(150 152)">
            <rect x={-(label.length * 4.4 + 18)} y="-16" width={label.length * 8.8 + 36} height="28" rx="14" fill="#fffcf5" stroke="#d8bf8a" />
            <text textAnchor="middle" y="3.5" fontSize="12.5" fill="#4a331b" fontFamily="'Bodoni Moda', Georgia, serif">
              {label}
            </text>
          </g>
        </g>
        <path d={arch} fill="none" stroke="#b08636" strokeWidth="1.4" />
        <path d={archPath(W, H, 8)} fill="none" stroke="#b08636" strokeWidth="0.6" />
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 330, margin: "22px auto 0" }}>
        <a className="mh-btn" href={links.google} target="_blank" rel="noopener noreferrer">
          Google Maps
        </a>
        <a className="mh-ghost" href={links.yandex} target="_blank" rel="noopener noreferrer">
          Yandex xarita
        </a>
      </div>
    </div>
  );
}

function Rsvp() {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Ismingizni yozing.");
    if (attending === null) return setError("Kelishingizni belgilang.");
    setError("");
    setState("sending");
    await new Promise((r) => setTimeout(r, 650));
    setState("done");
  };

  if (state === "done") {
    return (
      <div style={{ marginTop: 26 }}>
        <p style={{ fontFamily: "var(--mh-script)", fontSize: 46, lineHeight: 1, margin: 0, color: "#6a4818" }}>Rahmat!</p>
        <p className="mh-p" style={{ marginTop: 10, fontSize: 17 }}>
          {attending ? `${name.trim().split(" ")[0]}, sizni to‘yda ko‘rishdan xursand bo‘lamiz.` : "Javobingiz uchun rahmat. Duolaringiz biz bilan."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: "grid", gap: 10, marginTop: 24, textAlign: "left" }}>
      <label htmlFor="mh-name" className="mh-muted" style={{ fontSize: 14 }}>
        Ism va familiyangiz
      </label>
      <input id="mh-name" className="mh-field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
        <button type="button" className="mh-choice" aria-pressed={attending === true} onClick={() => setAttending(true)}>
          Albatta kelaman
        </button>
        <button type="button" className="mh-choice" aria-pressed={attending === false} onClick={() => setAttending(false)}>
          Kela olmayman
        </button>
      </div>
      {attending && (
        <div className="mh-field" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Necha kishi bo‘lasiz?</span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" className="mh-ghost" style={{ minHeight: 34, width: 34, padding: 0 }} onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Kamaytirish">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
            </button>
            <b style={{ minWidth: 16, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{guests}</b>
            <button type="button" className="mh-ghost" style={{ minHeight: 34, width: 34, padding: 0 }} onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="Ko‘paytirish">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </span>
        </div>
      )}
      <label htmlFor="mh-wish" className="mh-muted" style={{ fontSize: 14, marginTop: 4 }}>
        Kelin-kuyovga tilaklaringiz (ixtiyoriy)
      </label>
      <textarea id="mh-wish" className="mh-field" style={{ minHeight: 96, resize: "vertical" }} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} />
      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 14, color: "#9b3b22" }}>
          {error}
        </p>
      )}
      <button type="submit" className="mh-btn" style={{ marginTop: 6 }} disabled={state === "sending"}>
        {state === "sending" ? "Yuborilmoqda…" : "Javobni yuborish"}
      </button>
    </form>
  );
}
