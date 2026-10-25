import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { EVENT_TYPES } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { eventTimestamp, formatDateDots, formatWeekday, MONTHS, parseDate } from "@shared/format";
import { useCountdown, useMusic } from "@/lib/hooks";
import { mapLinks } from "@/lib/invite";
import { copyText } from "@/lib/share";
import { unlockAudio } from "@/lib/media";
import { Film, filmSpec, type FilmSpec } from "../film/Film";
import { Icon } from "../gulzor/Botanicals";
import "./nafosat.css";

/*
 * Nafosat — "elegance": soft white paper, dusty blue and blush, white roses and peonies with silver
 * eucalyptus, copperplate names and a Bodoni date. It opens on a wedding car on a coastal road lined with
 * roses; the car drives away under the flower arch, a cream mist rises over the road, and the invitation is
 * written into it.
 */

type Stage = "closed" | "opening" | "scene";

/** The template's pictures, by name in ./assets: hero (the film's last frame), blossoms-top, blossoms-bottom,
    band, brush, paper. The flowers and the brush are already laid on the paper colour. */
const FILES = import.meta.glob<string>("./assets/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" });
const art = (name: string) => Object.entries(FILES).find(([p]) => p.slice(p.lastIndexOf("/") + 1).replace(/\.\w+$/, "") === name)?.[1];

/** The invitation line under the flower band, per ceremony. */
const INVITE: Record<keyof typeof EVENT_TYPES, string> = {
  nikoh: "Katta mehr va minnatdorlik bilan sizni nikoh to‘yimizga taklif etamiz",
  fotiha: "Katta mehr va minnatdorlik bilan sizni fotiha to‘yimizga taklif etamiz",
  unashtiruv: "Katta mehr va minnatdorlik bilan sizni unashtiruv marosimimizga taklif etamiz",
  qizbazmi: "Katta mehr va minnatdorlik bilan sizni qiz bazmimizga taklif etamiz",
};
const PLACE_TITLE: Record<keyof typeof EVENT_TYPES, [string, string]> = {
  nikoh: ["Nikoh", "va ziyofat"],
  fotiha: ["Fotiha", "va ziyofat"],
  unashtiruv: ["Unashtiruv", "marosimi"],
  qizbazmi: ["Qiz", "bazmi"],
};

/** Without a film: the closed picture gives way to the mist this long after the tap. */
const POSTER_OUT = 1500;
const TO_SCENE = 2200;

const v = (k: string, val: string | number) => ({ [k]: val }) as CSSProperties;
const at = (i: number) => v("--i", i);

interface Props {
  data: InviteData;
  replayToken?: number;
  endSlot?: ReactNode;
}

export function NafosatInvitation({ data, replayToken = 0, endSlot }: Props) {
  const [stage, setStage] = useState<Stage>("closed");
  const [play, setPlay] = useState(false);
  const music = useMusic(data.music);
  const [film, setFilm] = useState<FilmSpec | null>(() =>
    typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? null : filmSpec("nafosat"),
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

  /** Without a film: the mist rises over the closed picture, which then gives way. */
  const runPosterOpening = () => {
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
    if (!film) runPosterOpening();
  };

  const filmFailed = () => {
    setFilm(null);
    runPosterOpening();
  };

  const names = `${data.groom} & ${data.bride}`;
  const nameSize = Math.min(box.w * 0.115, (box.w * 1.85) / Math.max(names.length, 8));
  const poster = filmSpec("nafosat")?.poster ?? art("hero");

  return (
    <div className="nf">
      <div className="nf-col">
        <section
          ref={heroRef}
          className="nf-hero"
          data-stage={stage}
          data-play={play || undefined}
          data-film={film ? "" : undefined}
          aria-label="Taklifnoma"
        >
          {stage !== "closed" && <RoadHero data={data} />}
          {stage !== "scene" &&
            (film ? (
              <Film
                spec={film}
                names={names}
                nameSize={nameSize}
                sub={formatDateDots(data.date)}
                box={box}
                state={stage}
                onOpen={open}
                onFail={filmFailed}
                onHandover={() => setPlay(true)}
                onDone={() => setStage("scene")}
              />
            ) : (
              <PosterCard poster={poster} names={names} nameSize={nameSize} date={formatDateDots(data.date)} state={stage} onOpen={open} />
            ))}
        </section>

        {stage === "scene" && <Sections data={data} endSlot={endSlot} />}
      </div>

      {music.available && stage === "scene" && (
        <button type="button" ref={coin} className="nf-music" onClick={music.toggle} aria-label={music.playing ? "Musiqani to‘xtatish" : "Musiqani yoqish"}>
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

/** The closed invitation for the gallery: the film's first frame with the names and date set on it. */
export function NafosatClosed({ data, box }: { data: InviteData; box: { w: number; h: number } }) {
  const film = filmSpec("nafosat");
  const names = `${data.groom} & ${data.bride}`;
  const nameSize = Math.min(box.w * 0.115, (box.w * 1.85) / Math.max(names.length, 8));
  return (
    <div className="film" aria-hidden="true">
      <img className="film-video" src={film?.poster ?? art("hero")} alt="" />
      <p className="film-names" style={{ top: `${(film?.names ?? 0.05) * 100}%`, fontSize: nameSize }}>
        {names}
      </p>
      <p className="film-sub" style={{ top: `${(film?.sub ?? 0.11) * 100}%`, fontSize: Math.max(7, box.w * 0.036) }}>
        {formatDateDots(data.date)}
      </p>
    </div>
  );
}

/** Without a film (reduced motion, or a phone that will not play it): the closed picture, tapped away. */
function PosterCard({
  poster,
  names,
  nameSize,
  date,
  state,
  onOpen,
}: {
  poster?: string;
  names: string;
  nameSize: number;
  date: string;
  state: Exclude<Stage, "scene">;
  onOpen: () => void;
}) {
  const closed = state === "closed";
  return (
    <div
      className="film nf-poster"
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
      style={v("--out", `${POSTER_OUT}ms`)}
    >
      {poster && <img className="film-video" src={poster} alt="" />}
      <p className="film-names" style={{ top: "5%", fontSize: nameSize }} aria-hidden="true">
        {names}
      </p>
      <p className="film-sub" style={{ top: "11%" }} aria-hidden="true">
        {date}
      </p>
      <p className="film-hint" style={{ top: "94%" }} aria-hidden="true">
        Ochish uchun bosing
      </p>
    </div>
  );
}

/** Two initials either side of a hairline with a small diamond: the couple's monogram. */
function Monogram({ data, className = "nf-mono", style }: { data: InviteData; className?: string; style?: CSSProperties }) {
  return (
    <p className={className} style={style} aria-label={`${data.groom} va ${data.bride}`}>
      <span>{data.groom.charAt(0).toUpperCase()}</span>
      <i aria-hidden="true">
        <b />
      </i>
      <span>{data.bride.charAt(0).toUpperCase()}</span>
    </p>
  );
}

/**
 * The road the car has left, under a cream mist that rises over it (and over the film's last second), with
 * the roses hanging into the top and the invitation written into the mist.
 */
function RoadHero({ data }: { data: InviteData }) {
  return (
    <>
      <img className="nf-photo" src={art("hero")} alt="" />
      <div className="nf-mist" aria-hidden="true" />
      <img className="nf-hero-flowers" src={art("blossoms-top")} alt="" aria-hidden="true" />
      <div className="nf-hero-text">
        <Monogram data={data} className="nf-mono nf-l" style={at(0)} />
        <p className="nf-l nf-hero-quote" style={at(1)}>
          «Taqdir bizni bir yo‘lga boshladi —<br />
          endi har bir qadamni birga bosamiz»
        </p>
        <h1 className="nf-hero-names">
          <span className="nf-l nf-hn" style={at(2)}>
            {data.groom}
          </span>
          <span className="nf-l nf-hn nf-hn-2" style={at(3)}>
            <em>&amp;</em> {data.bride}
          </span>
        </h1>
        <p className="nf-l nf-hero-date" style={at(4)}>
          {formatDateDots(data.date)}
        </p>
      </div>
      <div className="nf-l nf-cue" style={at(6)} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
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

const delay = (ms: number) => v("--d", `${ms}ms`);

function dialable(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `998${digits}` : digits;
}

function Sections({ data, endSlot }: { data: InviteData; endSlot?: ReactNode }) {
  const root = useReveal();
  const { d, m, y } = parseDate(data.date);
  const month = MONTHS[m - 1];
  const links = mapLinks(data);
  const phone = data.contactPhone?.trim();
  const dial = phone ? dialable(phone) : "";
  const reply = `Assalomu alaykum! ${data.groom} va ${data.bride}ning to‘yiga albatta boraman.`;
  const [t1, t2] = PLACE_TITLE[data.eventType];

  return (
    <div ref={root} className="nf-sections">
      {/* the invitation, laid on a band of roses */}
      <section className="nf-sec nf-invite">
        <div className="nf-band" data-reveal="wipe">
          <img src={art("band")} alt="" aria-hidden="true" />
          <p className="nf-band-text" data-reveal="up" style={delay(500)}>
            {INVITE[data.eventType]}
          </p>
        </div>
        <p className="nf-script nf-forever" data-reveal="write" style={delay(300)}>
          Bir umrga baxtli!
        </p>
      </section>

      {/* the date, large */}
      <section className="nf-sec nf-date">
        <div className="nf-wash" aria-hidden="true" />
        <div className="nf-bigdate" data-reveal="up">
          <span className="nf-day">{d}</span>
          <span className="nf-month" data-reveal="write" style={delay(450)}>
            {month.charAt(0).toUpperCase() + month.slice(1)}
          </span>
          <span className="nf-year">{y}</span>
        </div>
        <p className="nf-caps nf-when" data-reveal="up" style={delay(300)}>
          <i />
          {formatWeekday(data.date).toUpperCase()} <b>|</b> SOAT {data.time}
          <i />
        </p>
        <Countdown date={data.date} time={data.time} />
        {phone && (
          <a
            className="nf-round"
            href={`https://wa.me/${dial}?text=${encodeURIComponent(reply)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal="up"
            style={delay(450)}
          >
            <span className="nf-round-dot">
              <Icon kind="whatsapp" size={22} className="nf-ico" />
            </span>
            <span className="nf-round-label">Ishtirokni tasdiqlash</span>
          </a>
        )}
      </section>

      {/* where: a dusty-blue arch under the roses */}
      <section className="nf-sec nf-place">
        {/* wrappers are watched: an element that clips itself away reports itself in view only at its edge */}
        <div data-reveal="rise">
          <img className="nf-place-flowers" src={art("blossoms-bottom")} alt="" aria-hidden="true" />
        </div>
        <div className="nf-arch-wrap" data-reveal="arch">
        <div className="nf-arch">
          <div className="nf-arch-in">
            <Monogram data={data} className="nf-mono nf-mono-light" />
            <p className="nf-script nf-arch-title">
              <span>{t1}</span>
              <span>{t2}</span>
            </p>
            <p className="nf-caps nf-arch-venue">{data.venue}</p>
            {data.address && <p className="nf-arch-addr">{data.address}</p>}
            <a className="nf-round nf-round-light" href={links.google} target="_blank" rel="noopener noreferrer">
              <span className="nf-round-dot">
                <Icon kind="pin" size={22} className="nf-ico" />
              </span>
              <span className="nf-round-label">Xaritada ochish</span>
            </a>
            <a className="nf-arch-link" href={links.yandex} target="_blank" rel="noopener noreferrer">
              Yandex xaritada
            </a>
            <p className="nf-arch-quote">
              «Sevish — bir-biringizga qarash emas, balki birga bir tomonga qarashdir»
              <span>Antuan de Sent-Ekzyuperi</span>
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* To‘yana */}
      {data.giftCardNumber && (
        <section className="nf-sec nf-gift-sec">
          <div className="nf-gift-flowers" data-reveal="wipe">
            <img src={art("band")} alt="" aria-hidden="true" />
          </div>
          <p className="nf-caps nf-kick" data-reveal="up">
            Sovg‘a haqida
          </p>
          <h2 className="nf-script nf-title" data-reveal="write" style={delay(150)}>
            To‘yana
          </h2>
          <span className="nf-round-dot nf-gift-dot" data-reveal="up" style={delay(300)}>
            <Icon kind="gift" size={22} className="nf-ico" />
          </span>
          <p className="nf-p" data-reveal="up" style={delay(350)}>
            Siz uchun eng yaxshi sovg‘a — shu kuni yonimizda bo‘lishingiz. To‘yana yubormoqchi bo‘lsangiz, mana kartamiz:
          </p>
          <GiftCard number={data.giftCardNumber} holder={data.giftCardHolder} />
        </section>
      )}

      {/* a line under a dusty-blue brush stroke */}
      <section className="nf-sec nf-brush" data-reveal="wipe">
        <img src={art("brush")} alt="" aria-hidden="true" />
        <p>
          «Bir-biriga mehr ko‘rsatgan ikki qalb —<br />
          dunyodagi eng go‘zal uy»
        </p>
      </section>

      {/* the last word */}
      <section className="nf-sec nf-close">
        <div className="nf-wash nf-wash-low" aria-hidden="true" />
        <p className="nf-serif-line" data-reveal="up">
          Sizni intiqlik bilan kutamiz.
          <br />
          To‘yda ko‘rishguncha!
        </p>
        <p className="nf-script nf-close-names" data-reveal="write" style={delay(250)}>
          <span>{data.groom}</span>
          <span>
            <em>&amp;</em> {data.bride}
          </span>
        </p>
        {phone && (
          <p className="nf-contact" data-reveal="up" style={delay(400)}>
            Savollar uchun: <a href={`tel:+${dial}`}>{phone}</a>
          </p>
        )}
        {endSlot && <div className="nf-end">{endSlot}</div>}
        <img className="nf-close-flowers" src={art("blossoms-bottom")} alt="" aria-hidden="true" />
      </section>
    </div>
  );
}

function Countdown({ date, time }: { date: string; time: string }) {
  const c = useCountdown(eventTimestamp(date, time));
  if (c.done) return <p className="nf-left">Baxtli kun keldi!</p>;
  return (
    <p className="nf-left" data-reveal="up" style={delay(400)}>
      To‘ygacha <b>{c.days}</b> kun qoldi
    </p>
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
    <div className="nf-gift" data-reveal="up" style={delay(450)}>
      <div className="nf-gift-card">
        <span className="nf-gift-net">{network || "KARTA"}</span>
        <p className="nf-gift-number" aria-label={`Karta raqami ${groups.join(" ")}`}>
          {groups.map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </p>
        {holder && <p className="nf-gift-holder">{holder}</p>}
      </div>
      <button type="button" className="nf-pill" onClick={copy} aria-live="polite">
        {copied ? "Nusxa olindi" : "Karta raqamini nusxalash"}
      </button>
    </div>
  );
}
