import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { EVENT_TYPES } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { eventTimestamp, formatDateLong, formatWeekday, initials, MONTHS, parseDate } from "@shared/format";
import { useCountdown, useMusic } from "@/lib/hooks";
import { defaultMessage, mapLinks } from "@/lib/invite";
import { playSealSounds, unlockAudio } from "@/lib/media";
import { startAmbient } from "./ambient";
import { startGoldDust } from "./goldDust";
import { LineArt, type LineArtKind } from "./LineArt";
import { archPath } from "./Ornaments";
import { ScratchCard } from "./ScratchCard";
import heroUrl from "./assets/hero.jpg";
import paperUrl from "./assets/paper.jpg";
import sealUrl from "./assets/seal.png";
import sprayUrl from "./assets/spray.jpg";
import ringsUrl from "./assets/rings.jpg";
import cardUrl from "./assets/card.jpg";
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

/** Milliseconds from the tap until the scene replaces the envelope (keep in sync with muhr.css). */
const TO_SCENE = 2700;

interface Props {
  data: InviteData;
  /** Changing this closes the envelope again. */
  replayToken?: number;
  /** Rendered after the closing section (showcase navigation). */
  endSlot?: ReactNode;
}

export function MuhrInvitation({ data, replayToken = 0, endSlot }: Props) {
  const [stage, setStage] = useState<Stage>("closed");
  const music = useMusic(data.music);
  const heroRef = useRef<HTMLElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const timers = useRef<number[]>([]);
  const stopDust = useRef<() => void>(() => undefined);
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
    stopDust.current();
    setStage("closed");
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

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      stopDust.current();
    },
    [],
  );

  const open = () => {
    if (stage !== "closed") return;
    unlockAudio();
    playSealSounds();
    navigator.vibrate?.([14, 70, 22]);
    music.play();
    setStage("opening");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (dustRef.current && !reduce) {
      stopDust.current = startGoldDust(dustRef.current, { x: box.w / 2, y: box.h * 0.48 });
    }
    timers.current = [
      window.setTimeout(() => {
        stopDust.current();
        setStage("scene");
      }, TO_SCENE),
    ];
  };

  return (
    <div className="mh">
      <div className="mh-col">
        <section ref={heroRef} className="mh-hero" data-stage={stage} aria-label="Taklifnoma">
          {/* the scene waits under the paper, so the envelope can dissolve into it */}
          {stage !== "closed" && <PhotoHero data={data} />}
          {stage !== "scene" && <Envelope data={data} box={box} state={stage} onOpen={open} />}
          <canvas ref={dustRef} className="mh-dust" aria-hidden="true" />
        </section>

        {stage === "scene" && (
          <>
            <Sections data={data} />
            {endSlot}
          </>
        )}
      </div>

      {music.available && stage === "scene" && (
        <button type="button" className="mh-music" onClick={music.toggle} aria-label={music.playing ? "Musiqani to‘xtatish" : "Musiqani yoqish"}>
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
  const pair = initials(data.groom, data.bride).split("") as [string, string];
  const canOpen = interactive && state === "closed";
  const faces = (
    <>
      <div className="mh-face front" />
      <div className="mh-face back" />
    </>
  );
  return (
    <div
      className="mh-env"
      data-state={state}
      style={{ ["--mh-art" as string]: `url("${paperUrl}")` }}
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      aria-label={canOpen ? "Muhrni bosib, taklifnomani oching" : undefined}
      onClick={canOpen ? onOpen : undefined}
      onKeyDown={(e) => {
        if (canOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen?.();
        }
      }}
    >
      <div className="mh-env-3d">
        <div className="mh-inside">
          <i className="mh-rays" />
          <i className="mh-core" />
        </div>
        <div className="mh-flap mh-flap-l">{faces}</div>
        <div className="mh-flap mh-flap-r">{faces}</div>
        <div className="mh-shade mh-shade-b">
          <i />
        </div>
        <div className="mh-flap mh-flap-b">{faces}</div>
        <div className="mh-shade mh-shade-t">
          <i />
        </div>
        <div className="mh-flap mh-flap-t">{faces}</div>
        {/* the seal rides the top flap's tip but stays facing the guest */}
        <div className="mh-seal-layer">
          <div className="mh-seal-wrap">
            <i className="mh-seal-glow" />
            {canOpen && (
              <>
                <i className="mh-ping" />
                <i className="mh-ping mh-ping-2" />
              </>
            )}
            <i className="mh-shock" />
            <Seal pair={pair} size={box.w * 0.36} className="mh-seal" />
          </div>
        </div>
        {/* a slow glint travelling over the embossing, and the amber light glowing through the paper once it opens */}
        <i className="mh-sheen" />
        <i className="mh-spill" />
      </div>
      {interactive && <p className="mh-hint">Muhrni bosing</p>}
    </div>
  );
}

/* ================================================================== */
/* Hero: the owner's photograph with the welcome set in its sky        */
/* ================================================================== */

function PhotoHero({ data }: { data: InviteData }) {
  const petals = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = petals.current;
    if (!c || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let stop = () => undefined as void;
    // petals start drifting once the paper has dissolved
    const t = window.setTimeout(() => (stop = startAmbient(c)), 2200);
    return () => {
      window.clearTimeout(t);
      stop();
    };
  }, []);
  const longest = Math.max(data.groom.length, data.bride.length, 5);
  const nameSize = `min(${Math.min(17, 110 / longest).toFixed(1)}vw, ${Math.min(80, 520 / longest).toFixed(0)}px)`;
  return (
    <>
      <img className="mh-photo" src={heroUrl} alt={`${data.groom} va ${data.bride}`} />
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
      <img className="mh-hero-spray l" src={sprayUrl} alt="" aria-hidden="true" />
      <img className="mh-hero-spray r" src={sprayUrl} alt="" aria-hidden="true" />
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

      <section className="mh-sec mh-sec-card">
        <div className="mh-card" data-reveal="card">
          <img className="mh-card-art" src={cardUrl} alt="" aria-hidden="true" />
          <div className="mh-card-text">
            {data.bismillah && (
              <p className="mh-bismillah" lang="ar" dir="rtl">
                بسم الله الرحمن الرحيم
              </p>
            )}
            <p className="mh-caps">{INVITE_LINE[data.eventType]}</p>
            <p className="mh-card-name">{data.groom}</p>
            <Divider />
            {data.groomParents && <p className="mh-caps mh-caps-sm">{data.groomParents}</p>}
            <p className="mh-card-with">va</p>
            <p className="mh-card-name">{data.bride}</p>
            <Divider />
            {data.brideParents && <p className="mh-caps mh-caps-sm">{data.brideParents}</p>}
          </div>
        </div>
      </section>

      <section className="mh-sec mh-sec-message">
        <img className="mh-side-spray l" src={sprayUrl} alt="" aria-hidden="true" data-reveal="bloom" />
        <img className="mh-side-spray r" src={sprayUrl} alt="" aria-hidden="true" data-reveal="bloom" style={delay(150)} />
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
          <Divider className="mh-rv-divider" />
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
