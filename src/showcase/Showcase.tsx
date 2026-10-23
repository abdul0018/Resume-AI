import { useEffect, useState } from "react";
import { TEMPLATE_IDS, DEFAULT_TEMPLATES, type TemplateId } from "@shared/constants";
import type { InviteData } from "@shared/schema";
import { formatDateDots } from "@shared/format";
import { Gatefold } from "@/components/invitation/Gatefold";
import { InvitationExperience } from "@/components/invitation/InvitationExperience";
import { IconArrowLeft, IconReplay } from "@/components/ui/Icons";
import { THEMES } from "@/lib/themes";

/**
 * Examples-only site: a gallery of sample invitations, each opening full-screen.
 * Views are addressed by a bare hash token (#rishton), so each example has its own link.
 */

const base: Omit<InviteData, "groom" | "bride" | "date" | "venue" | "address" | "hosts" | "music"> = {
  eventType: "nikoh",
  time: "18:00",
  mapUrl: "",
  message: "",
  bismillah: true,
  program: [],
  photos: [],
  dressCode: "",
};

const program = [
  { time: "17:30", title: "Mehmonlarni kutib olish" },
  { time: "18:00", title: "Nikoh marosimi" },
  { time: "19:00", title: "To‘y ziyofati" },
  { time: "22:30", title: "Yakuniy raqs" },
];

export const EXAMPLES: Record<TemplateId, InviteData> = {
  rishton: {
    ...base,
    groom: "Aziz",
    bride: "Madina",
    date: "2027-06-12",
    venue: "Navro‘z to‘yxonasi",
    address: "Toshkent sh., Yunusobod tumani, Amir Temur ko‘chasi",
    hosts: "Karimovlar va Rahimovlar oilasi",
    music: "nafis",
    program,
  },
  zumrad: {
    ...base,
    groom: "Jahongir",
    bride: "Shahnoza",
    date: "2027-05-22",
    time: "17:00",
    venue: "Oqsaroy restorani",
    address: "Samarqand sh., Registon ko‘chasi",
    hosts: "Toshmatovlar oilasi",
    music: "sokin",
    program: [
      { time: "17:00", title: "Mehmonlarni kutib olish" },
      { time: "18:00", title: "To‘y ziyofati" },
      { time: "21:00", title: "Kelin-kuyov raqsi" },
    ],
  },
  atlas: {
    ...base,
    eventType: "fotiha",
    groom: "Bobur",
    bride: "Nilufar",
    date: "2027-04-24",
    time: "17:00",
    venue: "Saroy to‘yxonasi",
    address: "Farg‘ona sh., Mustaqillik ko‘chasi",
    hosts: "Aliyevlar oilasi",
    music: "nafis",
  },
  suzani: {
    ...base,
    groom: "Sardor",
    bride: "Malika",
    date: "2027-09-18",
    venue: "Buxoro saroyi",
    address: "Buxoro sh., Navoiy shoh ko‘chasi",
    hosts: "Rasulovlar va Hamidovlar oilasi",
    music: "sokin",
    program,
  },
  oqoltin: {
    ...base,
    bismillah: false,
    groom: "Temur",
    bride: "Sevara",
    date: "2027-07-03",
    time: "19:00",
    venue: "Grand Lumière",
    address: "Toshkent sh., Mirobod tumani",
    hosts: "Yusupovlar oilasi",
    music: "sokin",
    dressCode: "Klassik, oq va qora ranglar",
  },
  samarqand: {
    ...base,
    groom: "Doston",
    bride: "Zarina",
    date: "2027-08-14",
    time: "18:30",
    venue: "Samarqand Darvoza",
    address: "Samarqand sh., Universitet xiyoboni",
    hosts: "Nazarovlar oilasi",
    music: "nafis",
    program: [
      { time: "18:30", title: "Mehmonlarni kutib olish" },
      { time: "19:00", title: "Nikoh marosimi" },
      { time: "20:00", title: "To‘y ziyofati" },
    ],
  },
};

const isTemplate = (v: string): v is TemplateId => (TEMPLATE_IDS as readonly string[]).includes(v);
const readHash = () => {
  const h = window.location.hash.replace(/^#/, "");
  return isTemplate(h) ? h : null;
};

export default function Showcase() {
  const [current, setCurrent] = useState<TemplateId | null>(readHash);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const onHash = () => {
      setCurrent(readHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const open = (id: TemplateId | null) => {
    window.location.hash = id ?? "";
    setCurrent(id);
    window.scrollTo(0, 0);
  };

  if (current) {
    return (
      <ExampleView
        key={current}
        template={current}
        replay={replay}
        onReplay={() => setReplay((r) => r + 1)}
        onBack={() => open(null)}
        onNext={() => open(TEMPLATE_IDS[(TEMPLATE_IDS.indexOf(current) + 1) % TEMPLATE_IDS.length])}
      />
    );
  }
  return <Gallery onOpen={open} />;
}

function ExampleView({
  template,
  replay,
  onReplay,
  onBack,
  onNext,
}: {
  template: TemplateId;
  replay: number;
  onReplay: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [closed, setClosed] = useState(true);
  // The back arrow shows only before the card is opened, so recordings stay clean.
  useEffect(() => {
    setClosed(true);
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".inv .gf")) setClosed(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [replay]);

  const name = DEFAULT_TEMPLATES.find((t) => t.id === template)?.name;
  const next = DEFAULT_TEMPLATES[(TEMPLATE_IDS.indexOf(template) + 1) % TEMPLATE_IDS.length];

  return (
    <>
      <InvitationExperience
        template={template}
        data={EXAMPLES[template]}
        mode="demo"
        replayToken={replay}
        showFooter={false}
        staticMap
        endSlot={
          <div className="mx-auto flex max-w-[560px] flex-col items-center gap-3 px-6 pb-[max(40px,env(safe-area-inset-bottom))]">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="inv-btn inv-btn-ghost"
                onClick={() => {
                  window.scrollTo(0, 0);
                  onReplay();
                }}
              >
                <IconReplay size={18} /> Qaytadan ochish
              </button>
              <button type="button" className="inv-btn" onClick={onNext}>
                Keyingi: {next.name}
              </button>
            </div>
            <button type="button" className="inv-muted mt-2 text-[13px] underline-offset-4 hover:underline" onClick={onBack}>
              Barcha namunalar
            </button>
          </div>
        }
      />
      <button
        type="button"
        onClick={onBack}
        aria-label={`Barcha namunalar (${name})`}
        className="fixed z-40 grid h-11 w-11 place-items-center rounded-full transition-opacity duration-500"
        style={{
          top: "calc(14px + env(safe-area-inset-top, 0px))",
          left: "calc(14px + env(safe-area-inset-left, 0px))",
          opacity: closed ? 1 : 0,
          pointerEvents: closed ? "auto" : "none",
          color: THEMES[template].page.ink,
          background: THEMES[template].page.surface,
          boxShadow: `0 0 0 1px ${THEMES[template].page.line}, 0 8px 22px -12px rgba(0,0,0,.35)`,
        }}
      >
        <IconArrowLeft size={18} />
      </button>
    </>
  );
}

function Gallery({ onOpen }: { onOpen: (id: TemplateId) => void }) {
  const [w, setW] = useState(150);
  useEffect(() => {
    const calc = () => setW(Math.round(Math.min(220, Math.max(130, (Math.min(window.innerWidth, 1100) - 72) / (window.innerWidth >= 900 ? 3 : 2) - 36))));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return (
    <main className="sc-gallery">
      <header className="sc-head">
        <span className="sc-mark" aria-hidden="true">
          <i />
        </span>
        <p className="eyebrow">Raqamli to‘y taklifnomalari</p>
        <h1 className="sc-title">Taklifnoma namunalari</h1>
        <p className="sc-lead">Namunani tanlang va kartani bosing — lenta yechiladi, eshiklar ochiladi.</p>
      </header>

      <ul className="sc-grid">
        {DEFAULT_TEMPLATES.map((t) => {
          const d = EXAMPLES[t.id];
          return (
            <li key={t.id}>
              <button type="button" className="sc-card" onClick={() => onOpen(t.id)} aria-label={`${t.name} namunasini ochish`}>
                <span className="sc-stage">
                  <span style={{ width: w, height: w * 1.5, display: "block" }}>
                    <Gatefold template={t.id} data={d} width={w} state="closed" interactive={false} />
                  </span>
                </span>
                <span className="sc-meta">
                  <span className="sc-name">{t.name}</span>
                  <span className="sc-couple">
                    {d.groom} &amp; {d.bride}
                  </span>
                  <span className="sc-date">{formatDateDots(d.date)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
