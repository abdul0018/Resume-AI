import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { EVENT_TYPES } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { eventTimestamp, formatDateDots, formatWeekday, MONTHS, parseDate } from "@shared/format";
import { useCountdown, useMusic } from "@/lib/hooks";
import { defaultMessage, mapLinks } from "@/lib/invite";
import { copyText } from "@/lib/share";
import { playFilmSounds, unlockAudio } from "@/lib/media";
import { startAmbient } from "../muhr/ambient";
import { Film, filmCues, filmSpec, frameToScreen, type FilmScene, type FilmSpec } from "../film/Film";
import { BlossomMark, FlowerLine, FlowerSpray, HeartRule, Icon, iconFor, SilkBow, Sprig } from "./Botanicals";
import { GardenMap } from "./GardenMap";
import "./gulzor.css";

/*
 * Gulzor — a garden wedding in cream, sage and blush: white garden roses, script names, thin line icons and
 * soft wave-edged panels. The closed card is tied with a line of fresh flowers; opened, it gives onto the
 * garden arch.
 */

type Stage = "closed" | "opening" | "scene";

/**
 * The template's photographs, found by name in ./assets (any of jpg, png, webp): hero, bouquet, blossoms-top,
 * blossoms-bottom, roses, table, map. Until one is supplied its place is drawn.
 */
const FILES = import.meta.glob<string>("./assets/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" });
const art = (name: string) => Object.entries(FILES).find(([p]) => p.slice(p.lastIndexOf("/") + 1).replace(/\.\w+$/, "") === name)?.[1];

/** The closed card's title and the hero's invitation line, per ceremony. */
const KICKER: Record<keyof typeof EVENT_TYPES, [string, string]> = {
  nikoh: ["To‘yga", "taklifnoma"],
  fotiha: ["Fotiha to‘yiga", "taklifnoma"],
  unashtiruv: ["Unashtiruvga", "taklifnoma"],
  qizbazmi: ["Qiz bazmiga", "taklifnoma"],
};
const INVITE: Record<keyof typeof EVENT_TYPES, [string, string]> = {
  nikoh: ["Sizni to‘yimizga", "taklif etamiz"],
  fotiha: ["Sizni fotiha to‘yimizga", "taklif etamiz"],
  unashtiruv: ["Sizni unashtiruv", "marosimimizga chorlaymiz"],
  qizbazmi: ["Sizni qiz bazmimizga", "taklif etamiz"],
};

/** The dress-code palette: the invitation's own colours. */
const PALETTE = [
  ["#a9b49b", "zaytun"],
  ["#bdb491", "xaki"],
  ["#dcaca5", "gulobi"],
  ["#efe7d9", "krem"],
  ["#e9bdb6", "pushti"],
] as const;

/** The drawn opening: when the photograph starts to show through, and when the scene has the screen. */
const DRAWN_T0 = 2500;
const TO_SCENE = 4500;

const v = (k: string, val: string | number) => ({ [k]: val }) as CSSProperties;

interface Props {
  data: InviteData;
  /** Changing this closes the card again. */
  replayToken?: number;
  /** Rendered after the closing section (showcase navigation). */
  endSlot?: ReactNode;
}

export function GulzorInvitation({ data, replayToken = 0, endSlot }: Props) {
  const [stage, setStage] = useState<Stage>("closed");
  const [play, setPlay] = useState(false);
  const music = useMusic(data.music);
  const [film, setFilm] = useState<FilmSpec | null>(() =>
    typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? null : filmSpec("gulzor"),
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

  const first = useRef(replayToken);
  useEffect(() => {
    if (replayToken === first.current) return;
    timers.current.forEach(clearTimeout);
    setStage("closed");
    setPlay(false);
    window.scrollTo(0, 0);
  }, [replayToken]);

  // the page stays put until the garden is revealed
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = stage === "scene" ? "" : "hidden";
    if (stage !== "scene") window.scrollTo(0, 0);
    return () => {
      root.style.overflow = "";
    };
  }, [stage]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // the music button steps back while the page moves under it
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

  /** The drawn card's opening: its sounds and the hand-over follow its choreography (gulzor.css). */
  const runDrawnOpening = () => {
    setPlay(true);
    playFilmSounds({ knot: 0.4, ribbon: 0.75, doors: [1.4, 1.65], flaps: 2.8, end: 3.7 });
    navigator.vibrate?.([8, 380, 10]);
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
      const cues = filmCues(film);
      if (cues) playFilmSounds(cues);
    } else runDrawnOpening();
  };

  const filmFailed = () => {
    setFilm(null);
    runDrawnOpening();
  };

  const names = `${data.groom} & ${data.bride}`;

  return (
    <div className="gz">
      <div className="gz-col">
        <section
          ref={heroRef}
          className="gz-hero"
          data-stage={stage}
          data-play={play || undefined}
          data-film={film ? "" : undefined}
          style={v("--t0", `${film ? 0 : DRAWN_T0}ms`)}
          aria-label="Taklifnoma"
        >
          {stage !== "closed" && <GardenHero data={data} play={play} t0={film ? 0 : DRAWN_T0} fit={film?.scene ? { scene: film.scene, box } : undefined} />}
          {stage !== "scene" &&
            (film ? (
              <Film
                spec={film}
                names={names}
                sub={formatDateDots(data.date)}
                nameSize={Math.min(box.w * 0.12, (box.w * 1.9) / Math.max(names.length, 8))}
                box={box}
                state={stage}
                onOpen={open}
                onFail={filmFailed}
                onHandover={() => setPlay(true)}
                onDone={() => setStage("scene")}
              />
            ) : (
              <GardenCard data={data} box={box} state={stage} onOpen={open} />
            ))}
        </section>

        {stage === "scene" && (
          <>
            <Sections data={data} endSlot={endSlot} />
          </>
        )}
      </div>

      {music.available && stage === "scene" && (
        <button type="button" ref={coin} className="gz-music" onClick={music.toggle} aria-label={music.playing ? "Musiqani to‘xtatish" : "Musiqani yoqish"}>
          {music.playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6.5" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" />
              <rect x="14.1" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

/* ================================================================== */
/* The closed card                                                     */
/* ================================================================== */

/** The closed invitation as a thumbnail: the film's first frame with the names set on it, or the drawn card. */
export function GulzorClosed({ data, box }: { data: InviteData; box: { w: number; h: number } }) {
  const film = filmSpec("gulzor");
  if (!film) return <GardenCard data={data} box={box} state="closed" interactive={false} />;
  const names = `${data.groom} & ${data.bride}`;
  return (
    <div className="film" aria-hidden="true">
      <img className="film-video" src={film.poster} alt="" />
      <p className="film-names" style={{ top: `${(film.names ?? 0.3) * 100}%`, fontSize: Math.min(box.w * 0.12, (box.w * 1.9) / Math.max(names.length, 8)) }}>
        {names}
      </p>
      {film.sub !== undefined && (
        <p className="film-sub" style={{ top: `${film.sub * 100}%`, fontSize: Math.max(8, box.w * 0.043) }}>
          {formatDateDots(data.date)}
        </p>
      )}
    </div>
  );
}

/** What is printed on the closed card, across both doors: each door shows its own half. */
function CardPrint({ data, box }: { data: InviteData; box: { w: number; h: number } }) {
  const longest = Math.max(data.groom.length, data.bride.length, 5);
  const size = Math.min(box.w * 0.15, (box.w * 0.62) / (longest * 0.5));
  const [k1, k2] = KICKER[data.eventType];
  const [i1, i2] = INVITE[data.eventType];
  return (
    <div className="gz-print">
      <p className="gz-print-kick">
        {k1} {k2}
      </p>
      <p className="gz-print-names" style={{ fontSize: size }}>
        <span>{data.groom}</span>
        <span className="gz-print-and">va</span>
        <span>{data.bride}</span>
      </p>
      <p className="gz-print-invite">
        {i1}
        <br />
        {i2}
      </p>
      <p className="gz-print-date">{formatDateDots(data.date)}</p>
      <p className="gz-print-mark" aria-hidden="true">
        <i />
        <BlossomMark size={Math.max(8, box.w * 0.032)} />
        <i />
      </p>
    </div>
  );
}

/** Petals shaken loose as the flower line parts: where each starts (% across), its drift and its turn. */
const FALL = [
  [36, -34, 220],
  [42, -12, 300],
  [46, 14, -260],
  [49, -6, 200],
  [53, 28, -320],
  [57, 8, 240],
  [61, 36, -200],
  [40, 20, 280],
] as const;

/**
 * The drawn opening: a cream gatefold lying on sage linen, closed by a line of white garden flowers tied with
 * a silk bow. On the tap the bow slips, the line parts and slides away, the doors swing open onto the garden
 * photograph inside, and the camera moves down into it.
 */
export function GardenCard({
  data,
  box,
  state,
  onOpen,
  interactive = true,
}: {
  data: InviteData;
  box: { w: number; h: number };
  state: Exclude<Stage, "scene">;
  onOpen?: () => void;
  interactive?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const canOpen = interactive && state === "closed";
  const print = <CardPrint data={data} box={box} />;
  return (
    <div
      className="gz-env"
      data-opener=""
      data-state={state}
      data-thumb={interactive ? undefined : ""}
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      aria-label={canOpen ? "Taklifnomani ochish" : undefined}
      onClick={() => canOpen && onOpen?.()}
      onKeyDown={(e) => {
        if (canOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen?.();
        }
      }}
    >
      <div className="gz-env-stage">
        <div className="gz-linen" aria-hidden="true" />
        <div className="gz-card-edge" aria-hidden="true" />
        {(["l", "r"] as const).map((s) => (
          <div key={s} className={`gz-door gz-door-${s}`} aria-hidden="true">
            <div className="gz-dface front">{print}</div>
            <div className="gz-dface back" />
          </div>
        ))}
        {(["l", "r"] as const).map((s) => (
          <div key={s} className={`gz-fline gz-fline-${s}`} aria-hidden="true">
            <FlowerLine uid={`${uid}${s}`} side={s} />
          </div>
        ))}
        <div className="gz-bow" aria-hidden="true">
          <SilkBow uid={uid} />
        </div>
        {FALL.map(([left, dx, rot], i) => (
          <i key={i} className="gz-fall" style={{ left: `${left}%`, ...v("--k", i), ...v("--dx", `${dx}px`), ...v("--rot", `${rot}deg`) }} aria-hidden="true" />
        ))}
      </div>
      {interactive && <p className="gz-env-hint">Ochish uchun bosing</p>}
    </div>
  );
}

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

/** Where the photograph lies in a film's last frame, so the live hero can be laid exactly over it. */
function photoFit(scene: FilmScene, box: { w: number; h: number }): CSSProperties {
  const m = frameToScreen(scene, box);
  const p = scene.photo;
  // laid wider than its container on purpose, past the base styles' cap
  return { right: "auto", bottom: "auto", maxWidth: "none", left: m.x(p.x), top: m.y(p.y), width: m.len(p.w), height: m.len(p.h) };
}

const at = (i: number) => v("--i", i);

/** The garden arch with the invitation set over it in white: the first screen once the card is open. */
function GardenHero({
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
  const petals = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = petals.current;
    if (!play || !c || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let stop = () => undefined as void;
    const t = window.setTimeout(() => (stop = startAmbient(c, { tints: PETALS, motes: false, count: 9 })), t0 + (fit ? 300 : 1000));
    return () => {
      window.clearTimeout(t);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, t0]);
  const longest = Math.max(data.groom.length, data.bride.length, 5);
  const nameSize = `min(${Math.min(19, 118 / longest).toFixed(1)}vw, ${Math.min(90, 560 / longest).toFixed(0)}px)`;
  const [k1, k2] = KICKER[data.eventType];
  const [i1, i2] = INVITE[data.eventType];
  return (
    <>
      <img className="gz-photo" src={art("hero")} alt="" style={fit ? photoFit(fit.scene, fit.box) : undefined} />
      <div className="gz-photo-veil" aria-hidden="true" />
      <canvas ref={petals} className="gz-petals" aria-hidden="true" />
      <div className="gz-hero-text">
        <p className="gz-l gz-kick-light" style={at(0)}>
          {k1}
          <br />
          {k2}
        </p>
        <h1 className="gz-hero-names" style={{ fontSize: nameSize }}>
          <span className="gz-l gz-hn gz-hn-1" style={at(1)}>
            {data.groom}
          </span>
          <span className="gz-l gz-hn-and" style={at(2)}>
            va
          </span>
          <span className="gz-l gz-hn gz-hn-2" style={at(3)}>
            {data.bride}
          </span>
        </h1>
        <p className="gz-l gz-kick-light gz-hero-invite" style={at(4)}>
          {i1}
          <br />
          {i2}
        </p>
        <p className="gz-l gz-hero-date" style={at(5)}>
          {formatDateDots(data.date)}
        </p>
        <div className="gz-l gz-hero-mark" style={at(6)} aria-hidden="true">
          <i />
          <BlossomMark size={13} />
          <i />
        </div>
      </div>
      <p className="gz-l gz-motto" style={at(7)}>
        Ikki qalb
        <br />
        bir taqdir
        <br />
        yangi boshlanish
      </p>
    </>
  );
}

/** White and blush petals for the garden. */
const PETALS: [string, string][] = [
  ["#ffffff", "#ece6da"],
  ["#fffaf6", "#ead2cc"],
  ["#fdfcf7", "#dfe2d2"],
];

/* ================================================================== */
/* Sections                                                            */
/* ================================================================== */

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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return root;
}

const delay = (ms: number) => v("--d", `${ms}ms`);

/** A soft wave along the top of a panel, filled with the panel's own colour. */
function Wave({ d }: { d: string }) {
  return (
    <svg className="gz-wave" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}
const WAVES = [
  "M0,40 L0,20 C70,2 150,0 220,14 C290,28 350,30 400,12 L400,40 Z",
  "M0,40 L0,10 C60,26 130,32 210,20 C290,8 340,4 400,18 L400,40 Z",
  "M0,40 L0,16 C80,30 160,30 230,16 C300,2 360,4 400,14 L400,40 Z",
  "M0,40 L0,22 C50,8 120,4 190,14 C270,26 330,24 400,8 L400,40 Z",
];

/** A photograph of the garden when one has been supplied; otherwise its drawn stand-in. */
function Photo({ name, className, alt = "", fallback = null }: { name: string; className: string; alt?: string; fallback?: ReactNode }) {
  const src = art(name);
  if (!src) return <>{fallback}</>;
  return <img className={className} src={src} alt={alt} aria-hidden={alt ? undefined : true} loading="lazy" decoding="async" />;
}

/** White flowers along a panel's top or bottom edge: the photograph, or a drawn spray in the corner. */
function Blossoms({ edge, seed }: { edge: "top" | "bottom"; seed: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const src = art(`blossoms-${edge}`);
  return (
    <div className={`gz-blossoms gz-blossoms-${edge}`} data-reveal="bloom" aria-hidden="true">
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" />
      ) : (
        <>
          <div className="gz-spray a">
            <FlowerSpray uid={`${uid}a`} seed={seed} />
          </div>
          <div className="gz-spray b">
            <FlowerSpray uid={`${uid}b`} seed={seed + 7} />
          </div>
        </>
      )}
    </div>
  );
}

/** Two weeks before the day: the date replies are asked for by, e.g. "1-may". */
function replyBy(date: string) {
  const { y, m, d } = parseDate(date);
  const t = new Date(Date.UTC(y, m - 1, d - 14));
  return `${t.getUTCDate()}-${MONTHS[t.getUTCMonth()]}`;
}

/** Digits a phone link can dial, with the country code for a local number. */
function dialable(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `998${digits}` : digits;
}

function Sections({ data, endSlot }: { data: InviteData; endSlot?: ReactNode }) {
  const root = useReveal();
  const { d, m, y } = parseDate(data.date);
  const message = data.message || defaultMessage(data);
  const links = mapLinks(data);
  const phone = data.contactPhone?.trim();
  const dial = phone ? dialable(phone) : "";
  const hasGift = !!data.giftCardNumber;

  return (
    <div ref={root} className="gz-sections">
      {/* the welcome note, its wave laid over the foot of the photograph */}
      <section className="gz-panel gz-welcome">
        <Wave d={WAVES[0]} />
        {data.bismillah && (
          <p className="gz-bismillah" lang="ar" dir="rtl" data-reveal="up">
            بسم الله الرحمن الرحيم
          </p>
        )}
        <h2 className="gz-script-h" data-reveal="write">
          Aziz mehmonlar!
        </h2>
        <p className="gz-p" data-reveal="up" style={delay(250)}>
          {message}
        </p>
        <div className="gz-heart" data-reveal="draw" style={delay(450)}>
          <Icon kind="heart" size={18} />
        </div>
        <p className="gz-sign" data-reveal="write" style={delay(600)}>
          <span>Muhabbat bilan,</span>
          <span>
            {data.groom} va {data.bride}
          </span>
        </p>
        <div className="gz-bouquet-wrap" data-reveal="rise">
          <Photo name="bouquet" className="gz-bouquet" fallback={<DrawnBouquet />} />
        </div>
      </section>

      {/* the day: date, place, programme and what to wear */}
      <section className="gz-panel gz-day">
        {/* the blossoms hang out of the mist the bouquet fades into */}
        <Blossoms edge="top" seed={3} />
        <p className="gz-kick" data-reveal="up">
          Eng muhimi
        </p>
        <h2 className="gz-h" data-reveal="caps">
          Sana va vaqt
        </h2>
        <ul className="gz-facts">
          <li data-reveal="draw">
            <Icon kind="calendar" size={30} />
            <div>
              <b>
                {d}-{MONTHS[m - 1]}, {y}-yil
              </b>
              <span>
                {formatWeekday(data.date)}, soat {data.time}
              </span>
            </div>
          </li>
          <li data-reveal="draw" style={delay(150)}>
            <Icon kind="pin" size={30} />
            <div>
              <b className="gz-caps">{data.venue}</b>
              {data.address && <span>{data.address}</span>}
              <a className="gz-text-link" href="#gz-yol">
                Yo‘nalishni ko‘rish <Icon kind="arrow" size={14} className="gz-ico-inline" />
              </a>
            </div>
          </li>
        </ul>
        <Countdown date={data.date} time={data.time} />

        {data.program.length > 0 && (
          <>
            <Sprig style={{ marginTop: 34 }} />
            <h2 className="gz-h" data-reveal="caps">
              Kun tartibi
            </h2>
            <ol className="gz-timeline" data-reveal="line">
              {data.program.map((p, i) => (
                <li key={`${p.time}${p.title}`} style={v("--i", i)}>
                  <Icon kind={iconFor(p.title, i)} size={30} />
                  <span className="gz-tl-dot" aria-hidden="true" />
                  <div>
                    <time>{p.time}</time>
                    <span>{p.title}</span>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        <Sprig style={{ marginTop: 34 }} />
        <h2 className="gz-h" data-reveal="caps">
          Kiyinish uslubi
        </h2>
        <p className="gz-p gz-narrow" data-reveal="up">
          {data.dressCode || "Sizni bahor ranglaridan ilhomlangan, yengil va nafis liboslarda ko‘rishdan xursand bo‘lamiz"}
        </p>
        <ul className="gz-swatches" data-reveal="pop" aria-label="Tavsiya etilgan ranglar">
          {PALETTE.map(([c, name], i) => (
            <li key={c} style={{ background: c, ...v("--i", i) }} title={name} aria-label={name} />
          ))}
        </ul>

        <figure className="gz-arch" data-reveal="arch">
          <div className="gz-arch-in">
            <Photo name="table" className="gz-arch-img" fallback={<DrawnTable />} />
          </div>
        </figure>
        <p className="gz-script-s" data-reveal="write">
          Sizni kutib qolamiz!
        </p>
        <div className="gz-heart" data-reveal="draw" style={delay(300)}>
          <Icon kind="heart" size={16} />
        </div>
      </section>

      {/* a line about love, under blush roses */}
      <section className="gz-quote" data-reveal="bloom">
        <div className="gz-roses" aria-hidden="true">
          <Photo name="roses" className="gz-roses-img" fallback={<DrawnRoses />} />
        </div>
        <blockquote className="gz-quote-text" data-reveal="up">
          <span>Muhabbat —</span>
          <span>qalbda gullaydigan</span>
          <span>eng go‘zal gul</span>
        </blockquote>
        <div className="gz-heart" data-reveal="draw" style={delay(400)}>
          <Icon kind="heart" size={16} />
        </div>
      </section>

      {/* the way there */}
      <section id="gz-yol" className="gz-panel gz-way">
        <Wave d={WAVES[1]} />
        <h2 className="gz-h" data-reveal="caps">
          Manzilga yo‘l
        </h2>
        <p className="gz-p gz-narrow" data-reveal="up">
          {data.venue}
          {data.address ? ` — ${data.address}` : ""}. Yo‘lni oson topishingiz uchun xaritani tayyorladik.
        </p>
        <div className="gz-pills" data-reveal="up" style={delay(200)}>
          <a className="gz-pill" href={links.google} target="_blank" rel="noopener noreferrer">
            Google xarita <Icon kind="arrow" size={14} className="gz-ico-inline" />
          </a>
          <a className="gz-pill" href={links.yandex} target="_blank" rel="noopener noreferrer">
            Yandex xarita <Icon kind="arrow" size={14} className="gz-ico-inline" />
          </a>
        </div>
        <GardenMap venue={data.venue} src={art("map")} href={links.yandex} />
      </section>

      {/* replies */}
      <section className="gz-panel gz-rsvp">
        <Wave d={WAVES[2]} />
        <h2 className="gz-h" data-reveal="caps">
          Ishtirokingizni
          <br />
          tasdiqlang
        </h2>
        <p className="gz-p gz-narrow" data-reveal="up">
          Iltimos, {replyBy(data.date)}gacha kelish-kelmasligingizni bizga xabar bering.
        </p>
        <Rsvp />
        {phone && (
          <div className="gz-reach" data-reveal="draw">
            <a href={`tel:+${dial}`} aria-label="Qo‘ng‘iroq qilish">
              <Icon kind="phone" size={20} />
            </a>
            <a href={`https://t.me/+${dial}`} target="_blank" rel="noopener noreferrer" aria-label="Telegram orqali yozish">
              <Icon kind="telegram" size={20} />
            </a>
            <a href={`https://wa.me/${dial}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp orqali yozish">
              <Icon kind="whatsapp" size={20} />
            </a>
          </div>
        )}
        <div className="gz-rsvp-sprig" data-reveal="draw" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path d="M20 37V12" pathLength={1} />
            <path d="M20 22c-4-1-7-4-7.5-8.5 4.4.4 7.3 3.6 7.5 8.5zM20 18c4-1 7-4 7.5-8.5-4.4.4-7.3 3.6-7.5 8.5zM20 12c-1.6-2.4-1.6-5 0-7.4 1.6 2.4 1.6 5 0 7.4zM20 29c-3.6-.4-6.2-2.6-7-6.4 3.8.6 6.4 2.8 7 6.4zM20 27c3.6-.4 6.2-2.6 7-6.4-3.8.6-6.4 2.8-7 6.4z" pathLength={1} />
          </svg>
        </div>
      </section>

      {hasGift && (
        <section className="gz-panel gz-gift-sec">
          <Wave d={WAVES[3]} />
          <h2 className="gz-h" data-reveal="caps">
            To‘yana
          </h2>
          <p className="gz-p gz-narrow" data-reveal="up">
            Duolaringiz biz uchun eng qimmatli sovg‘a. To‘yana yubormoqchi bo‘lsangiz:
          </p>
          <GiftCard number={data.giftCardNumber!} holder={data.giftCardHolder} />
        </section>
      )}

      {/* the last word */}
      <section className={`gz-panel gz-close${hasGift ? "" : " gz-close-wave"}`}>
        {!hasGift && <Wave d={WAVES[3]} />}
        {phone && (
          <p className="gz-p gz-contact" data-reveal="up">
            Savollaringiz bo‘lsa, biz doim aloqadamiz:
            <a href={`tel:+${dial}`}>{phone}</a>
          </p>
        )}
        <p className="gz-script-s" data-reveal="write" style={delay(200)}>
          Sizni intiqlik bilan kutamiz!
        </p>
        <HeartRule />
        {endSlot && <div className="gz-end">{endSlot}</div>}
        {/* the garden grows up from the foot of the page */}
        <Blossoms edge="bottom" seed={17} />
      </section>
    </div>
  );
}

function Countdown({ date, time }: { date: string; time: string }) {
  const c = useCountdown(eventTimestamp(date, time));
  if (c.done) return <p className="gz-p gz-countdown-done">Baxtli kun keldi!</p>;
  const parts = [
    [c.days, "kun"],
    [c.hours, "soat"],
    [c.minutes, "daqiqa"],
    [c.seconds, "soniya"],
  ] as const;
  return (
    <div className="gz-countdown" role="timer" aria-label="To‘ygacha qolgan vaqt" data-reveal="up" style={delay(300)}>
      {parts.map(([n, label]) => (
        <div key={label}>
          <b>{String(n).padStart(2, "0")}</b>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

/** The couple's card for wedding gifts: a cream card with a sage edge, and a button to copy its number. */
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
    <div className="gz-gift" data-reveal="up" style={delay(200)}>
      <div className="gz-gift-card">
        <BlossomMark size={22} />
        {network && <span className="gz-gift-net">{network}</span>}
        <p className="gz-gift-number" aria-label={`Karta raqami ${groups.join(" ")}`}>
          {groups.map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </p>
        {holder && <p className="gz-gift-holder">{holder}</p>}
      </div>
      <button type="button" className="gz-pill gz-pill-solid gz-gift-copy" onClick={copy} aria-live="polite">
        {copied ? "Nusxa olindi" : "Karta raqamini nusxalash"}
      </button>
    </div>
  );
}

/** The reply: one pill that opens a short form in place. */
function Rsvp() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState(1);
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
      <div className="gz-rsvp-done">
        <p className="gz-script-s">Rahmat!</p>
        <p className="gz-p">{attending ? `${name.trim().split(" ")[0]}, sizni to‘yda ko‘rishdan xursand bo‘lamiz.` : "Javobingiz uchun rahmat. Duolaringiz biz bilan."}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="gz-pill gz-rsvp-open" data-reveal="up" style={delay(200)} onClick={() => setOpen(true)}>
        Tasdiqlash <Icon kind="arrow" size={14} className="gz-ico-inline" />
      </button>
    );
  }

  return (
    <form className="gz-form" onSubmit={submit} noValidate>
      <label htmlFor="gz-name">Ism va familiyangiz</label>
      <input id="gz-name" className="gz-field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} autoFocus />
      <div className="gz-choices">
        <button type="button" className="gz-choice" aria-pressed={attending === true} onClick={() => setAttending(true)}>
          Albatta kelaman
        </button>
        <button type="button" className="gz-choice" aria-pressed={attending === false} onClick={() => setAttending(false)}>
          Kela olmayman
        </button>
      </div>
      {attending && (
        <div className="gz-field gz-guests">
          <span>Necha kishi bo‘lasiz?</span>
          <span>
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Kamaytirish">
              −
            </button>
            <b>{guests}</b>
            <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="Ko‘paytirish">
              +
            </button>
          </span>
        </div>
      )}
      {error && (
        <p role="alert" className="gz-error">
          {error}
        </p>
      )}
      <button type="submit" className="gz-pill gz-pill-solid" disabled={state === "sending"}>
        {state === "sending" ? "Yuborilmoqda…" : "Javobni yuborish"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Drawn stand-ins for the photographs                                 */
/* ------------------------------------------------------------------ */

function DrawnBouquet() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className="gz-drawn-bouquet" aria-hidden="true">
      <div style={{ rotate: "-14deg" }}>
        <FlowerSpray uid={`${uid}a`} seed={31} />
      </div>
      <div style={{ rotate: "12deg", marginTop: -34 }}>
        <FlowerSpray uid={`${uid}b`} seed={44} />
      </div>
    </div>
  );
}

function DrawnTable() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className="gz-drawn-table" aria-hidden="true">
      <FlowerSpray uid={`${uid}a`} seed={52} />
      <FlowerSpray uid={`${uid}b`} seed={61} />
      <FlowerSpray uid={`${uid}c`} seed={73} />
    </div>
  );
}

function DrawnRoses() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className="gz-drawn-roses">
      <div style={{ rotate: "-32deg" }}>
        <FlowerSpray uid={`${uid}a`} seed={88} />
      </div>
      <div style={{ rotate: "-62deg", marginTop: -20 }}>
        <FlowerSpray uid={`${uid}b`} seed={97} />
      </div>
    </div>
  );
}
