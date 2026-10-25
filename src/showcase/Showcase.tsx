import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import type { InviteData } from "@shared/schema";
import { formatDateDots } from "@shared/format";
import { ClosedCard, MuhrInvitation } from "@/templates/muhr/MuhrInvitation";
import { GulzorClosed, GulzorInvitation } from "@/templates/gulzor/GulzorInvitation";
import { NafosatClosed, NafosatInvitation } from "@/templates/nafosat/NafosatInvitation";

/**
 * Examples-only site: a gallery of sample invitations, each opening full-screen.
 * Views are addressed by a bare hash token (#oltin-muhr), so each example has its own link.
 * Templates are added one at a time from the owner's reference videos.
 */

interface ShowcaseTemplate {
  id: string;
  name: string;
  line: string;
  data: InviteData;
  Invitation: ComponentType<{ data: InviteData; replayToken?: number; endSlot?: ReactNode }>;
  Preview: ComponentType<{ data: InviteData; w: number; h: number }>;
  /** Colours the back arrow to sit on the template's closed card. */
  tone: "gold" | "sage" | "blue";
}

const TEMPLATES: ShowcaseTemplate[] = [
  {
    id: "oltin-muhr",
    name: "Atlas lenta",
    line: "Atlas lenta bilan bog‘langan ikki eshikli karta va oqshom nuri",
    data: {
      eventType: "nikoh",
      groom: "Sardor",
      bride: "Mohinur",
      date: "2027-06-19",
      time: "18:00",
      venue: "Oltin saroy to‘yxonasi",
      address: "Samarqand sh., Registon ko‘chasi, 15",
      mapUrl: "",
      hosts: "Karimovlar va Yusupovlar oilasi",
      groomParents: "Karimovlar oilasining o‘g‘li",
      brideParents: "Yusupovlar oilasining qizi",
      giftCardNumber: "8600123456789012",
      giftCardHolder: "Sardor Karimov",
      message: "Muhabbat, quvonch va duolarga to‘la oqshomda biz bilan birga bo‘ling — shu kuni biz umrbod baxtimizni boshlaymiz.",
      bismillah: true,
      program: [
        { time: "17:30", title: "Mehmonlarni kutib olish" },
        { time: "18:00", title: "Nikoh marosimi" },
        { time: "19:00", title: "To‘y ziyofati" },
        { time: "22:30", title: "Kelin-kuyov raqsi" },
      ],
      photos: [],
      music: "toylar",
      dressCode: "",
    },
    Invitation: MuhrInvitation,
    Preview: ({ data, w, h }) => (
      <div className="mh mh-thumb" style={{ position: "relative", width: w, height: h }}>
        <ClosedCard data={data} box={{ w, h }} />
      </div>
    ),
    tone: "gold",
  },
  {
    id: "gulzor",
    name: "Gulzor",
    line: "Bismillah bilan ochiladigan, oq gullar va nashida bilan bog‘dagi nikoh to‘yi",
    data: {
      eventType: "nikoh",
      groom: "Jasur",
      bride: "Malika",
      date: "2027-05-15",
      time: "16:00",
      venue: "«Yashil bog‘» restorani",
      address: "Toshkent sh., Bog‘ko‘chasi, 12-uy",
      mapUrl: "",
      hosts: "Rahimovlar va Aliyevlar oilasi",
      giftCardNumber: "9860123456781234",
      giftCardHolder: "Malika Rahimova",
      contactPhone: "+998 90 123 45 67",
      message:
        "Alloh taoloning marhamati bilan hayotimizning eng muborak kuni — nikoh to‘yimizni siz bilan birga nishonlashni istaymiz. Duolaringiz va yonimizda bo‘lishingiz biz uchun eng katta sovg‘a.",
      bismillah: true,
      program: [
        { time: "16:00", title: "Mehmonlarni kutib olish" },
        { time: "16:30", title: "Nikoh o‘qilishi" },
        { time: "17:30", title: "Fotosessiya" },
        { time: "18:30", title: "To‘y ziyofati" },
        { time: "20:00", title: "To‘y torti" },
        { time: "20:30", title: "Duo va oq fotiha" },
      ],
      photos: [],
      music: "nashid",
      dressCode: "Ayollar uchun yopiq, nafis liboslar; bahoriy yumshoq ranglar ma’qul",
    },
    Invitation: GulzorInvitation,
    Preview: ({ data, w, h }) => (
      <div className="gz gz-thumb" style={{ position: "relative", width: w, height: h }}>
        <GulzorClosed data={data} box={{ w, h }} />
      </div>
    ),
    tone: "sage",
  },
  {
    id: "nafosat",
    name: "Nafosat",
    line: "Gullar bilan bezatilgan to‘y mashinasi uzoqlashadi, oq tuman ichidan nafis taklifnoma ochiladi",
    data: {
      eventType: "nikoh",
      groom: "Kamron",
      bride: "Robiya",
      date: "2027-07-24",
      time: "15:00",
      venue: "«Navro‘z» to‘yxonasi",
      address: "Toshkent sh., Amir Temur ko‘chasi, 27-uy",
      mapUrl: "",
      hosts: "Sobirovlar va Qodirovlar oilasi",
      groomParents: "Sobirovlar oilasining o‘g‘li",
      brideParents: "Qodirovlar oilasining qizi",
      giftCardNumber: "8600987654321098",
      giftCardHolder: "Kamron Sobirov",
      contactPhone: "+998 93 765 43 21",
      message: "",
      bismillah: true,
      program: [
        { time: "15:00", title: "Mehmonlarni kutib olish" },
        { time: "15:30", title: "Nikoh o‘qilishi" },
        { time: "16:30", title: "Kelin-kuyovni kutib olish" },
        { time: "17:00", title: "To‘y dasturxoni" },
        { time: "20:00", title: "Kelin salom va duo" },
      ],
      photos: [],
      music: "toylar",
      dressCode: "Yopiq, nafis liboslar; och havorang va pastel ranglar ma’qul",
    },
    Invitation: NafosatInvitation,
    Preview: ({ data, w, h }) => (
      <div className="nf nf-thumb" style={{ position: "relative", width: w, height: h }}>
        <NafosatClosed data={data} box={{ w, h }} />
      </div>
    ),
    tone: "blue",
  },
];

const readHash = () => TEMPLATES.find((t) => t.id === window.location.hash.replace(/^#/, ""))?.id ?? null;

export default function Showcase() {
  const [current, setCurrent] = useState<string | null>(readHash);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    document.title = "Taklifnoma namunalari";
    const onHash = () => {
      setCurrent(readHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (id: string | null) => {
    window.location.hash = id ?? "";
    setCurrent(id);
    window.scrollTo(0, 0);
  };

  const template = TEMPLATES.find((t) => t.id === current);
  if (template) {
    return (
      <ExampleView
        key={template.id}
        template={template}
        replay={replay}
        onReplay={() => {
          window.scrollTo(0, 0);
          setReplay((r) => r + 1);
        }}
        onBack={() => go(null)}
      />
    );
  }
  return <Gallery onOpen={go} />;
}

function ExampleView({
  template,
  replay,
  onReplay,
  onBack,
}: {
  template: ShowcaseTemplate;
  replay: number;
  onReplay: () => void;
  onBack: () => void;
}) {
  const { Invitation } = template;
  const [closed, setClosed] = useState(true);
  const [idle, setIdle] = useState(false);
  // The back arrow shows only on the sealed envelope, and fades after a moment of stillness
  // so the first filmed frame is the envelope alone. Any touch or pointer movement brings it back.
  useEffect(() => {
    setClosed(true);
    setIdle(false);
    let t = window.setTimeout(() => setIdle(true), 1200);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => setIdle(true), 1800);
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-opener]")) setClosed(false);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("pointermove", wake, { passive: true });
    window.addEventListener("touchstart", wake, { passive: true });
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("click", onClick);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, [replay]);

  return (
    <>
      <Invitation
        data={template.data}
        replayToken={replay}
        endSlot={
          <div className="sc-end">
            <button type="button" className="sc-replay" onClick={onReplay}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4.5v4h4" />
              </svg>
              Qaytadan ochish
            </button>
            <button type="button" className="sc-link" onClick={onBack}>
              Barcha namunalar
            </button>
          </div>
        }
      />
      <button type="button" onClick={onBack} aria-label="Barcha namunalar" className="sc-back" data-tone={template.tone} data-hidden={!closed || idle}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </button>
    </>
  );
}

function Gallery({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <main className="sc-gallery">
      <header className="sc-head">
        <h1 className="sc-title">Taklifnoma namunalari</h1>
        <p className="sc-lead">Namunani tanlang va taklifnomani oching.</p>
      </header>
      <ul className="sc-grid" data-count={TEMPLATES.length}>
        {TEMPLATES.map(({ id, name, line, data, Preview }) => (
          <li key={id}>
            <button type="button" className="sc-card" onClick={() => onOpen(id)} aria-label={`${name} namunasini ochish`}>
              <span className="sc-phone">
                <Preview data={data} w={200} h={420} />
              </span>
              <span className="sc-meta">
                <span className="sc-name">{name}</span>
                <span className="sc-line">{line}</span>
                <span className="sc-couple">
                  {data.groom} &amp; {data.bride} · {formatDateDots(data.date)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
