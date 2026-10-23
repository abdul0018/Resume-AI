import { useEffect, useState, type ChangeEvent } from "react";
import { EVENT_TYPES, ORDER_STATUSES, PACKAGE_FLAGS } from "@shared/constants";
import type { OrderView, RsvpEntry } from "@shared/schema";
import { formatDateLong, formatPrice } from "@shared/format";
import { Gatefold } from "@/components/invitation/Gatefold";
import { ErrorState, Logo, PageLoader, Spinner, Toast, useConfig } from "@/components/ui/Site";
import {
  IconCheck,
  IconCopy,
  IconEye,
  IconLink,
  IconTelegram,
  IconUpload,
  IconUsers,
  IconWhatsapp,
} from "@/components/ui/Icons";
import { api, type PaymentInfo } from "@/lib/api";
import { resizeImage } from "@/lib/media";
import { Link, useLocation } from "@/lib/router";
import { absoluteUrl, copyText, nativeShare, shareLinks } from "@/lib/share";

export default function OrderStatus({ id }: { id: string }) {
  const { search } = useLocation();
  const key = search.get("k") ?? "";
  const isNew = search.get("new") === "1";
  const saved = search.get("saved") === "1";
  const config = useConfig();
  const [state, setState] = useState<{ order: OrderView; payment: PaymentInfo } | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(saved ? "O‘zgarishlar saqlandi" : "");

  const load = () =>
    api.order(id, key).then(
      (r) => setState(r),
      (e: Error) => setError(e.message),
    );

  useEffect(() => {
    void load();
    document.title = "Buyurtmangiz";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, key]);

  // Poll while we are waiting for the admin to confirm payment.
  const status = state?.order.status;
  useEffect(() => {
    if (status !== "pending" && status !== "review") return;
    const t = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (error) return <ErrorState title="Buyurtma topilmadi" text="Havolani tekshiring yoki biz bilan bog‘laning." />;
  if (!state) return <PageLoader />;
  const { order, payment } = state;
  const d = order.data;
  const pageUrl = absoluteUrl(`/buyurtma/${order.id}?k=${encodeURIComponent(key)}`);

  return (
    <div className="min-h-screen-safe bg-ivory pb-20">
      <header className="border-b border-line">
        <div className="container-x flex h-16 items-center justify-between">
          <Logo name={config?.brandName} />
          <span className="text-[13px] text-stone">Buyurtma #{order.id}</span>
        </div>
      </header>

      <div className="container-x max-w-[1040px] pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <div>
              <p className="eyebrow">{isNew ? "Buyurtma qabul qilindi" : "Buyurtmangiz"}</p>
              <h1 className="mt-3 font-serif text-[36px] leading-tight font-medium sm:text-[44px]">
                {order.status === "active"
                  ? "Taklifnomangiz tayyor!"
                  : order.status === "review"
                    ? "Chek tekshirilmoqda"
                    : order.status === "cancelled"
                      ? "Buyurtma bekor qilingan"
                      : "Bir qadam qoldi — to‘lov"}
              </h1>
              <p className="mt-3 max-w-[520px] text-[15.5px] leading-relaxed text-ink-soft">
                {order.status === "active"
                  ? "Havolani mehmonlaringizga yuboring. Ma’lumotlarni istalgan vaqt tahrirlashingiz mumkin."
                  : order.status === "review"
                    ? "Chekingiz qabul qilindi. Odatda 15 daqiqa ichida taklifnomangiz faollashadi — bu sahifa avtomatik yangilanadi."
                    : order.status === "cancelled"
                      ? "Savollar bo‘lsa, biz bilan Telegram orqali bog‘laning."
                      : "Quyidagi usullardan biri bilan to‘lang va chek rasmini yuklang. Shundan so‘ng havolangiz faollashadi."}
              </p>
            </div>

            <StatusTrack status={order.status} />

            {(order.status === "pending" || order.status === "review") && (
              <PaymentCard order={order} payment={payment} editKey={key} onUploaded={() => void load()} />
            )}

            <ShareCard order={order} />

            {PACKAGE_FLAGS[order.package].rsvp && <RsvpList id={order.id} editKey={key} />}

            <div className="card-surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[15px] font-semibold">Bu sahifani saqlab qo‘ying</p>
                <p className="mt-1 text-[13.5px] text-stone">Tahrirlash va mehmonlar javobini ko‘rish uchun shaxsiy havolangiz.</p>
              </div>
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={async () => setToast((await copyText(pageUrl)) ? "Havola nusxalandi" : "Nusxalab bo‘lmadi")}
              >
                <IconCopy size={16} /> Havolani nusxalash
              </button>
            </div>
          </div>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-8 lg:self-start">
            <div className="card-surface overflow-hidden">
              <div className="grid place-items-center bg-cream/70 py-8">
                <div style={{ width: 180, height: 270 }}>
                  <Gatefold template={order.template} data={d} width={180} state="closed" interactive={false} />
                </div>
              </div>
              <div className="space-y-3 p-6 text-[14px]">
                <Row k="Kelin-kuyov" v={`${d.groom} & ${d.bride}`} />
                <Row k="Marosim" v={EVENT_TYPES[d.eventType]} />
                <Row k="Sana" v={`${formatDateLong(d.date)}, ${d.time}`} />
                <Row k="To‘yxona" v={d.venue} />
                <Row k="Paket" v={order.package[0].toUpperCase() + order.package.slice(1)} />
                <Row k="Narx" v={formatPrice(order.price)} />
                <Row k="Holat" v={ORDER_STATUSES[order.status]} />
              </div>
              {order.status !== "cancelled" && (
                <div className="grid grid-cols-2 gap-2 px-6 pb-6">
                  <Link href={`/yaratish?order=${order.id}&k=${encodeURIComponent(key)}`} className="btn btn-dark btn-sm">
                    Tahrirlash
                  </Link>
                  <a href={`/i/${order.slug}`} target="_blank" rel="noopener" className="btn btn-light btn-sm">
                    <IconEye size={16} /> Ko‘rish
                  </a>
                </div>
              )}
            </div>
            {payment.telegram && (
              <a href={`https://t.me/${payment.telegram}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-[14px] text-stone hover:text-ink">
                <IconTelegram size={16} /> Savol bo‘lsa: @{payment.telegram}
              </a>
            )}
          </aside>
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-stone">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}

function StatusTrack({ status }: { status: OrderView["status"] }) {
  if (status === "cancelled") return null;
  const steps = ["Buyurtma", "To‘lov", "Tekshiruv", "Faol"];
  const current = status === "pending" ? 1 : status === "review" ? 2 : 4;
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold transition ${
                done ? "bg-ink text-white" : active ? "bg-white text-ink shadow-[0_0_0_1.5px_#141414]" : "bg-white text-stone shadow-[0_0_0_1px_#e7e1d6]"
              }`}
            >
              {done ? <IconCheck size={15} /> : i + 1}
            </span>
            <span className={`hidden text-[13px] sm:inline ${done || active ? "text-ink" : "text-stone"}`}>{s}</span>
            {i < steps.length - 1 && <span className={`h-px flex-1 ${done ? "bg-ink" : "bg-line"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

function PaymentCard({ order, payment, editKey, onUploaded }: { order: OrderView; payment: PaymentInfo; editKey: string; onUploaded: () => void }) {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const tgText = `Assalomu alaykum! Buyurtma #${order.id} uchun to‘lov chekini yuboryapman.`;

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploading(true);
    setError("");
    try {
      const blob = await resizeImage(f, 1800, 0.85);
      await api.uploadReceipt(order.id, editKey, blob);
      onUploaded();
    } catch (err) {
      setError((err as Error).message);
    }
    setUploading(false);
  };

  return (
    <section className="card-surface overflow-hidden">
      <div className="flex items-end justify-between gap-4 border-b border-line p-6">
        <div>
          <p className="text-[13px] text-stone">To‘lov summasi</p>
          <p className="mt-1 font-serif text-[38px] leading-none font-medium">{formatPrice(order.price)}</p>
        </div>
        <span className="rounded-full bg-gold/12 px-3 py-1 text-[12px] font-semibold text-gold">#{order.id}</span>
      </div>

      <div className="space-y-5 p-6">
        {payment.cardNumber && (
          <div>
            <p className="label">Karta raqami (Uzcard / Humo)</p>
            <button
              type="button"
              onClick={async () => {
                if (await copyText(payment.cardNumber.replace(/\s/g, ""))) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-ink px-5 py-4 text-left text-white"
            >
              <span>
                <span className="block font-mono text-[16px] tracking-[0.08em] whitespace-nowrap sm:text-[19px] sm:tracking-[0.12em]">{payment.cardNumber}</span>
                {payment.cardHolder && <span className="mt-1 block text-[12px] tracking-wider text-white/60 uppercase">{payment.cardHolder}</span>}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-gold-soft">
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />} {copied ? "Nusxalandi" : "Nusxa"}
              </span>
            </button>
          </div>
        )}

        {(payment.clickUrl || payment.paymeUrl) && (
          <div className="grid grid-cols-2 gap-3">
            {payment.clickUrl && (
              <a href={payment.clickUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light">
                Click orqali
              </a>
            )}
            {payment.paymeUrl && (
              <a href={payment.paymeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light">
                Payme orqali
              </a>
            )}
          </div>
        )}

        {payment.note && <p className="text-[14px] leading-relaxed text-ink-soft">{payment.note}</p>}

        {order.receipt ? (
          <div className="flex items-center gap-4 rounded-2xl bg-emerald/5 p-4">
            <img src={order.receipt} alt="Chek" className="h-16 w-12 rounded-lg object-cover" />
            <div className="flex-1 text-[14px]">
              <p className="font-semibold text-emerald">Chek yuborildi</p>
              <p className="text-stone">Tekshirilmoqda. Kerak bo‘lsa, qaytadan yuklashingiz mumkin.</p>
            </div>
            <label className="cursor-pointer text-[13px] font-semibold text-gold">
              Yangilash
              <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
            </label>
          </div>
        ) : (
          <label className="btn btn-dark w-full cursor-pointer">
            {uploading ? <Spinner /> : <IconUpload size={18} />} {uploading ? "Yuklanmoqda…" : "To‘lov chekini yuklash"}
            <input type="file" accept="image/*" className="sr-only" onChange={onFile} disabled={uploading} />
          </label>
        )}
        {error && <p className="text-[13.5px] text-red-600">{error}</p>}

        {payment.telegram && (
          <a
            href={`https://t.me/${payment.telegram}?text=${encodeURIComponent(tgText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-[14px] font-medium text-ink-soft hover:text-ink"
          >
            <IconTelegram size={17} /> yoki chekni Telegram orqali yuboring
          </a>
        )}
      </div>
    </section>
  );
}

function ShareCard({ order }: { order: OrderView }) {
  const [toast, setToast] = useState("");
  const url = absoluteUrl(`/i/${order.slug}`);
  const text = `${order.data.groom} & ${order.data.bride} — to‘yimizga taklifnoma 💍`;
  const active = order.status === "active";
  return (
    <section className={`card-surface p-6 ${active ? "" : "opacity-95"}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-gold">
          <IconLink size={18} />
        </span>
        <div>
          <p className="text-[15px] font-semibold">Taklifnoma havolasi</p>
          <p className="text-[13px] text-stone">{active ? "Faol — mehmonlarga yuborishingiz mumkin" : "To‘lovdan so‘ng faollashadi (hozir namuna sifatida ochiladi)"}</p>
        </div>
      </div>
      <div className="mt-5 truncate rounded-2xl bg-ivory px-4 py-3.5 font-mono text-[13.5px] text-ink-soft ring-1 ring-line">{url}</div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a href={shareLinks.telegram(url, text)} target="_blank" rel="noopener noreferrer" className={`btn btn-sm ${active ? "btn-dark" : "btn-light"}`}>
          <IconTelegram size={17} /> Telegram
        </a>
        <a href={shareLinks.whatsapp(url, text)} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm">
          <IconWhatsapp size={17} /> WhatsApp
        </a>
        <button
          type="button"
          className="btn btn-light btn-sm"
          onClick={async () => {
            if (!(await nativeShare(url, text, text))) setToast((await copyText(url)) ? "Havola nusxalandi — Instagram’da yuboring" : "Nusxalab bo‘lmadi");
          }}
        >
          Instagram
        </button>
        <button type="button" className="btn btn-light btn-sm" onClick={async () => setToast((await copyText(url)) ? "Havola nusxalandi" : "Nusxalab bo‘lmadi")}>
          <IconCopy size={16} /> Nusxa
        </button>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </section>
  );
}

function RsvpList({ id, editKey }: { id: string; editKey: string }) {
  const [rsvps, setRsvps] = useState<RsvpEntry[] | null>(null);
  useEffect(() => {
    api.orderRsvps(id, editKey).then((r) => setRsvps(r.rsvps), () => setRsvps([]));
  }, [id, editKey]);
  if (!rsvps) return null;
  const yes = rsvps.filter((r) => r.attending);
  const guests = yes.reduce((a, r) => a + r.guests, 0);
  return (
    <section className="card-surface p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-gold">
          <IconUsers size={18} />
        </span>
        <p className="text-[15px] font-semibold">Mehmonlar javobi</p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        {[
          [yes.length, "keladi"],
          [guests, "jami mehmon"],
          [rsvps.length - yes.length, "kela olmaydi"],
        ].map(([n, l]) => (
          <div key={l} className="rounded-2xl bg-ivory py-4 ring-1 ring-line">
            <p className="font-serif text-[30px] leading-none font-medium">{n}</p>
            <p className="mt-1.5 text-[12px] text-stone">{l}</p>
          </div>
        ))}
      </div>
      {rsvps.length === 0 ? (
        <p className="mt-5 text-[14px] text-stone">Hozircha javoblar yo‘q. Taklifnomani yuborganingizdan so‘ng bu yerda ko‘rinadi.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {rsvps.map((r) => (
            <li key={r.id} className="py-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{r.name}</span>
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${r.attending ? "bg-emerald/10 text-emerald" : "bg-black/5 text-stone"}`}>
                  {r.attending ? `Keladi · ${r.guests} kishi` : "Kela olmaydi"}
                </span>
              </div>
              {r.message && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft italic">“{r.message}”</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
