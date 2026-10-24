import { memo, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { EVENT_TYPES, type TemplateId } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { formatDateDots, formatWeekday, initials } from "@shared/format";
import { getTheme, themeVars } from "@/lib/themes";
import { Artwork, panelStyle } from "./Artwork";
import { Bow } from "./Ribbon";
import "./gatefold.css";

export type GatefoldState = "closed" | "opening" | "open";

/** Total time from tap until the card rests open (keep in sync with gatefold.css). */
export const OPEN_DURATION = 3000;

export type CardData = Pick<InviteData, "groom" | "bride" | "date" | "time" | "venue" | "eventType" | "bismillah">;

interface GatefoldProps {
  template: TemplateId;
  data: CardData;
  width: number;
  state: GatefoldState;
  onRequestOpen?: () => void;
  interactive?: boolean;
  entrance?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Replaces the couple's names on the closed card (used for generic previews). */
  frontTitle?: string;
}

/* ------------------------------------------------------------------ */

const CREASES = ["M0,0 L200,300", "M200,0 L0,300", "M100,0 L0,150 L100,300", "M100,0 L200,150 L100,300"];

const Creases = memo(function Creases() {
  return (
    <svg className="gf-creases" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      {CREASES.map((d, i) => (
        <g key={i} fill="none" opacity={i < 2 ? 1 : 0.7}>
          <path d={d} stroke="var(--crease-light)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" transform="translate(0.35 0.35)" />
          <path d={d} stroke="var(--crease)" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
      <path d="M100,0 V300" stroke="rgba(0,0,0,.16)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
});

function FrontArt({ data, script, w, title }: { data: CardData; script: boolean; w: number; title?: string }) {
  const names = title ?? `${data.groom || "Kuyov"} & ${data.bride || "Kelin"}`;
  const len = Math.max(names.length, 8);
  const nameSize = script ? w * Math.min(0.1, 1.8 / len) : w * Math.min(0.052, 1.0 / len);
  return (
    <div className="gf-front-art">
      <Creases />
      <div
        className="gf-txt gf-names"
        style={
          script
            ? { fontFamily: "'Pinyon Script', cursive", fontSize: nameSize }
            : {
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: nameSize,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 500,
              }
        }
      >
        {names}
      </div>
      {data.date && <div className="gf-txt gf-date">{formatDateDots(data.date)}</div>}
      {!title && <div className="gf-mono">{initials(data.groom, data.bride).split("").join(" ")}</div>}
      <div className="gf-txt gf-tap">OCHISH UCHUN BOSING</div>
    </div>
  );
}

function Face({ className, children }: { className: string; children?: React.ReactNode }) {
  return (
    <div className={`gf-face ${className}`}>
      {children}
      <i className="gf-shade" />
    </div>
  );
}

function Door({ side, front }: { side: "l" | "r"; front: React.ReactNode }) {
  return (
    <div className={`gf-door gf-door-${side}`}>
      <Face className="gf-base">{front}</Face>
      <Face className="gf-back" />
      <div className={`gf-flap gf-flap-${side}t`}>
        <Face className="gf-front">{front}</Face>
        <Face className="gf-back" />
      </div>
      <div className={`gf-flap gf-flap-${side}b`}>
        <Face className="gf-front">{front}</Face>
        <Face className="gf-back" />
      </div>
    </div>
  );
}

export function InnerText({ template, data }: { template: TemplateId; data: CardData }) {
  const theme = getTheme(template);
  const script = theme.nameFont === "script";
  const longest = Math.max(data.groom.length, data.bride.length, 5);
  const nameEm = script ? Math.min(2.9, 30 / longest) : Math.min(2.2, 21 / longest);
  const line = (i: number): CSSProperties => ({ ["--i" as string]: i });
  return (
    <div className="gf-inner-text" style={panelStyle(template)}>
      {data.bismillah && (
        <span className="gf-in-line gf-in-bism" style={line(0)}>
          Bismillahir Rohmanir Rohiym
        </span>
      )}
      <span className="gf-in-line gf-in-eyebrow" style={line(1)}>
        {EVENT_TYPES[data.eventType]}
      </span>
      <span className={`gf-in-name ${script ? "gf-in-script" : "gf-in-serif"}`} style={{ ...line(2), fontSize: `${nameEm}em` }}>
        {data.groom || "Kuyov"}
      </span>
      <span className="gf-in-line gf-in-amp" style={line(3)}>
        &amp;
      </span>
      <span className={`gf-in-name ${script ? "gf-in-script" : "gf-in-serif"}`} style={{ ...line(4), fontSize: `${nameEm}em` }}>
        {data.bride || "Kelin"}
      </span>
      <span className="gf-in-line gf-in-divider" style={line(5)} aria-hidden="true">
        <i />
        <b />
        <i />
      </span>
      {data.date && (
        <span className="gf-in-line gf-in-date" style={line(6)}>
          {formatDateDots(data.date)}
        </span>
      )}
      {data.date && (
        <span className="gf-in-line gf-in-meta" style={line(7)}>
          {formatWeekday(data.date)} · soat {data.time}
        </span>
      )}
      {data.venue && (
        <span className="gf-in-line gf-in-venue" style={line(8)}>
          {data.venue}
        </span>
      )}
    </div>
  );
}

export const Gatefold = memo(function Gatefold({
  template,
  data,
  width,
  state,
  onRequestOpen,
  interactive = true,
  entrance = false,
  className = "",
  style,
  frontTitle,
}: GatefoldProps) {
  const theme = getTheme(template);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const front = <FrontArt data={data} script={theme.nameFont === "script"} w={width} title={frontTitle} />;
  const canOpen = interactive && state === "closed";

  const onKey = (e: KeyboardEvent) => {
    if (canOpen && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onRequestOpen?.();
    }
  };

  return (
    <div
      className={`gf ${className}`}
      data-state={state}
      data-finish={theme.door.finish}
      data-interactive={interactive}
      data-entrance={entrance}
      style={{ ...themeVars(theme), ["--w" as string]: `${width}px`, ...style }}
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      aria-label={canOpen ? "Taklifnomani ochish" : undefined}
      onClick={canOpen ? onRequestOpen : undefined}
      onKeyDown={onKey}
    >
      <div className="gf-ground" />
      <div className="gf-scene">
        <div className="gf-card">
          <div className="gf-pocket">
            <svg className="gf-pocket-lines" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M0,0 L8,18 M200,0 L192,18 M0,300 L8,282 M200,300 L192,282"
                stroke="rgba(0,0,0,.1)"
                vectorEffect="non-scaling-stroke"
              />
              <path d="M0,0.5 L100,12 L200,0.5" fill="none" stroke="rgba(0,0,0,.08)" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="gf-inner">
              {/* Static thumbnails never reveal the inside — skip its (heavy) artwork. */}
              {(interactive || state !== "closed") && (
                <>
                  <Artwork template={template} />
                  <InnerText template={template} data={data} />
                </>
              )}
              <div className="gf-cast" />
            </div>
          </div>
          <Door side="l" front={front} />
          <Door side="r" front={front} />
          <div className="gf-ribbon">
            <div className="gf-band gf-band-l" />
            <div className="gf-band gf-band-r" />
            <Bow uid={uid} />
            <div className="gf-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* State helpers                                                       */
/* ------------------------------------------------------------------ */

export function useGatefold(onOpened?: () => void) {
  const [state, setState] = useState<GatefoldState>("closed");
  const timer = useRef<number | undefined>(undefined);
  const openedRef = useRef(onOpened);
  openedRef.current = onOpened;

  const open = useCallback(() => {
    setState((s) => {
      if (s !== "closed") return s;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setState("open");
        openedRef.current?.();
      }, OPEN_DURATION);
      return "opening";
    });
  }, []);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setState("closed");
  }, []);

  const skip = useCallback(() => {
    window.clearTimeout(timer.current);
    setState("open");
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { state, open, reset, skip };
}
