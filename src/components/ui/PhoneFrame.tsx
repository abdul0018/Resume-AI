import { useEffect, useRef, useState, type ReactNode } from "react";

const W = 375;
const H = 780;

/** iPhone-like frame that scales its fixed-size screen to the available box. */
export function PhoneFrame({ children, maxHeight }: { children: ReactNode; maxHeight?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const calc = () => {
      const limit = maxHeight ?? window.innerHeight - 130;
      const width = boxRef.current?.parentElement?.clientWidth ?? W;
      setScale(Math.min(1, (limit - 24) / (H + 24), (width - 8) / (W + 24)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [maxHeight]);

  return (
    <div ref={boxRef} style={{ width: (W + 24) * scale, height: (H + 24) * scale }} className="relative mx-auto">
      <div
        className="absolute top-0 left-0 origin-top-left rounded-[58px] bg-[#111] p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,.55),inset_0_0_0_2px_#2b2b2b]"
        style={{ width: W + 24, height: H + 24, transform: `scale(${scale})` }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[46px] bg-white">
          <div className="pointer-events-none absolute top-[11px] left-1/2 z-50 h-[30px] w-[108px] -translate-x-1/2 rounded-full bg-black" />
          <div data-scroll-root className="no-scrollbar relative h-full w-full overflow-y-auto overscroll-contain">{children}</div>
        </div>
      </div>
    </div>
  );
}
