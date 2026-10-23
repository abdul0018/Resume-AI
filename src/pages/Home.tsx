import { useEffect, useRef, useState } from "react";
import { DEFAULT_PACKAGES, DEFAULT_TEMPLATES, type TemplateId, type TemplateMeta } from "@shared/constants";
import { formatPrice } from "@shared/format";
import { Gatefold, useGatefold } from "@/components/invitation/Gatefold";
import { SiteFooter, SiteHeader, useConfig } from "@/components/ui/Site";
import {
  IconArrowRight,
  IconCalendar,
  IconCamera,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconLink,
  IconMap,
  IconMusic,
  IconReplay,
  IconSparkle,
  IconUsers,
} from "@/components/ui/Icons";
import { Link } from "@/lib/router";
import { useReveal } from "@/lib/hooks";
import { SAMPLE_DATA } from "@/lib/invite";
import { THEMES } from "@/lib/themes";
import { playOpeningSounds, unlockAudio } from "@/lib/media";

export default function Home() {
  const config = useConfig();
  const templates = config?.templates ?? DEFAULT_TEMPLATES;
  const packages = config?.packages ?? DEFAULT_PACKAGES;
  const minPrice = Math.min(...packages.map((p) => p.price));
  const ref = useReveal<HTMLDivElement>([templates.length, packages.length]);

  useEffect(() => {
    document.title = `${config?.brandName ?? "Visol"} — premium raqamli to‘y taklifnomalari`;
  }, [config?.brandName]);

  return (
    <div ref={ref}>
      <SiteHeader />
      <Hero templates={templates} minPrice={minPrice} />
      <Steps />
      <Templates templates={templates} />
      <Features />
      <Compare />
      <Pricing packages={packages} />
      <Faq />
      <FinalCta />
      <SiteFooter />
      <StickyCta minPrice={minPrice} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Hero({ templates, minPrice }: { templates: TemplateMeta[]; minPrice: number }) {
  const [template, setTemplate] = useState<TemplateId>(templates[0]?.id ?? "rishton");
  const gate = useGatefold();
  const [w, setW] = useState(300);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setW(vw >= 1024 ? Math.min(400, (vh - 160) / 1.5) : Math.round(Math.max(230, Math.min(vw * 0.74, (vh - 230) / 1.5, 360))));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const pick = (id: TemplateId) => {
    setTemplate(id);
    gate.reset();
  };

  const open = () => {
    unlockAudio();
    playOpeningSounds();
    gate.open();
  };

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 40%, rgba(255,255,255,.9), rgba(255,255,255,0) 70%), radial-gradient(50% 40% at 10% 90%, rgba(216,192,138,.18), transparent 70%)",
        }}
      />
      <div className="container-x relative grid items-center gap-6 pt-4 pb-16 lg:min-h-[calc(100svh-64px)] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-10">
        <div className="text-center lg:text-left">
          <p className="eyebrow reveal">Raqamli to‘y taklifnomalari</p>
          <h1 className="reveal mt-4 font-serif text-[38px] leading-[1.04] font-medium tracking-[-0.01em] text-ink sm:text-[52px] lg:text-[68px]" style={{ ["--delay" as string]: "80ms" }}>
            Mehmonlaringiz qo‘lida <em className="text-gold">ochiladigan</em> taklifnoma
          </h1>
          <p className="reveal mx-auto mt-5 hidden max-w-[480px] text-[17px] leading-relaxed text-ink-soft lg:mx-0 lg:block" style={{ ["--delay" as string]: "160ms" }}>
            Lenta yechiladi, eshiklar ochiladi — va mehmoningiz to‘yingizga taklif qilinadi. Ortga sanoq, xarita, musiqa va mehmonlar
            javobi bilan. 15 daqiqada tayyor.
          </p>
          <div className="reveal mt-9 hidden gap-3 lg:flex" style={{ ["--delay" as string]: "240ms" }}>
            <Link href={`/yaratish?t=${template}`} className="btn btn-dark">
              Taklifnoma yaratish <IconArrowRight size={18} />
            </Link>
            <Link href={`/namuna/${template}`} className="btn btn-light">
              To‘liq namunani ochish
            </Link>
          </div>
          <p className="reveal mt-6 hidden text-[13px] text-stone lg:block" style={{ ["--delay" as string]: "300ms" }}>
            {formatPrice(minPrice)}dan · to‘lov Click, Payme yoki karta orqali
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: w, height: w * 1.5 }}>
            <Gatefold template={template} data={SAMPLE_DATA} width={w} state={gate.state} onRequestOpen={open} entrance />
          </div>
          <div className="mt-7 flex h-10 items-center gap-2.5" role="radiogroup" aria-label="Shablon">
            {templates.map((t) => {
              const s = THEMES[t.id].swatch;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={t.id === template}
                  aria-label={t.name}
                  onClick={() => pick(t.id)}
                  className={`relative h-8 w-8 rounded-full transition-transform duration-300 ${t.id === template ? "scale-110" : "hover:scale-105"}`}
                  style={{
                    background: `conic-gradient(${s[0]} 0 50%, ${s[2]} 50% 75%, ${s[1]} 75%)`,
                    boxShadow: t.id === template ? "0 0 0 2px #f8f5ef, 0 0 0 3.5px #141414" : "0 0 0 1px rgba(0,0,0,.08)",
                  }}
                />
              );
            })}
          </div>
          <div className="mt-3 h-6 text-[13px] text-stone">
            {gate.state === "open" ? (
              <button type="button" onClick={gate.reset} className="inline-flex items-center gap-1.5 font-medium text-ink">
                <IconReplay size={15} /> Qaytadan ko‘rish
              </button>
            ) : (
              <span>{templates.find((t) => t.id === template)?.name} — bosib oching</span>
            )}
          </div>
        </div>

        <div className="text-center lg:hidden">
          <p className="mx-auto max-w-[440px] text-[16px] leading-relaxed text-ink-soft">
            Lenta yechiladi, eshiklar ochiladi — va mehmoningiz to‘yingizga taklif qilinadi. 15 daqiqada tayyor.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/yaratish?t=${template}`} className="btn btn-dark">
              Taklifnoma yaratish <IconArrowRight size={18} />
            </Link>
            <Link href={`/namuna/${template}`} className="btn btn-light">
              To‘liq namunani ochish
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-stone">{formatPrice(minPrice)}dan · Click, Payme yoki karta orqali</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text?: string }) {
  return (
    <div className="reveal mx-auto max-w-[640px] text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-[36px] leading-[1.08] font-medium sm:text-[48px]">{title}</h2>
      {text && <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-relaxed text-ink-soft">{text}</p>}
    </div>
  );
}

function Steps() {
  const steps = [
    ["Shablonni tanlang", "Oltita nafis dizayndan birini tanlang — har biri o‘zbek san’atidan ilhomlangan."],
    ["Ma’lumotlarni kiriting", "Ismlar, sana, to‘yxona va manzil. O‘zgarishlarni darhol jonli ko‘rinishda ko‘rasiz."],
    ["Havolani ulashing", "To‘lovdan so‘ng shaxsiy havolangiz faollashadi — Telegram, WhatsApp va Instagram orqali yuboring."],
  ];
  return (
    <section className="border-y border-line bg-white/60 py-20 sm:py-28">
      <div className="container-x">
        <SectionHead eyebrow="Qanday ishlaydi" title="Uch qadam — va taklifnomangiz tayyor" />
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map(([title, text], i) => (
            <li key={title} className="reveal card-surface p-7" style={{ ["--delay" as string]: `${i * 100}ms` }}>
              <span className="font-serif text-[44px] leading-none text-gold italic">0{i + 1}</span>
              <h3 className="mt-5 text-[18px] font-semibold">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-stone">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Templates({ templates }: { templates: TemplateMeta[] }) {
  return (
    <section id="shablonlar" className="scroll-mt-16 py-20 sm:py-28">
      <div className="container-x">
        <SectionHead
          eyebrow="Shablonlar"
          title={
            <>
              O‘zbek an’analari, <em className="text-gold">zamonaviy</em> nafosat
            </>
          }
          text="Rishton sopolidan Samarqand tunigacha — har bir shablon jonli: ochib ko‘ring, keyin o‘zingiznikini yarating."
        />
      </div>
      <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:mx-auto md:grid md:max-w-[1160px] md:grid-cols-3 md:px-8 md:gap-x-6 md:gap-y-12 md:overflow-visible">
        {templates.map((t, i) => (
          <TemplateCard key={t.id} t={t} index={i} />
        ))}
      </div>
    </section>
  );
}

function TemplateCard({ t, index }: { t: TemplateMeta; index: number }) {
  return (
    <article className="reveal w-[76vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none" style={{ ["--delay" as string]: `${(index % 3) * 90}ms` }}>
      <Link
        href={`/namuna/${t.id}`}
        className="group relative block overflow-hidden rounded-[28px] bg-cream/70 px-6 pt-8 pb-10"
        aria-label={`${t.name} shablonini ko‘rish`}
      >
        {t.badge && (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-ink shadow-sm">
            {t.badge}
          </span>
        )}
        <div className="mx-auto transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-hover:rotate-[-1deg]" style={{ width: 200, height: 300 }}>
          <Gatefold template={t.id} data={SAMPLE_DATA} width={200} state="closed" interactive={false} />
        </div>
      </Link>
      <div className="mt-5 flex items-start justify-between gap-4 px-1">
        <div>
          <h3 className="font-serif text-[24px] leading-tight font-medium">{t.name}</h3>
          <p className="mt-1 text-[14px] leading-snug text-stone">{t.tagline}</p>
        </div>
        <Link href={`/yaratish?t=${t.id}`} className="btn btn-dark btn-sm shrink-0" aria-label={`${t.name} shablonini tanlash`}>
          Tanlash
        </Link>
      </div>
    </article>
  );
}

function Features() {
  const items = [
    [IconSparkle, "3D ochilish", "Lenta yechiladi, qog‘oz eshiklar ochiladi — haqiqiy premium karta kabi."],
    [IconClock, "Ortga sanoq", "To‘ygacha qolgan kun, soat va daqiqalar jonli hisoblanadi."],
    [IconMap, "Xarita va yo‘nalish", "Google Maps va Yandex orqali to‘yxonaga bir bosishda yo‘l."],
    [IconMusic, "Fon musiqasi", "Taklifnoma ochilishi bilan nafis kuy yangraydi."],
    [IconCamera, "Juftlik suratlari", "Eng chiroyli suratlaringizdan kichik galereya."],
    [IconUsers, "Mehmonlar javobi", "Kim kelishini va necha kishi bo‘lishini oldindan bilasiz."],
    [IconCalendar, "Kalendarga qo‘shish", "Mehmonlar sanani telefon kalendariga bir bosishda saqlaydi."],
    [IconLink, "Shaxsiy havola", "Chiroyli havola: Telegram va WhatsApp’da rasmli ko‘rinish bilan."],
  ] as const;
  return (
    <section id="imkoniyatlar" className="scroll-mt-16 bg-ink py-20 text-white sm:py-28">
      <div className="container-x">
        <div className="reveal mx-auto max-w-[640px] text-center">
          <p className="eyebrow !text-gold-soft">Imkoniyatlar</p>
          <h2 className="mt-4 font-serif text-[36px] leading-[1.08] font-medium sm:text-[48px]">Bitta havolada — butun to‘y</h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/65">
            Mehmonlaringiz qayerga, qachon va qanday kelishini bilishadi. Siz esa kim kelishini bilasiz.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-white/10 lg:grid-cols-4">
          {items.map(([Icon, title, text], i) => (
            <div key={title} className="reveal bg-ink p-5 sm:p-7" style={{ ["--delay" as string]: `${(i % 4) * 70}ms` }}>
              <span className="grid h-11 w-11 place-items-center rounded-full text-gold-soft" style={{ boxShadow: "inset 0 0 0 1px rgba(216,192,138,.35)" }}>
                <Icon size={20} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold sm:mt-5 sm:text-[17px]">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60 sm:text-[14.5px]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Compare() {
  const rows = [
    ["Tayyor bo‘lish vaqti", "1–2 hafta", "15 daqiqa"],
    ["Mehmonlarga yetkazish", "Uyma-uy tarqatish", "Bir zumda, istalgan shaharga"],
    ["Xarita va yo‘nalish", "—", "Bir bosishda"],
    ["Xatoni tuzatish", "Qayta chop etish", "Istalgan payt, bepul"],
    ["Mehmonlar javobi", "Qo‘ng‘iroq qilib so‘rash", "Avtomatik ro‘yxat"],
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHead eyebrow="Nega raqamli?" title="Qog‘oz taklifnomaning nafosati — zamonaviy qulaylik bilan" />
        <div className="reveal card-surface mx-auto mt-14 max-w-[760px] overflow-hidden">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-line px-5 py-4 text-[12px] font-semibold tracking-wider text-stone uppercase sm:px-8">
            <span />
            <span>Qog‘oz</span>
            <span className="text-gold">Visol</span>
          </div>
          {rows.map(([k, a, b]) => (
            <div key={k} className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-3 border-b border-line px-5 py-4 text-[14px] last:border-0 sm:px-8 sm:text-[15px]">
              <span className="font-medium">{k}</span>
              <span className="text-stone">{a}</span>
              <span className="flex items-center gap-1.5 font-medium">
                <IconCheck size={16} className="shrink-0 text-gold" />
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ packages }: { packages: typeof DEFAULT_PACKAGES }) {
  return (
    <section id="narxlar" className="scroll-mt-16 border-t border-line bg-white/60 py-20 sm:py-28">
      <div className="container-x">
        <SectionHead eyebrow="Narxlar" title="Oddiy va shaffof narxlar" text="Yashirin to‘lovlarsiz. Bir marta to‘laysiz — taklifnoma to‘yingizdan keyin ham saqlanib qoladi." />
        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {packages.map((p, i) => (
            <div
              key={p.id}
              className={`reveal relative flex flex-col rounded-[28px] p-8 ${p.popular ? "bg-ink text-white shadow-2xl lg:-my-4 lg:py-12" : "card-surface"}`}
              style={{ ["--delay" as string]: `${i * 100}ms` }}
            >
              {p.popular && (
                <span className="btn-gold absolute -top-3 left-8 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase">
                  Ko‘p tanlanadi
                </span>
              )}
              <h3 className="font-serif text-[30px] font-medium">{p.name}</h3>
              <p className={`mt-1 text-[14px] ${p.popular ? "text-white/60" : "text-stone"}`}>{p.description}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-serif text-[44px] leading-none font-medium">{p.price.toLocaleString("ru-RU").replace(/ /g, " ")}</span>
                <span className={p.popular ? "text-white/60" : "text-stone"}>so‘m</span>
              </p>
              <ul className="mt-7 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] leading-snug">
                    <IconCheck size={18} className={`mt-0.5 shrink-0 ${p.popular ? "text-gold-soft" : "text-gold"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={`/yaratish?p=${p.id}`} className={`btn mt-9 w-full ${p.popular ? "btn-gold" : "btn-dark"}`}>
                {p.name} paketini tanlash
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    [
      "Taklifnoma qancha vaqtda tayyor bo‘ladi?",
      "Ma’lumotlarni kiritish taxminan 10–15 daqiqa oladi. To‘lov tasdiqlangach (odatda 15 daqiqa ichida) havolangiz faollashadi va uni darhol ulashishingiz mumkin.",
    ],
    [
      "Qanday to‘lash mumkin?",
      "Click, Payme yoki Uzcard/Humo kartasiga o‘tkazma orqali. Buyurtma sahifasida to‘lov ma’lumotlari va chek yuklash tugmasi bo‘ladi.",
    ],
    [
      "Keyin ma’lumotlarni o‘zgartirsam bo‘ladimi?",
      "Ha. Buyurtma sahifangizdagi “Tahrirlash” tugmasi orqali sana, vaqt, manzil yoki matnni o‘zgartirishingiz mumkin — havola o‘zgarmaydi.",
    ],
    [
      "Mehmonlar ilova o‘rnatishi kerakmi?",
      "Yo‘q. Taklifnoma oddiy havola: Telegram, WhatsApp yoki Instagram ichida ham, istalgan Android va iPhone telefonda ham ochiladi.",
    ],
    [
      "Mehmonlar javobini qayerdan ko‘raman?",
      "Premium va Lux paketlarida buyurtma sahifangizda kim kelishi, necha kishi bo‘lishi va qoldirilgan tilaklar ro‘yxati ko‘rinadi.",
    ],
    ["Rus tilida ham bo‘ladimi?", "Lux paketida dizaynerimiz matnni siz xohlagan tilda tayyorlab beradi. Bog‘lanish uchun Telegram’ga yozing."],
  ];
  return (
    <section id="savollar" className="scroll-mt-16 py-20 sm:py-28">
      <div className="container-x">
        <SectionHead eyebrow="Savollar" title="Ko‘p beriladigan savollar" />
        <div className="mx-auto mt-12 max-w-[720px] divide-y divide-line border-y border-line">
          {items.map(([q, a]) => (
            <details key={q} className="reveal group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16.5px] font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <IconChevronDown size={20} className="shrink-0 text-stone transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="pb-6 text-[15px] leading-relaxed text-stone">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:pb-28">
      <div
        className="reveal relative mx-auto max-w-[1100px] overflow-hidden rounded-[36px] px-6 py-20 text-center text-white sm:py-24"
        style={{ background: "radial-gradient(120% 120% at 50% 0%, #165a49, #0b3a2f 60%, #072a22)" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><g fill='none' stroke='%23e6cf93' stroke-width='.8'><path d='M24 6l5 13 13 5-13 5-5 13-5-13-13-5 13-5z'/><circle cx='24' cy='24' r='4'/></g></svg>\")",
          }}
        />
        <p className="eyebrow relative !text-gold-soft">Baxtli kuningiz yaqin</p>
        <h2 className="relative mx-auto mt-5 max-w-[680px] font-serif text-[38px] leading-[1.08] font-medium sm:text-[56px]">
          Baxtli kun go‘zal taklifdan boshlanadi
        </h2>
        <p className="relative mx-auto mt-5 max-w-[460px] text-[16px] leading-relaxed text-white/70">
          Bugun yarating — mehmonlaringiz ertaga hayratda qolishsin.
        </p>
        <Link href="/yaratish" className="btn btn-gold relative mt-10">
          Taklifnoma yaratish <IconArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function StickyCta({ minPrice }: { minPrice: number }) {
  const [show, setShow] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const nearBottom = window.innerHeight + y > document.body.scrollHeight - 600;
      setShow(y > window.innerHeight * 0.9 && !nearBottom);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 p-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-500 md:hidden ${show ? "translate-y-0" : "translate-y-[130%]"}`}
    >
      <Link href="/yaratish" className="btn btn-dark w-full shadow-2xl">
        Taklifnoma yaratish · {formatPrice(minPrice)}dan
      </Link>
    </div>
  );
}
