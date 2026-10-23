import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { loadConfig, type PublicConfig } from "@/lib/api";
import { IconInstagram, IconPhone, IconTelegram } from "./Icons";

export function useConfig() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  useEffect(() => {
    loadConfig().then(setConfig, () => undefined);
  }, []);
  return config;
}

export function Logo({ name = "Visol", light = false }: { name?: string; light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2" aria-label={`${name} — bosh sahifa`}>
      <span
        className="grid h-7 w-7 place-items-center rounded-full"
        style={{ boxShadow: `inset 0 0 0 1px ${light ? "rgba(255,255,255,.4)" : "rgba(176,141,69,.55)"}` }}
      >
        <span className="h-[7px] w-[7px] rotate-45 bg-gold transition-transform duration-500 group-hover:rotate-[225deg]" />
      </span>
      <span className={`font-serif text-[24px] leading-none font-medium italic ${light ? "text-white" : "text-ink"}`}>{name}</span>
    </Link>
  );
}

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  const config = useConfig();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled ? "bg-ivory/80 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between">
        <Logo name={config?.brandName} />
        <nav className="hidden items-center gap-8 text-[14px] text-ink-soft md:flex">
          <Link href="/#shablonlar" className="hover:text-ink">
            Shablonlar
          </Link>
          <Link href="/#imkoniyatlar" className="hover:text-ink">
            Imkoniyatlar
          </Link>
          <Link href="/#narxlar" className="hover:text-ink">
            Narxlar
          </Link>
          <Link href="/#savollar" className="hover:text-ink">
            Savollar
          </Link>
        </nav>
        {cta && (
          <Link href="/yaratish" className="btn btn-dark btn-sm">
            Buyurtma berish
          </Link>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  const config = useConfig();
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="container-x flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo name={config?.brandName} />
          <p className="mt-4 text-[14px] leading-relaxed text-stone">
            O‘zbek oilalari uchun premium raqamli to‘y taklifnomalari. Har bir taklifnoma — mehmon qo‘lida ochiladigan kichik
            mo‘jiza.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-[14px] md:gap-16">
          <div className="space-y-3">
            <p className="eyebrow !text-stone">Sahifalar</p>
            <Link href="/#shablonlar" className="block text-ink-soft hover:text-ink">
              Shablonlar
            </Link>
            <Link href="/#narxlar" className="block text-ink-soft hover:text-ink">
              Narxlar
            </Link>
            <Link href="/yaratish" className="block text-ink-soft hover:text-ink">
              Taklifnoma yaratish
            </Link>
          </div>
          <div className="space-y-3">
            <p className="eyebrow !text-stone">Aloqa</p>
            {config?.instagram && (
              <a href={`https://instagram.com/${config.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-ink-soft hover:text-ink">
                <IconInstagram size={16} /> @{config.instagram}
              </a>
            )}
            {config?.telegram && (
              <a href={`https://t.me/${config.telegram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-ink-soft hover:text-ink">
                <IconTelegram size={16} /> @{config.telegram}
              </a>
            )}
            {config?.phone && (
              <a href={`tel:${config.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-ink-soft hover:text-ink">
                <IconPhone size={16} /> {config.phone}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="container-x pb-10 text-[12px] text-stone">© {new Date().getFullYear()} {config?.brandName ?? "Visol"}. Barcha huquqlar himoyalangan.</div>
    </footer>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Yuklanmoqda"
    />
  );
}

export function PageLoader() {
  return (
    <div className="grid min-h-screen-safe place-items-center text-gold">
      <Spinner />
    </div>
  );
}

export function ErrorState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="grid min-h-screen-safe place-items-center px-6 text-center">
      <div>
        <div className="mx-auto mb-6 h-3 w-3 rotate-45 bg-gold" />
        <h1 className="font-serif text-[34px] leading-tight">{title}</h1>
        {text && <p className="mx-auto mt-3 max-w-sm text-[15px] text-stone">{text}</p>}
        <div className="mt-8">{action ?? <Link href="/" className="btn btn-dark">Bosh sahifaga</Link>}</div>
      </div>
    </div>
  );
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2400);
    return () => clearTimeout(id);
  }, [message, onDone]);
  return (
    <div className="fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-[14px] text-white shadow-xl">
      {message}
    </div>
  );
}
