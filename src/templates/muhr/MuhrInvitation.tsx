import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { EVENT_TYPES } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { eventTimestamp, formatDateDots, formatDateLong, formatWeekday, initials, MONTHS, parseDate } from "@shared/format";
import { useCountdown, useMusic } from "@/lib/hooks";
import { defaultMessage, mapLinks } from "@/lib/invite";
import { playSealSounds, unlockAudio } from "@/lib/media";
import { envelopeArt } from "./envelopeArt";
import { startGoldDust } from "./goldDust";
import { ArchFrame, ArchSky, Lantern, STAGE_H, STAGE_W, WaxSeal, archPath } from "./Ornaments";
import "./muhr.css";

type Stage = "closed" | "opening" | "scene";

/** "… to our wedding", with the possessive ending each ceremony name takes in Uzbek. */
const WELCOME: Record<keyof typeof EVENT_TYPES, string> = {
  nikoh: "Nikoh to‘yimizga",
  fotiha: "Fotiha to‘yimizga",
  unashtiruv: "Unashtiruv marosimimizga",
  qizbazmi: "Qiz bazmimizga",
};

/** Milliseconds from the tap until the arch scene replaces the envelope (keep in sync with muhr.css). */
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
    music.play();
    setStage("opening");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (dustRef.current && !reduce) {
      stopDust.current = startGoldDust(dustRef.current, { x: box.w / 2, y: box.h * 0.48 });
    }
    timers.current = [window.setTimeout(() => setStage("scene"), TO_SCENE)];
  };

  return (
    <div className="mh">
      <div className="mh-col">
        <section ref={heroRef} className="mh-hero" data-stage={stage} aria-label="Taklifnoma">
          {stage === "scene" ? (
            <ArchHero data={data} box={box} />
          ) : (
            <Envelope data={data} box={box} state={stage} onOpen={open} />
          )}
          <canvas ref={dustRef} className="mh-dust" aria-hidden="true" />
          <div className="mh-bloom" data-stage={stage} aria-hidden="true" />
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
  // One raster of the embossed paper per size, shared by every flap face.
  const art = useMemo(() => envelopeArt(Math.round(box.w), Math.round(box.h)), [box.w, box.h]);
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
      style={{ ["--mh-art" as string]: `url("${art}")` }}
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
        <div className="mh-flap mh-flap-t">
          {faces}
          <div className="mh-seal-wrap">
            <i className="mh-seal-glow" />
            <WaxSeal initials={pair} className="mh-seal" />
          </div>
        </div>
      </div>
      {interactive && <p className="mh-hint">Muhrni bosing</p>}
      {interactive && (
        <p className="mh-env-names" aria-hidden="true">
          {data.groom} &amp; {data.bride}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/* Arch hero                                                           */
/* ================================================================== */

function ArchHero({ data, box }: { data: InviteData; box: { w: number; h: number } }) {
  const s = Math.max(box.w / STAGE_W, box.h / STAGE_H);
  const longest = Math.max(data.groom.length, data.bride.length, 5);
  const nameSize = Math.min(66, 430 / longest);
  const at = (y: number, i: number) => ({ top: `${(y / STAGE_H) * 100}%`, ["--i" as string]: i });
  return (
    <>
      <div className="mh-stage" style={{ ["--s" as string]: s }}>
        <ArchSky className="mh-layer" />
        <div className="mh-layer">
          {data.bismillah && (
            <p className="mh-line mh-bism" style={at(186, 0)}>
              Bismillahir Rohmanir Rohiym
            </p>
          )}
          <p className="mh-line mh-welcome" style={at(226, 1)}>
            {WELCOME[data.eventType]}
          </p>
          <p className="mh-line mh-welcome" style={at(258, 1)}>
            xush kelibsiz
          </p>
          <h1 className="mh-line mh-name" style={{ ...at(318, 2), fontSize: `calc(${nameSize}px * var(--s))` }}>
            {data.groom}
          </h1>
          <p className="mh-line mh-amp" style={at(360, 3)}>
            &amp;
          </p>
          <p className="mh-line mh-name" style={{ ...at(402, 4), fontSize: `calc(${nameSize}px * var(--s))` }}>
            {data.bride}
          </p>
          <p className="mh-line mh-date" style={at(688, 5)}>
            {formatDateDots(data.date)}
          </p>
          <p className="mh-line mh-time" style={at(712, 6)}>
            {formatWeekday(data.date)} · soat {data.time}
          </p>
        </div>
        <ArchFrame className="mh-layer" />
        {[
          { x: 80, top: 236, chain: 34, w: 40, cls: "l" },
          { x: 320, top: 236, chain: 58, w: 40, cls: "r" },
        ].map((l) => (
          <div
            key={l.cls}
            className={`mh-lantern ${l.cls}`}
            style={{
              left: `${((l.x - l.w / 2) / STAGE_W) * 100}%`,
              top: `${(l.top / STAGE_H) * 100}%`,
              width: `${(l.w / STAGE_W) * 100}%`,
            }}
          >
            <span
              className="mh-lantern-glow"
              style={{ left: "-80%", right: "-80%", top: `${((l.chain + 10) / (l.chain + 92)) * 100 - 18}%`, aspectRatio: "1" }}
            />
            <Lantern chain={l.chain} style={{ width: "100%", height: "auto", display: "block", position: "relative" }} />
          </div>
        ))}
      </div>
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

function Rule() {
  return (
    <div className="mh-rule" aria-hidden="true">
      <i />
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M8 0 L9.6 6.4 L16 8 L9.6 9.6 L8 16 L6.4 9.6 L0 8 L6.4 6.4Z" fill="currentColor" />
      </svg>
      <i />
    </div>
  );
}

/** Pointed-arch panel; its gold outline draws itself the first time it scrolls into view. */
function ArchPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [drawn, setDrawn] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (!("IntersectionObserver" in window)) {
      setDrawn(true);
      return () => ro.disconnect();
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setDrawn(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  return (
    <div ref={ref} className={`mh-panel ${className}`} data-drawn={drawn}>
      {size.w > 0 && (
        <svg viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
          <path className="fill" d={archPath(size.w, size.h, 1)} />
          <path d={archPath(size.w, size.h, 1)} pathLength={1} strokeWidth={1.3} />
          <path d={archPath(size.w, size.h, 8)} pathLength={1} strokeWidth={0.6} />
        </svg>
      )}
      {children}
    </div>
  );
}

function Sections({ data }: { data: InviteData }) {
  const message = data.message || defaultMessage(data);
  return (
    <>
      <section className="mh-sec">
        <ArchPanel>
          <h2 className="mh-h">
            Assalomu alaykum,
            <br />
            qadrli mehmon!
          </h2>
          <Rule />
          <p className="mh-p">{message}</p>
          {data.hosts && (
            <p className="mh-p mh-muted" style={{ marginTop: 26, fontStyle: "italic" }}>
              Hurmat bilan,
              <br />
              <span style={{ color: "var(--mh-ink)", fontSize: 20 }}>{data.hosts}</span>
            </p>
          )}
        </ArchPanel>
      </section>

      <section className="mh-sec">
        <h2 className="mh-h">To‘y kuni</h2>
        <SaveTheDate date={data.date} time={data.time} />
        <div style={{ marginTop: 44 }}>
          <Countdown date={data.date} time={data.time} />
        </div>
        <div style={{ marginTop: 44 }}>
          <MonthCalendar date={data.date} />
        </div>
      </section>

      {data.program.length > 0 && (
        <section className="mh-sec">
          <h2 className="mh-h">To‘y dasturi</h2>
          <ol className="mh-prog">
            {data.program.map((p) => (
              <li key={`${p.time}${p.title}`}>
                <time>{p.time}</time>
                <i aria-hidden="true" />
                <span>{p.title}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mh-sec">
        <h2 className="mh-h">{data.venue}</h2>
        {data.address && <p className="mh-p mh-muted" style={{ marginTop: 12, fontSize: 16 }}>{data.address}</p>}
        {data.dressCode && (
          <p className="mh-p" style={{ marginTop: 10, fontSize: 15 }}>
            <span className="mh-muted">Kiyinish uslubi:</span> {data.dressCode}
          </p>
        )}
        <VenueMap data={data} />
      </section>

      <section className="mh-sec">
        <ArchPanel>
          <h2 className="mh-h">Tashrifingizni tasdiqlang</h2>
          <p className="mh-p mh-muted" style={{ marginTop: 12, fontSize: 16 }}>
            To‘y kunidan oldin javobingizni bildiring.
          </p>
          <Rsvp />
        </ArchPanel>
      </section>

      <section className="mh-sec" style={{ paddingBottom: 40 }}>
        <WaxSeal initials={initials(data.groom, data.bride).split("") as [string, string]} className="mh-closing-seal" />
        <p className="mh-h" style={{ fontStyle: "italic", fontSize: 24 }}>
          Sizni intiqlik bilan kutamiz!
        </p>
        <p style={{ fontFamily: "var(--mh-script)", fontSize: 58, lineHeight: 1.05, color: "#6a4818", margin: "14px 0 0" }}>
          {data.groom} &amp; {data.bride}
        </p>
        <p className="mh-muted" style={{ marginTop: 10, fontSize: 14, letterSpacing: "0.18em" }}>
          {formatDateLong(data.date)}
        </p>
      </section>
    </>
  );
}

function SaveTheDate({ date, time }: { date: string; time: string }) {
  const { d, m, y } = parseDate(date);
  return (
    <>
      <div className="mh-big-date">
        <span>{MONTHS[m - 1]}</span>
        <strong>{d}</strong>
        <span>{y}</span>
      </div>
      <p className="mh-p mh-muted" style={{ fontSize: 16, fontStyle: "italic" }}>
        {formatWeekday(date)}, soat {time}
      </p>
    </>
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

function MonthCalendar({ date }: { date: string }) {
  const { y, m, d } = parseDate(date);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div>
      <p style={{ fontFamily: "var(--mh-script)", fontSize: 40, lineHeight: 1, margin: "0 0 14px", color: "#6a4818" }}>
        {MONTHS[m - 1][0].toUpperCase() + MONTHS[m - 1].slice(1)}
      </p>
      <div className="mh-cal">
        {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((w) => (
          <div key={w} className="wd">
            {w}
          </div>
        ))}
        {cells.map((c, i) => (
          <div key={i} className={c === d ? "on" : undefined}>
            <span>{c ?? ""}</span>
          </div>
        ))}
      </div>
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
      <svg className="mh-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Xarita: ${data.venue}`}>
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
            <path d="M0,36 C-6,24 -19,13 -19,0 A19,19 0 1 1 19,0 C19,13 6,24 0,36Z" fill="#a77a2c" />
            <circle r="6.5" fill="#fff7e6" />
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
              −
            </button>
            <b style={{ minWidth: 16, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{guests}</b>
            <button type="button" className="mh-ghost" style={{ minHeight: 34, width: 34, padding: 0 }} onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="Ko‘paytirish">
              +
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
