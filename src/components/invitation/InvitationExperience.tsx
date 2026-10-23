import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { PACKAGE_FLAGS, type OrderStatus, type PackageId, type TemplateId } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { eventTimestamp, formatDateLong, formatWeekday, parseDate, MONTHS } from "@shared/format";
import { getTheme, themeVars } from "@/lib/themes";
import { useCountdown, useMusic, useReveal } from "@/lib/hooks";
import { defaultMessage, mapLinks } from "@/lib/invite";
import { playOpeningSounds, unlockAudio } from "@/lib/media";
import { absoluteUrl, copyText, nativeShare, shareLinks } from "@/lib/share";
import { api } from "@/lib/api";
import { Link } from "@/lib/router";
import { Gatefold, OPEN_DURATION, useGatefold } from "./Gatefold";
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconCopy,
  IconMap,
  IconMusic,
  IconTelegram,
  IconWhatsapp,
} from "../ui/Icons";
import "./invite.css";

export type InviteMode = "live" | "demo" | "preview";

interface Props {
  template: TemplateId;
  data: InviteData;
  pkg?: PackageId;
  slug?: string;
  status?: OrderStatus;
  mode: InviteMode;
  /** Render inside a scrolling container (phone preview) instead of the window. */
  embedded?: boolean;
  /** Changing this value closes the card again (replay). */
  replayToken?: number;
  startOpen?: boolean;
  sound?: boolean;
  brandName?: string;
  /** Space reserved at the bottom for overlaid UI (e.g. the demo CTA bar). */
  bottomInset?: number;
}

export function InvitationExperience({
  template,
  data,
  pkg = "premium",
  slug,
  status = "active",
  mode,
  embedded = false,
  replayToken = 0,
  startOpen = false,
  sound = true,
  brandName = "Visol",
  bottomInset = 0,
}: Props) {
  const theme = getTheme(template);
  const flags = mode === "live" ? PACKAGE_FLAGS[pkg] : { photos: true, music: true, rsvp: true };
  const music = useMusic(flags.music ? data.music : "none");
  const [opened, setOpened] = useState(startOpen);
  const gate = useGatefold(() => setOpened(true));
  const heroRef = useRef<HTMLElement>(null);
  const [cardW, setCardW] = useState(embedded ? 280 : 340);
  const [embedH, setEmbedH] = useState<number>();
  const scrollRoot = () => heroRef.current?.closest<HTMLElement>("[data-scroll-root]") ?? null;

  // Card size follows the hero box: the viewport, or the scroll container when embedded.
  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const box = embedded ? scrollRoot() ?? el : el;
    const measure = () => {
      // Layout size (unaffected by the phone frame's scale transform)
      const width = box.clientWidth;
      const height = box.clientHeight;
      if (embedded) setEmbedH(Math.round(height));
      setCardW(Math.round(Math.max(200, Math.min(width * 0.84, (height - 120) / 1.5, 440))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedded]);

  useEffect(() => {
    if (startOpen) gate.skip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startOpen]);

  // Replay from the builder
  const firstReplay = useRef(replayToken);
  useEffect(() => {
    if (replayToken === firstReplay.current) return;
    gate.reset();
    setOpened(false);
    if (embedded) scrollRoot()?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken]);

  // Lock page scroll until the card is opened (full-page mode only).
  useEffect(() => {
    if (embedded) return;
    const root = document.documentElement;
    if (gate.state !== "open") {
      root.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else root.style.overflow = "";
    return () => {
      root.style.overflow = "";
    };
  }, [gate.state, embedded]);

  // Keep the browser chrome in theme colors.
  useEffect(() => {
    if (embedded) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = meta?.getAttribute("content");
    meta?.setAttribute("content", theme.page.bg);
    return () => {
      if (prev) meta?.setAttribute("content", prev);
    };
  }, [embedded, theme.page.bg]);

  const handleOpen = () => {
    // Inside the tap gesture: unlock audio for iOS / Instagram.
    if (sound) {
      unlockAudio();
      playOpeningSounds();
    }
    music.play();
    gate.open();
  };

  // Mount content as soon as the opening starts so it is ready to scroll to.
  const showContent = opened || gate.state !== "closed";
  const preview = mode !== "live" || status !== "active";

  return (
    <div className="inv" style={themeVars(theme)} data-dark={theme.dark ? "true" : "false"} data-embedded={embedded}>
      {mode === "live" && status !== "active" && <div className="inv-badge">Namuna · to‘lovdan so‘ng faollashadi</div>}
      {music.available && gate.state !== "closed" && (
        <button
          type="button"
          className="inv-music"
          onClick={music.toggle}
          aria-label={music.playing ? "Musiqani o‘chirish" : "Musiqani yoqish"}
        >
          {music.playing ? (
            <span className="inv-eq" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : (
            <IconMusic size={18} />
          )}
        </button>
      )}

      <section
        ref={heroRef}
        className={`inv-hero ${embedded ? "" : "h-screen-safe"}`}
        style={embedded ? { height: embedH ?? 600 } : undefined}
        data-state={gate.state}
      >
        <p className="inv-hero-lead">Sizga maxsus taklifnoma</p>
        <Gatefold template={template} data={data} width={cardW} state={gate.state} onRequestOpen={handleOpen} entrance />
        {gate.state === "open" && (
          <div className="inv-cue" aria-hidden="true" style={bottomInset ? { bottom: bottomInset } : undefined}>
            <span>Batafsil</span>
            <IconChevronDown size={18} />
          </div>
        )}
      </section>

      {showContent && (
        <InviteContent
          template={template}
          data={data}
          slug={slug}
          flags={flags}
          preview={preview}
          mode={mode}
          brandName={brandName}
          delay={opened ? 0 : OPEN_DURATION}
        />
      )}
      {showContent && bottomInset > 0 && <div style={{ height: bottomInset }} aria-hidden="true" />}
    </div>
  );
}

/* ================================================================== */
/* Scrollable content                                                  */
/* ================================================================== */

function Ornament() {
  return (
    <div className="inv-ornament" aria-hidden="true">
      <i />
      <b />
      <i />
    </div>
  );
}

function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto w-full max-w-[560px] px-6 py-16 text-center ${className}`}>{children}</section>;
}

function InviteContent({
  template,
  data,
  slug,
  flags,
  preview,
  mode,
  brandName,
  delay,
}: {
  template: TemplateId;
  data: InviteData;
  slug?: string;
  flags: { photos: boolean; music: boolean; rsvp: boolean };
  preview: boolean;
  mode: InviteMode;
  brandName: string;
  delay: number;
}) {
  const ref = useReveal<HTMLDivElement>([data.photos.length, data.program.length, flags.rsvp, template]);
  const message = data.message || defaultMessage(data);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div ref={ref} style={{ animation: `inv-fade-in 0.6s ${delay}ms both` }}>
      {/* Greeting */}
      <Section className="pt-20">
        <div className="reveal">
          <p className="inv-eyebrow">Assalomu alaykum</p>
          <h2 className="inv-title mt-4 text-[34px]">Qadrli mehmon!</h2>
          <div className="my-7">
            <Ornament />
          </div>
          <p className="mx-auto max-w-[460px] font-serif text-[20px] leading-[1.6]">{message}</p>
          {data.hosts && (
            <p className="inv-muted mt-8 text-[13px] tracking-wide">
              Hurmat bilan,
              <br />
              <span className="inv-title mt-1 inline-block text-[21px] italic" style={{ color: "var(--pg-ink)" }}>
                {data.hosts}
              </span>
            </p>
          )}
        </div>
      </Section>

      {/* Date + countdown */}
      <Section>
        <div className="reveal">
          <p className="inv-eyebrow">To‘y sanasi</p>
          <h2 className="inv-title mt-4 text-[30px]">{formatDateLong(data.date)}</h2>
          <p className="inv-muted mt-2 text-[14px] tracking-wide">
            {formatWeekday(data.date)} · soat {data.time}
          </p>
        </div>
        <div className="reveal inv-surface mx-auto mt-9 max-w-[380px] rounded-[24px] p-6" style={{ ["--delay" as string]: "120ms" }}>
          <MonthCalendar date={data.date} />
        </div>
        <div className="reveal mt-10" style={{ ["--delay" as string]: "200ms" }}>
          <Countdown date={data.date} time={data.time} />
        </div>
        {slug && !preview && (
          <a className="inv-btn inv-btn-ghost reveal mt-8" href={`/api/invites/${slug}/calendar.ics`}>
            <IconCalendar size={18} /> Kalendarga qo‘shish
          </a>
        )}
      </Section>

      {/* Program */}
      {data.program.length > 0 && (
        <Section>
          <div className="reveal">
            <p className="inv-eyebrow">Kun tartibi</p>
            <h2 className="inv-title mt-4 text-[30px]">To‘y dasturi</h2>
          </div>
          <ol className="relative mx-auto mt-10 max-w-[360px] text-left">
            <span className="absolute top-2 bottom-2 left-[71px] w-px" style={{ background: "var(--pg-line)" }} aria-hidden="true" />
            {data.program.map((p, i) => (
              <li key={i} className="reveal relative flex items-start gap-6 py-4" style={{ ["--delay" as string]: `${i * 90}ms` }}>
                <span className="inv-title w-[52px] shrink-0 text-right text-[20px]">{p.time}</span>
                <span
                  className="relative z-10 mt-[9px] h-[9px] w-[9px] shrink-0 rotate-45"
                  style={{ background: "var(--pg-accent)", boxShadow: "0 0 0 5px var(--pg-bg)" }}
                />
                <span className="text-[15.5px] leading-snug">{p.title}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Photos */}
      {flags.photos && data.photos.length > 0 && (
        <section className="py-16">
          <div className="reveal px-6 text-center">
            <p className="inv-eyebrow">Bizning hikoyamiz</p>
            <h2 className="inv-script mt-3 text-[46px]">
              {data.groom} &amp; {data.bride}
            </h2>
          </div>
          <div className="no-scrollbar reveal mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[14%] pb-6">
            {data.photos.map((src) => (
              <button key={src} type="button" className="inv-photo" onClick={() => setLightbox(src)} aria-label="Rasmni kattalashtirish">
                <img src={src} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Venue */}
      <Section>
        <div className="reveal">
          <p className="inv-eyebrow">Manzil</p>
          <h2 className="inv-title mt-4 text-[30px]">{data.venue}</h2>
          {data.address && <p className="inv-muted mx-auto mt-3 max-w-[400px] text-[14.5px] leading-relaxed">{data.address}</p>}
          {data.dressCode && (
            <p className="mt-4 text-[13.5px]">
              <span className="inv-muted">Kiyinish uslubi:</span> {data.dressCode}
            </p>
          )}
        </div>
        <VenueMap data={data} />
      </Section>

      {/* RSVP */}
      {flags.rsvp && (
        <Section>
          <div className="reveal">
            <p className="inv-eyebrow">Javobingizni kutamiz</p>
            <h2 className="inv-title mt-4 text-[30px]">Tashrifingizni tasdiqlang</h2>
            <p className="inv-muted mx-auto mt-3 max-w-[360px] text-[14px] leading-relaxed">
              Iltimos, to‘y kunidan oldin kelish-kelmasligingizni bildiring.
            </p>
          </div>
          <Rsvp slug={slug} simulate={preview} />
        </Section>
      )}

      {/* Closing */}
      <Section className="pb-12">
        <div className="reveal">
          <Ornament />
          <p className="inv-title mt-8 text-[22px] italic">Sizni intiqlik bilan kutamiz!</p>
          <p className="inv-script mt-4 text-[48px]" style={{ color: "var(--pg-accent)" }}>
            {data.groom} &amp; {data.bride}
          </p>
        </div>
        {mode !== "preview" && <ShareRow slug={slug} data={data} />}
      </Section>

      {mode !== "preview" && (
        <footer className="pb-[max(28px,env(safe-area-inset-bottom))] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] tracking-wide"
            style={{ color: "var(--pg-muted)", boxShadow: "inset 0 0 0 1px var(--pg-line)" }}
          >
            <span className="font-serif text-[15px] italic" style={{ color: "var(--pg-ink)" }}>
              {brandName}
            </span>
            · o‘z taklifnomangizni yarating
          </Link>
        </footer>
      )}

      {lightbox && (
        <button
          type="button"
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          aria-label="Yopish"
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
          <span className="absolute top-4 right-4 text-white">
            <IconClose size={26} />
          </span>
        </button>
      )}
    </div>
  );
}

function MonthCalendar({ date }: { date: string }) {
  const { y, m, d } = parseDate(date);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = Sunday
  const offset = (first + 6) % 7; // Monday-first
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div>
      <p className="inv-title mb-4 text-[20px] capitalize">
        {MONTHS[m - 1]} {y}
      </p>
      <div className="inv-cal">
        {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((w) => (
          <div key={w} className="inv-muted pb-1 text-[11px] font-semibold tracking-wider">
            {w}
          </div>
        ))}
        {cells.map((c, i) => (
          <div key={i} className={`inv-cal-day ${c === d ? "is-target" : ""}`}>
            <span>{c ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Countdown({ date, time }: { date: string; time: string }) {
  const c = useCountdown(eventTimestamp(date, time));
  if (c.done) return <p className="inv-title text-[22px] italic">Baxtli kun keldi! Tashrifingiz uchun rahmat.</p>;
  const cells: [number, string][] = [
    [c.days, "kun"],
    [c.hours, "soat"],
    [c.minutes, "daqiqa"],
    [c.seconds, "soniya"],
  ];
  return (
    <div>
      <p className="inv-eyebrow mb-5">To‘ygacha qoldi</p>
      <div className="mx-auto grid max-w-[380px] grid-cols-4 gap-2">
        {cells.map(([n, label]) => (
          <div key={label} className="inv-surface rounded-[18px] px-1 py-4">
            <div className="inv-count">{String(n).padStart(2, "0")}</div>
            <div className="inv-muted mt-2 text-[11px] tracking-[0.14em] uppercase">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VenueMap({ data }: { data: InviteData }) {
  const links = mapLinks(data);
  const [load, setLoad] = useState(false);
  const holder = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = holder.current;
    if (!el || !("IntersectionObserver" in window)) return setLoad(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setLoad(true), io.disconnect()), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="reveal mt-8" style={{ ["--delay" as string]: "120ms" }}>
      <div ref={holder} className="inv-map overflow-hidden">
        {load && <iframe title="Xarita" src={links.embed} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <a className="inv-btn" href={links.google} target="_blank" rel="noopener noreferrer">
          <IconMap size={18} /> Google Maps
        </a>
        <a className="inv-btn inv-btn-ghost" href={links.yandex} target="_blank" rel="noopener noreferrer">
          <IconMap size={18} /> Yandex
        </a>
      </div>
    </div>
  );
}

function Rsvp({ slug, simulate }: { slug?: string; simulate: boolean }) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Ismingizni kiriting");
    if (attending === null) return setError("Kelishingizni belgilang");
    setState("sending");
    try {
      if (!simulate && slug) await api.rsvp(slug, { name, attending, guests, message });
      else await new Promise((r) => setTimeout(r, 600));
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="reveal is-visible inv-surface mx-auto mt-8 max-w-[400px] rounded-[24px] px-6 py-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--pg-accent)", color: "var(--pg-on-accent)" }}>
          <IconCheck size={26} />
        </div>
        <p className="inv-title mt-5 text-[24px]">Rahmat, {name.split(" ")[0]}!</p>
        <p className="inv-muted mt-2 text-[14px]">
          {attending ? "Sizni to‘yda ko‘rishdan xursand bo‘lamiz." : "Javobingiz uchun rahmat. Duolaringiz biz bilan."}
        </p>
        {simulate && <p className="inv-muted mt-4 text-[12px]">(Namuna rejimi — javob saqlanmadi)</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="reveal mx-auto mt-8 max-w-[400px] space-y-3 text-left" noValidate>
      <input className="inv-field" placeholder="Ism va familiyangiz" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setAttending(v)}
            className="inv-field text-center text-[14.5px] font-semibold transition"
            style={attending === v ? { background: "var(--pg-accent)", color: "var(--pg-on-accent)", borderColor: "var(--pg-accent)" } : undefined}
            aria-pressed={attending === v}
          >
            {v ? "Albatta kelaman" : "Kela olmayman"}
          </button>
        ))}
      </div>
      {attending && (
        <label className="inv-field flex items-center justify-between">
          <span className="text-[14.5px]">Necha kishi bo‘lasiz?</span>
          <span className="flex items-center gap-3">
            <button type="button" className="h-8 w-8 rounded-full text-[18px]" style={{ boxShadow: "inset 0 0 0 1px var(--pg-line)" }} onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Kamaytirish">
              −
            </button>
            <span className="w-5 text-center font-semibold">{guests}</span>
            <button type="button" className="h-8 w-8 rounded-full text-[18px]" style={{ boxShadow: "inset 0 0 0 1px var(--pg-line)" }} onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="Ko‘paytirish">
              +
            </button>
          </span>
        </label>
      )}
      <textarea className="inv-field min-h-[96px]" placeholder="Kelin-kuyovga tilaklaringiz (ixtiyoriy)" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} />
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <button type="submit" className="inv-btn w-full" disabled={state === "sending"}>
        {state === "sending" ? "Yuborilmoqda…" : "Javobni yuborish"}
      </button>
    </form>
  );
}

function ShareRow({ slug, data }: { slug?: string; data: InviteData }) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(slug ? `/i/${slug}` : window.location.pathname);
  const text = `${data.groom} & ${data.bride} — to‘yimizga taklifnoma 💍`;
  const copy = async () => {
    if (await nativeShare(url, text, text)) return;
    if (await copyText(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <div className="reveal mt-10">
      <p className="inv-muted mb-4 text-[12px] tracking-[0.2em] uppercase">Taklifnomani ulashing</p>
      <div className="flex justify-center gap-3">
        <a className="inv-btn inv-btn-ghost !px-4" href={shareLinks.telegram(url, text)} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
          <IconTelegram />
        </a>
        <a className="inv-btn inv-btn-ghost !px-4" href={shareLinks.whatsapp(url, text)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <IconWhatsapp />
        </a>
        <button type="button" className="inv-btn inv-btn-ghost" onClick={copy}>
          {copied ? <IconCheck size={18} /> : <IconCopy size={18} />} {copied ? "Nusxalandi" : "Havola"}
        </button>
      </div>
    </div>
  );
}
