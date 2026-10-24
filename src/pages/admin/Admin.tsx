import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { EVENT_TYPES, ORDER_STATUSES, type OrderStatus, type TemplateMeta } from "@shared/constants";
import type { AdminOrder, RsvpEntry, Settings } from "@shared/schema";
import { formatDateLong, formatPrice } from "@shared/format";
import { Gatefold } from "@/components/invitation/Gatefold";
import { Logo, PageLoader, Spinner, Toast } from "@/components/ui/Site";
import { IconClose, IconCopy, IconEye, IconPhone, IconTelegram, IconTrash } from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { absoluteUrl, copyText } from "@/lib/share";

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    document.title = "Admin panel";
    api.admin.me().then((r) => setAuthed(r.admin), () => setAuthed(false));
  }, []);
  if (authed === null) return <PageLoader />;
  if (!authed) return <Login onDone={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.admin.login(password);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  };
  return (
    <div className="grid min-h-screen-safe place-items-center px-5">
      <form onSubmit={submit} className="card-surface w-full max-w-[380px] p-8">
        <Logo />
        <h1 className="mt-8 font-serif text-[30px] font-medium">Admin panel</h1>
        <p className="mt-1 text-[14px] text-stone">Davom etish uchun parolni kiriting</p>
        <input
          type="password"
          className="field mt-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parol"
          autoComplete="current-password"
          autoFocus
        />
        {error && <p className="mt-3 text-[13.5px] text-red-600">{error}</p>}
        <button type="submit" className="btn btn-dark mt-5 w-full" disabled={busy || !password}>
          {busy ? <Spinner /> : "Kirish"}
        </button>
      </form>
    </div>
  );
}

type Tab = "orders" | "templates" | "settings";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("orders");
  const [toast, setToast] = useState("");
  const logout = async () => {
    await api.admin.logout().catch(() => undefined);
    onLogout();
  };
  return (
    <div className="min-h-screen-safe bg-ivory">
      <header className="sticky top-0 z-30 border-b border-line bg-ivory/90 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">Admin</span>
          </div>
          <button type="button" onClick={logout} className="text-[13px] text-stone hover:text-ink">
            Chiqish
          </button>
        </div>
        <div className="container-x no-scrollbar flex gap-1 overflow-x-auto pb-3">
          {(
            [
              ["orders", "Buyurtmalar"],
              ["templates", "Shablonlar"],
              ["settings", "Sozlamalar"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition ${tab === id ? "bg-ink text-white" : "text-ink-soft hover:bg-black/5"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <main className="container-x py-8">
        {tab === "orders" && <Orders notify={setToast} />}
        {tab === "templates" && <Templates notify={setToast} />}
        {tab === "settings" && <SettingsForm notify={setToast} />}
      </main>
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  review: "bg-sky-100 text-sky-800",
  active: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-black/5 text-stone",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap ${STATUS_STYLE[status]}`}>{ORDER_STATUSES[status]}</span>;
}

function Orders({ notify }: { notify: (m: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [data, setData] = useState<{ orders: AdminOrder[]; total: number } | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.admin.stats>> | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const load = useCallback(() => {
    api.admin.orders({ status: filter, q }).then(setData, (e: Error) => notify(e.message));
    api.admin.stats().then(setStats, () => undefined);
  }, [filter, q, notify]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Jami buyurtmalar", stats?.total ?? "—"],
          ["To‘lov kutilmoqda", stats?.pending ?? "—"],
          ["Faol", stats?.active ?? "—"],
          ["Tushum", stats ? formatPrice(stats.revenue) : "—"],
        ].map(([k, v]) => (
          <div key={k} className="card-surface p-5">
            <p className="text-[12.5px] text-stone">{k}</p>
            <p className="mt-2 font-serif text-[28px] leading-none font-medium">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {[["all", "Hammasi"], ...Object.entries(ORDER_STATUSES)].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${filter === id ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line"}`}
            >
              {label}
              {id === "review" && stats?.review ? <span className="ml-1.5 rounded-full bg-sky-500 px-1.5 text-[11px] text-white">{stats.review}</span> : null}
            </button>
          ))}
        </div>
        <input className="field !min-h-[44px] md:!w-[280px]" placeholder="Qidirish: ism, telefon, ID…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!data ? (
        <div className="py-20 text-center text-gold">
          <Spinner />
        </div>
      ) : data.orders.length === 0 ? (
        <p className="py-20 text-center text-stone">Buyurtmalar topilmadi</p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[22px] bg-white ring-1 ring-line">
          {data.orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o)}
              className="grid w-full grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-line px-5 py-4 text-left transition last:border-0 hover:bg-ivory md:grid-cols-[110px_1.4fr_1fr_1fr_130px] md:items-center"
            >
              <span className="font-mono text-[12.5px] text-stone">#{o.id}</span>
              <span className="justify-self-end md:hidden">
                <StatusBadge status={o.status} />
              </span>
              <span className="col-span-2 md:col-span-1">
                <span className="block font-medium">
                  {o.data.groom} &amp; {o.data.bride}
                </span>
                <span className="text-[12.5px] text-stone">
                  {formatDateLong(o.data.date)} · {o.template}
                </span>
              </span>
              <span className="col-span-2 text-[13.5px] md:col-span-1">
                {o.customer.name}
                <span className="block text-[12.5px] text-stone">{o.customer.phone}</span>
              </span>
              <span className="col-span-2 text-[13.5px] md:col-span-1">
                {formatPrice(o.price)} <span className="text-stone">· {o.package}</span>
                <span className="block text-[12.5px] text-stone">{new Date(o.createdAt).toLocaleString("ru-RU")}</span>
              </span>
              <span className="hidden justify-self-end md:block">
                <StatusBadge status={o.status} />
              </span>
            </button>
          ))}
        </div>
      )}
      {data && data.total > data.orders.length && <p className="mt-4 text-center text-[13px] text-stone">Birinchi {data.orders.length} ta ko‘rsatilmoqda (jami {data.total})</p>}

      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onChanged={(o) => {
            setSelected(o);
            load();
          }}
          onDeleted={() => {
            setSelected(null);
            load();
            notify("Buyurtma o‘chirildi");
          }}
          notify={notify}
        />
      )}
    </div>
  );
}

function OrderDrawer({
  order,
  onClose,
  onChanged,
  onDeleted,
  notify,
}: {
  order: AdminOrder;
  onClose: () => void;
  onChanged: (o: AdminOrder) => void;
  onDeleted: () => void;
  notify: (m: string) => void;
}) {
  const [note, setNote] = useState(order.adminNote);
  const [busy, setBusy] = useState("");
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const d = order.data;

  useEffect(() => {
    setNote(order.adminNote);
    api.admin.rsvps(order.id).then((r) => setRsvps(r.rsvps), () => setRsvps([]));
  }, [order.id, order.adminNote]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  const patch = async (p: { status?: OrderStatus; adminNote?: string }, label: string) => {
    setBusy(label);
    try {
      const r = await api.admin.updateOrder(order.id, p);
      onChanged({ ...order, ...r.order, adminNote: p.adminNote ?? order.adminNote });
      notify(label === "note" ? "Izoh saqlandi" : `Holat: ${ORDER_STATUSES[r.order.status]}`);
    } catch (e) {
      notify((e as Error).message);
    }
    setBusy("");
  };

  const copyClientLink = async () => {
    const { url } = await api.admin.editLink(order.id);
    notify((await copyText(absoluteUrl(url))) ? "Mijoz sahifasi havolasi nusxalandi" : "Nusxalab bo‘lmadi");
  };

  const remove = async () => {
    if (!window.confirm(`#${order.id} buyurtmani butunlay o‘chirasizmi?`)) return;
    await api.admin.deleteOrder(order.id);
    onDeleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="h-full w-full max-w-[520px] overflow-y-auto bg-ivory shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ivory/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="font-mono text-[12px] text-stone">#{order.id}</p>
            <p className="font-serif text-[22px] font-medium">
              {d.groom} &amp; {d.bride}
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5" aria-label="Yopish">
            <IconClose />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <span className="font-serif text-[22px] font-medium">{formatPrice(order.price)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-dark btn-sm" disabled={!!busy || order.status === "active"} onClick={() => patch({ status: "active" }, "active")}>
              {busy === "active" ? <Spinner /> : "Faollashtirish"}
            </button>
            <button type="button" className="btn btn-light btn-sm" disabled={!!busy || order.status === "pending"} onClick={() => patch({ status: "pending" }, "pending")}>
              To‘lov kutilmoqda
            </button>
            <button type="button" className="btn btn-light btn-sm col-span-2" disabled={!!busy || order.status === "cancelled"} onClick={() => patch({ status: "cancelled" }, "cancelled")}>
              Bekor qilish
            </button>
          </div>

          {order.receipt ? (
            <a href={order.receipt} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl ring-1 ring-line">
              <img src={order.receipt} alt="To‘lov cheki" className="max-h-[360px] w-full bg-white object-contain" />
              <span className="block bg-white px-4 py-2 text-[12.5px] text-stone">To‘lov cheki — kattalashtirish uchun bosing</span>
            </a>
          ) : (
            <p className="rounded-2xl bg-white px-4 py-3 text-[13.5px] text-stone ring-1 ring-line">Chek hali yuklanmagan</p>
          )}

          <DrawerSection title="Mijoz">
            <p className="font-medium">{order.customer.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={`tel:${order.customer.phone}`} className="btn btn-light btn-sm">
                <IconPhone size={16} /> {order.customer.phone}
              </a>
              {order.customer.telegram && (
                <a href={`https://t.me/${order.customer.telegram}`} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm">
                  <IconTelegram size={16} /> @{order.customer.telegram}
                </a>
              )}
            </div>
          </DrawerSection>

          <DrawerSection title="Taklifnoma">
            <div className="flex gap-4">
              <div style={{ width: 90, height: 135 }} className="shrink-0">
                <Gatefold template={order.template} data={d} width={90} state="closed" interactive={false} />
              </div>
              <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13.5px]">
                <dt className="text-stone">Marosim</dt>
                <dd>{EVENT_TYPES[d.eventType]}</dd>
                <dt className="text-stone">Sana</dt>
                <dd>
                  {formatDateLong(d.date)}, {d.time}
                </dd>
                <dt className="text-stone">To‘yxona</dt>
                <dd>{d.venue}</dd>
                <dt className="text-stone">Manzil</dt>
                <dd>{d.address || "—"}</dd>
                <dt className="text-stone">Shablon</dt>
                <dd>{order.template}</dd>
                <dt className="text-stone">Paket</dt>
                <dd>{order.package}</dd>
                <dt className="text-stone">Suratlar</dt>
                <dd>{d.photos.length}</dd>
              </dl>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`/i/${order.slug}`} target="_blank" rel="noopener" className="btn btn-light btn-sm">
                <IconEye size={16} /> Ko‘rish
              </a>
              <button type="button" className="btn btn-light btn-sm" onClick={copyClientLink}>
                <IconCopy size={16} /> Mijoz havolasi
              </button>
            </div>
          </DrawerSection>

          <DrawerSection title={`Mehmonlar javobi (${rsvps.length})`}>
            {rsvps.length === 0 ? (
              <p className="text-[13.5px] text-stone">Javoblar yo‘q</p>
            ) : (
              <ul className="divide-y divide-line text-[13.5px]">
                {rsvps.map((r) => (
                  <li key={r.id} className="flex justify-between gap-3 py-2">
                    <span>{r.name}</span>
                    <span className="text-stone">{r.attending ? `${r.guests} kishi` : "kelmaydi"}</span>
                  </li>
                ))}
              </ul>
            )}
          </DrawerSection>

          <DrawerSection title="Ichki izoh">
            <textarea className="field !min-h-[90px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Faqat adminlar ko‘radi" maxLength={1000} />
            <button type="button" className="btn btn-light btn-sm mt-2" disabled={note === order.adminNote || !!busy} onClick={() => patch({ adminNote: note }, "note")}>
              Izohni saqlash
            </button>
          </DrawerSection>

          <button type="button" onClick={remove} className="flex items-center gap-2 text-[13px] text-red-600">
            <IconTrash size={16} /> Buyurtmani o‘chirish
          </button>
        </div>
      </div>
    </div>
  );
}

function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[12px] font-semibold tracking-[0.14em] text-stone uppercase">{title}</h3>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

const SAMPLE = { groom: "Aziz", bride: "Madina", date: "2027-06-12", time: "18:00", venue: "", eventType: "nikoh" as const, bismillah: false };

function Templates({ notify }: { notify: (m: string) => void }) {
  const [list, setList] = useState<TemplateMeta[] | null>(null);
  useEffect(() => {
    api.admin.templates().then((r) => setList(r.templates), (e: Error) => notify(e.message));
  }, [notify]);
  if (!list) return <div className="py-20 text-center text-gold"><Spinner /></div>;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {list.map((t) => (
        <TemplateRow key={t.id} t={t} notify={notify} />
      ))}
    </div>
  );
}

function TemplateRow({ t, notify }: { t: TemplateMeta; notify: (m: string) => void }) {
  const [form, setForm] = useState(t);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(t);
  const save = async (next = form) => {
    setBusy(true);
    try {
      const r = await api.admin.updateTemplate(t.id, { name: next.name, tagline: next.tagline, badge: next.badge, active: next.active, sort: next.sort });
      Object.assign(t, r.template);
      setForm(r.template);
      notify("Shablon saqlandi");
    } catch (e) {
      notify((e as Error).message);
    }
    setBusy(false);
  };
  return (
    <div className={`card-surface flex gap-5 p-5 ${form.active ? "" : "opacity-70"}`}>
      <div className="shrink-0" style={{ width: 96, height: 144 }}>
        <Gatefold template={t.id} data={SAMPLE} width={96} state="closed" interactive={false} />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <input className="field !min-h-[40px] !py-2 font-serif !text-[18px]" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Nomi" />
          <button
            type="button"
            role="switch"
            aria-checked={form.active}
            aria-label="Faol"
            onClick={() => save({ ...form, active: !form.active })}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${form.active ? "bg-emerald" : "bg-sand"}`}
          >
            <span className={`absolute top-0.5 left-0 h-6 w-6 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
        </div>
        <input className="field !min-h-[40px] !py-2 !text-[14px]" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Qisqa tavsif" aria-label="Tavsif" />
        <div className="flex gap-2">
          <input className="field !min-h-[40px] !py-2 !text-[14px]" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Belgi (masalan: Yangi)" aria-label="Belgi" />
          <input
            className="field !min-h-[40px] !w-[76px] !py-2 !text-[14px]"
            type="number"
            min={0}
            max={999}
            value={form.sort}
            onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })}
            aria-label="Tartib"
            title="Tartib raqami"
          />
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-dark btn-sm" disabled={!dirty || busy} onClick={() => save()}>
            Saqlash
          </button>
          <a href={`/namuna/${t.id}`} target="_blank" rel="noopener" className="btn btn-light btn-sm">
            <IconEye size={16} /> Namuna
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function SettingsForm({ notify }: { notify: (m: string) => void }) {
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.admin.settings().then((r) => setS(r.settings), (e: Error) => notify(e.message));
  }, [notify]);
  if (!s) return <div className="py-20 text-center text-gold"><Spinner /></div>;

  const field = (key: keyof Settings, label: string, hint?: string) => (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field" value={s[key] as string} onChange={(e) => setS({ ...s, [key]: e.target.value })} />
      {hint && <span className="hint block">{hint}</span>}
    </label>
  );

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.admin.saveSettings({ ...s, packages: s.packages.map((p) => ({ ...p, features: p.features.map((f) => f.trim()).filter(Boolean) })) });
      setS(r.settings);
      notify("Sozlamalar saqlandi");
    } catch (err) {
      notify((err as Error).message);
    }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-[760px] space-y-6 pb-24">
      <section className="card-surface space-y-4 p-6">
        <h2 className="text-[16px] font-semibold">Brend va aloqa</h2>
        {field("brandName", "Brend nomi")}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("instagram", "Instagram username", "@ belgisisiz")}
          {field("telegram", "Telegram username", "Chek va savollar shu yerga keladi")}
        </div>
        {field("phone", "Telefon")}
      </section>

      <section className="card-surface space-y-4 p-6">
        <h2 className="text-[16px] font-semibold">To‘lov ma’lumotlari</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("cardNumber", "Karta raqami")}
          {field("cardHolder", "Karta egasi")}
        </div>
        {field("clickUrl", "Click to‘lov havolasi", "Ixtiyoriy, https:// bilan")}
        {field("paymeUrl", "Payme to‘lov havolasi", "Ixtiyoriy, https:// bilan")}
        <label className="block">
          <span className="label">Mijozga ko‘rsatiladigan izoh</span>
          <textarea className="field" value={s.paymentNote} onChange={(e) => setS({ ...s, paymentNote: e.target.value })} />
        </label>
      </section>

      <section className="card-surface space-y-6 p-6">
        <h2 className="text-[16px] font-semibold">Paketlar va narxlar</h2>
        {s.packages.map((p, i) => {
          const set = (patch: Partial<typeof p>) => setS({ ...s, packages: s.packages.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
          return (
            <div key={p.id} className="space-y-3 rounded-2xl bg-ivory p-4 ring-1 ring-line">
              <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                <input className="field" value={p.name} onChange={(e) => set({ name: e.target.value })} aria-label="Paket nomi" />
                <input className="field" type="number" min={0} step={1000} value={p.price} onChange={(e) => set({ price: Number(e.target.value) })} aria-label="Narx" />
              </div>
              <input className="field" value={p.description} onChange={(e) => set({ description: e.target.value })} placeholder="Qisqa tavsif" aria-label="Tavsif" />
              <textarea
                className="field !min-h-[130px]"
                value={p.features.join("\n")}
                onChange={(e) => set({ features: e.target.value.split("\n").slice(0, 10) })}
                aria-label="Imkoniyatlar"
              />
              <p className="hint !mt-0">Har bir imkoniyat — yangi qatorda. Paket turi: {p.id} (suratlar/musiqa/RSVP {p.id === "standart" ? "yo‘q" : "bor"}).</p>
              <label className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" checked={!!p.popular} onChange={(e) => set({ popular: e.target.checked })} /> “Ko‘p tanlanadi” belgisi
              </label>
            </div>
          );
        })}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-ivory/90 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[760px] justify-end">
          <button type="submit" className="btn btn-dark" disabled={busy}>
            {busy ? <Spinner /> : "Sozlamalarni saqlash"}
          </button>
        </div>
      </div>
    </form>
  );
}
