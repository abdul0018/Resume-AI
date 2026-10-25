import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { EVENT_TYPES } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { eventTimestamp, formatWeekday, MONTHS, parseDate } from "@shared/format";
import { useCountdown, useMusic } from "@/lib/hooks";
import { mapLinks } from "@/lib/invite";
import { copyText } from "@/lib/share";
import { unlockAudio } from "@/lib/media";
import { Film, filmSpec, type FilmSpec } from "../film/Film";
import { Icon } from "../gulzor/Botanicals";
import "./ahd.css";

/*
 * Ahd — "the vow". Two hands bring two rings together at a tall window; as they meet, the grey day turns
 * golden. The invitation is written like a letter on ivory paper: the names in a signature hand, headings
 * in pen-written capitals, the text in a book serif, thin espresso rules with a small wine-red heart. The
 * date waits behind linen curtains until the guest slides a ring across to open them.
 */

type Stage = "closed" | "opening" | "scene";

const FILES = import.meta.glob<string>("./assets/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" });
const art = (name: string) => Object.entries(FILES).find(([p]) => p.slice(p.lastIndexOf("/") + 1).replace(/\.\w+$/, "") === name)?.[1];

const OCCASION: Record<keyof typeof EVENT_TYPES, string> = {
  nikoh: "nikoh to‘yi",
  fotiha: "fotiha to‘yi",
  unashtiruv: "unashtiruv marosimi",
  qizbazmi: "qiz bazmi",
};
const inviteText = (data: InviteData) =>
  `Sizni farzandlarimiz ${data.groom} va ${data.bride}ning ${OCCASION[data.eventType]} munosabati bilan beriladigan dasturxonimizga lutfan taklif etamiz. Ushbu quvonchli kunda yonimizda bo‘lishingiz biz uchun katta sharaf.`;

/** Without a film: the closed picture gives way this long after the tap. */
const TO_SCENE = 1900;

const v = (k: string, val: string | number) => ({ [k]: val }) as CSSProperties;
const at = (i: number) => v("--i", i);

interface Props {
  data: InviteData;
  replayToken?: number;
  endSlot?: ReactNode;
}

export function AhdInvitation({ data, replayToken = 0, endSlot }: Props) {
  const [stage, setStage] = useState<Stage>("closed");
  const [play, setPlay] = useState(false);
  const music = useMusic(data.music);
  const [film, setFilm] = useState<FilmSpec | null>(() =>
    typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? null : filmSpec("ahd"),
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

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = stage === "scene" ? "" : "hidden";
    if (stage !== "scene") window.scrollTo(0, 0);
    return () => {
      root.style.overflow = "";
    };
  }, [stage]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

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

  const runStillOpening = () => {
    setPlay(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    timers.current = [window.setTimeout(() => setStage("scene"), reduce ? 450 : TO_SCENE)];
  };

  const open = () => {
    if (stage !== "closed") return;
    unlockAudio();
    music.play();
    setStage("opening");
    navigator.vibrate?.(8);
    if (!film) runStillOpening();
  };

  const filmFailed = () => {
    setFilm(null);
    runStillOpening();
  };

  const poster = filmSpec("ahd")?.poster ?? art("hero");

  return (
    <div className="ah">
      <div className="ah-col">
        <section ref={heroRef} className="ah-hero" data-stage={stage} data-play={play || undefined} aria-label="Taklifnoma">
          {stage !== "closed" && <RingsHero data={data} />}
          {stage !== "scene" &&
            (film ? (
              <Film
                spec={film}
                names=""
                nameSize={0}
                hint={<TapRing />}
                box={box}
                state={stage}
                onOpen={open}
                onFail={filmFailed}
                onHandover={() => setPlay(true)}
                onDone={() => setStage("scene")}
              />
            ) : (
              <StillCard poster={poster} state={stage} onOpen={open} />
            ))}
        </section>

        {stage === "scene" && <Sections data={data} endSlot={endSlot} />}
      </div>

      {music.available && stage === "scene" && (
        <button type="button" ref={coin} className="ah-music" onClick={music.toggle} aria-label={music.playing ? "Musiqani to‘xtatish" : "Musiqani yoqish"}>
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

/** The closed invitation for the gallery: the film's first frame and the round button, nothing written. */
export function AhdClosed({ box }: { data: InviteData; box: { w: number; h: number } }) {
  const film = filmSpec("ahd");
  return (
    <div className="film" aria-hidden="true" style={v("--ring", `${Math.round(Math.min(64, box.w * 0.16))}px`)}>
      <img className="film-video" src={film?.poster ?? art("hero")} alt="" />
      <div className="film-hint" style={{ top: `${(film?.hint ?? 0.5) * 100}%` }}>
        <TapRing />
      </div>
    </div>
  );
}

/** The round button between the two hands: a pale circle with two rings, softly pulsing. */
function TapRing() {
  return (
    <span className="ah-tap">
      <Icon kind="rings" size={26} className="ah-ico" />
    </span>
  );
}

/** Without a film (reduced motion, or a phone that will not play it): the closed picture, tapped away. */
function StillCard({ poster, state, onOpen }: { poster?: string; state: Exclude<Stage, "scene">; onOpen: () => void }) {
  const closed = state === "closed";
  return (
    <div
      className="film ah-still"
      data-opener=""
      data-state={state}
      role={closed ? "button" : undefined}
      tabIndex={closed ? 0 : undefined}
      aria-label={closed ? "Taklifnomani ochish" : undefined}
      onClick={() => closed && onOpen()}
      onKeyDown={(e) => {
        if (closed && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {poster && <img className="film-video" src={poster} alt="" />}
      <div className="film-hint" style={{ top: "50%" }} aria-hidden="true">
        <TapRing />
      </div>
    </div>
  );
}

/**
 * The film's last frame — the rings joined in warm light — as the first screen: a pale veil over its top for
 * the ceremony line and over its foot for the names and date; the hands and rings stay clear between.
 */
function RingsHero({ data }: { data: InviteData }) {
  return (
    <>
      <img className="ah-photo" src={art("hero")} alt="" />
      <div className="ah-veil" aria-hidden="true" />
      <div className="ah-hero-foot">
        <h1 className="ah-hero-names">
          <span className="ah-l" style={at(1)}>
            {data.groom}
          </span>
          <span className="ah-l ah-amp" style={at(2)}>
            &amp;
          </span>
          <span className="ah-l" style={at(3)}>
            {data.bride}
          </span>
        </h1>
        <span className="ah-l ah-hero-rule" style={at(4)}>
          <Rule />
        </span>
        <p className="ah-l ah-hero-line" style={at(5)}>
          Ikki uzuk — bir ahd
        </p>
        <div className="ah-l ah-cue" style={at(6)} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* Sections                                                            */
/* ================================================================== */

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

function dialable(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `998${digits}` : digits;
}

/** The pen font has no Uzbek ‘ of its own; the modifier letter ʻ is the correct sign and reads clearly. */
const pen = (s: string) => s.replace(/[‘’]/g, "ʻ");

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="9" viewBox="0 0 10 9" aria-hidden="true">
      <path d="M5 8.6C2.2 6.5.3 4.9.3 2.8.3 1.4 1.3.4 2.6.4c1 0 1.8.6 2.4 1.5C5.6 1 6.4.4 7.4.4c1.3 0 2.3 1 2.3 2.4 0 2.1-1.9 3.7-4.7 5.8z" fill="currentColor" />
    </svg>
  );
}

/** A hairline with a small heart in its middle, as under a letter's heading. */
function Rule() {
  return (
    <span className="ah-rule" aria-hidden="true">
      <i />
      <Heart />
      <i />
    </span>
  );
}

/** A thread across the page that loops into a heart on its way. */
function Thread() {
  return (
    <svg className="ah-thread" viewBox="0 0 400 56" aria-hidden="true">
      <path
        pathLength={1}
        d="M0 40C60 31 118 48 168 40c14-2 24-6 32-14-7-6-14-11-14-17 0-5 4-8 8-8 3 0 5 2 6 4 1-2 3-4 6-4 4 0 8 3 8 8 0 6-7 11-14 17 8 8 18 12 32 14 50 8 108-9 168 0"
      />
    </svg>
  );
}

/** A section's heading: pen-written capitals over a hairline with a heart. */
function Head({ children }: { children: string }) {
  return (
    <div className="ah-head">
      <h2>{pen(children)}</h2>
      <Rule />
    </div>
  );
}

function Sections({ data, endSlot }: { data: InviteData; endSlot?: ReactNode }) {
  const root = useReveal();
  const links = mapLinks(data);
  const phone = data.contactPhone?.trim();
  const dial = phone ? dialable(phone) : "";
  const hosts = data.hosts || "Ota-onalari";

  return (
    <div ref={root} className="ah-sections">
      <section className="ah-sec ah-invite">
        <Head>Qadrli mehmonlar!</Head>
        <p className="ah-p">
          {data.message || inviteText(data)}
        </p>
        <p className="ah-sign">
          <span>Hurmat bilan,</span>
          {hosts}
        </p>
      </section>

      {/* the groom and the bride as two panes of the window, the rings on the bar between them */}
      <section className="ah-sec ah-couple">
        <Head>Kelin va kuyov</Head>
        <div className="ah-panes" data-reveal="panes">
          <div className="ah-pane">
            <p className="ah-name">{data.groom}</p>
            <p className="ah-of">{data.groomParents || "Kuyov"}</p>
          </div>
          <span className="ah-bar" aria-hidden="true">
            <Icon kind="rings" size={22} className="ah-ico" />
          </span>
          <div className="ah-pane">
            <p className="ah-name">{data.bride}</p>
            <p className="ah-of">{data.brideParents || "Kelin"}</p>
          </div>
        </div>
      </section>

      <section className="ah-sec ah-date">
        <Head>To‘y sanasi</Head>
        <DateCurtain date={data.date} time={data.time} />
      </section>

      <Thread />

      {data.program.length > 0 && (
        <section className="ah-sec ah-program">
          <Head>To‘y dasturi</Head>
          <Programme items={data.program} />
        </section>
      )}

      <section className="ah-sec ah-place">
        <Head>To‘yxona</Head>
        <div className="ah-window" data-reveal="window">
          <div className="ah-window-in">
            <p className="ah-venue">{pen(data.venue)}</p>
            {data.address && <p className="ah-addr">{data.address}</p>}
            <div className="ah-maps">
              <a className="ah-btn" href={links.yandex} target="_blank" rel="noopener noreferrer">
                <Icon kind="pin" size={18} className="ah-ico" />
                Yandex
              </a>
              <a className="ah-btn" href={links.google} target="_blank" rel="noopener noreferrer">
                <Icon kind="pin" size={18} className="ah-ico" />
                Google
              </a>
            </div>
            {data.dressCode && (
              <p className="ah-dress">Kiyinish uslubi: {data.dressCode}</p>
            )}
          </div>
        </div>
      </section>

      <section className="ah-sec ah-reply">
        <Head>Javobingizni kutamiz</Head>
        <p className="ah-p">
          Iltimos, to‘y kunidan oldin kelishingizni tasdiqlang.
        </p>
        <Rsvp />
        {phone && (
          <div className="ah-reach">
            <a className="ah-btn ah-btn-ghost" href={`https://t.me/+${dial}`} target="_blank" rel="noopener noreferrer">
              <Icon kind="telegram" size={18} className="ah-ico" />
              Telegram
            </a>
            <a className="ah-btn ah-btn-ghost" href={`tel:+${dial}`}>
              <Icon kind="phone" size={18} className="ah-ico" />
              Qo‘ng‘iroq
            </a>
          </div>
        )}
      </section>

      {data.giftCardNumber && (
        <section className="ah-sec ah-gift-sec">
          <Head>To‘yana</Head>
          <p className="ah-p">
            Duolaringiz biz uchun eng qimmatli sovg‘a. To‘yana yubormoqchi bo‘lsangiz:
          </p>
          <GiftCard number={data.giftCardNumber} holder={data.giftCardHolder} />
        </section>
      )}

      <section className="ah-sec ah-close">
        <Thread />
        <p className="ah-close-title">
          Sizni intiqlik
          <br />
          bilan kutamiz!
        </p>
        <p className="ah-duo">
          Alloh yoshlarimizga baxt, totuvlik va barakali umr ato etsin
        </p>
        <p className="ah-sign">
          <span>Hurmat bilan,</span>
          {hosts}
        </p>
        {endSlot && <div className="ah-end">{endSlot}</div>}
      </section>
    </div>
  );
}

const ROW = 92;

/**
 * The day's programme along a thread that winds down the page: a wine-red bead at each hour, the hour in
 * pen and the event in small serif capitals on alternate sides, a small heart where the thread ends.
 */
function Programme({ items }: { items: InviteData["program"] }) {
  const W = 300;
  const pts = items.map((_, i) => ({ x: i % 2 ? 108 : 192, y: 34 + i * ROW }));
  const last = pts[pts.length - 1];
  const H = last.y + 74;
  let d = `M${pts[0].x} 0V${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    d += `C${a.x} ${a.y + ROW / 2} ${b.x} ${b.y - ROW / 2} ${b.x} ${b.y}`;
  }
  const n = H - 22; // the heart's notch
  d += `C${last.x} ${last.y + 30} 150 ${n - 22} 150 ${n}`;
  d += `c-3-5-10-5-10 1 0 5 6 8 10 12 4-4 10-7 10-12 0-6-7-6-10-1`;

  return (
    <div className="ah-programme" data-reveal="line" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <path className="ah-wind" pathLength={1} d={d} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.6" style={at(i)} />
        ))}
      </svg>
      <ol>
        {items.map((p, i) => (
          <li
            key={`${p.time}${p.title}`}
            data-side={i % 2 ? "r" : "l"}
            style={{ ...at(i), top: `${(pts[i].y / H) * 100}%` }}
          >
            <time>{p.time}</time>
            <span>{p.title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

/** The Monday-to-Sunday week around the day, each as its day of the month. */
function weekOf(y: number, m: number, d: number) {
  const day = new Date(Date.UTC(y, m - 1, d));
  const mon = d - ((day.getUTCDay() + 6) % 7);
  return DAYS.map((label, k) => ({ label, n: new Date(Date.UTC(y, m - 1, mon + k)).getUTCDate(), on: mon + k === d }));
}

/**
 * The date behind two linen curtains. The guest slides the ring along its rail; the curtains follow the
 * finger and part. Past most of the way they open fully and the date and the countdown come out; let go
 * early and they fall closed again. The ring is also a button, for keyboards.
 */
function DateCurtain({ date, time }: { date: string; time: string }) {
  const { d, m, y } = parseDate(date);
  const month = MONTHS[m - 1];
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x0: number; p0: number } | null>(null);
  const [p, setP] = useState(0);
  const [held, setHeld] = useState(false);
  const [open, setOpen] = useState(false);
  const [travel, setTravel] = useState(244);

  // how far the ring can travel along its rail
  useLayoutEffect(() => {
    const r = rail.current;
    if (!r) return;
    const measure = () => setTravel(Math.max(120, r.clientWidth - 56));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(r);
    return () => ro.disconnect();
  }, []);
  const span = () => travel;
  const finish = () => {
    setP(1);
    setOpen(true);
    navigator.vibrate?.([10, 60, 14]);
  };

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (open) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x0: e.clientX, p0: p };
    setHeld(true);
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    setP(Math.min(1, Math.max(0, g.p0 + (e.clientX - g.x0) / span())));
  };
  const up = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    drag.current = null;
    setHeld(false);
    if (p > 0.72) finish();
    else setP(0);
  };

  return (
    <div className="ah-curtain" data-open={open || undefined} data-held={held || undefined} style={{ ...v("--p", p), ...v("--span", `${travel}px`) }}>
      <div className="ah-stage">
        <div className="ah-datebox" aria-hidden={!open}>
          <span className="ah-month">
            {month} {y}
          </span>
          <span className="ah-week">
            {weekOf(y, m, d).map((w) => (
              <span key={w.label} data-on={w.on || undefined}>
                <small>{w.label}</small>
                <b>
                  {w.on && <Heart className="ah-day-heart" />}
                  <em>{w.n}</em>
                </b>
              </span>
            ))}
          </span>
          <span className="ah-time">
            {formatWeekday(date)}, soat {time}
          </span>
          <span className="sr-only">
            {d}-{month}, {y}-yil, {formatWeekday(date, false)}, soat {time}
          </span>
        </div>
        <div className="ah-drape l" aria-hidden="true" />
        <div className="ah-drape r" aria-hidden="true" />
      </div>
      <div ref={rail} className="ah-rail">
        <span className="ah-rail-track" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <button
          type="button"
          className="ah-knob"
          aria-label={open ? "Sana ochildi" : "Sanani ochish"}
          disabled={open}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={(e) => {
            if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowRight")) {
              e.preventDefault();
              finish();
            }
          }}
        >
          <Icon kind="rings" size={22} className="ah-ico" />
        </button>
      </div>
      {open && <Countdown date={date} time={time} />}
    </div>
  );
}

function Countdown({ date, time }: { date: string; time: string }) {
  const c = useCountdown(eventTimestamp(date, time));
  if (c.done) return <p className="ah-p">Baxtli kun keldi!</p>;
  const parts = [
    [c.days, "kun"],
    [c.hours, "soat"],
    [c.minutes, "daqiqa"],
    [c.seconds, "soniya"],
  ] as const;
  return (
    <div className="ah-count" role="timer" aria-label="To‘ygacha qolgan vaqt">
      {parts.map(([n, label]) => (
        <div key={label}>
          <b>{String(n).padStart(2, "0")}</b>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

function Rsvp() {
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
      <div className="ah-done">
        <p className="ah-lead">Rahmat!</p>
        <p className="ah-p">{attending ? `${name.trim().split(" ")[0]}, sizni to‘yda ko‘rishdan xursand bo‘lamiz.` : "Javobingiz uchun rahmat. Duolaringiz biz bilan."}</p>
      </div>
    );
  }

  return (
    <form className="ah-form" onSubmit={submit} noValidate>
      <label htmlFor="ah-name">Ism va familiyangiz</label>
      <input id="ah-name" className="ah-field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
      <div className="ah-choices">
        <button type="button" className="ah-choice" aria-pressed={attending === true} onClick={() => setAttending(true)}>
          Albatta kelaman
        </button>
        <button type="button" className="ah-choice" aria-pressed={attending === false} onClick={() => setAttending(false)}>
          Kela olmayman
        </button>
      </div>
      {attending && (
        <div className="ah-field ah-guests">
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
        <p role="alert" className="ah-error">
          {error}
        </p>
      )}
      <button type="submit" className="ah-btn ah-btn-solid" disabled={state === "sending"}>
        {state === "sending" ? "Yuborilmoqda…" : "Javobni yuborish"}
      </button>
    </form>
  );
}

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
    <div className="ah-gift">
      <div className="ah-gift-card">
        <span className="ah-gift-net">{network || "KARTA"}</span>
        <p className="ah-gift-number" aria-label={`Karta raqami ${groups.join(" ")}`}>
          {groups.map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </p>
        {holder && <p className="ah-gift-holder">{holder}</p>}
      </div>
      <button type="button" className="ah-btn ah-btn-solid ah-gift-copy" onClick={copy} aria-live="polite">
        {copied ? "Nusxa olindi" : "Karta raqamini nusxalash"}
      </button>
    </div>
  );
}

