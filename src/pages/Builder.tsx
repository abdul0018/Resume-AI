import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  BUILTIN_MUSIC,
  DEFAULT_PACKAGES,
  DEFAULT_TEMPLATES,
  PACKAGE_FLAGS,
  PACKAGE_IDS,
  TEMPLATE_IDS,
  customerSchema,
  inviteDataSchema,
  type Customer,
  type InviteData,
  type PackageId,
  type TemplateId,
} from "@shared/schema";
import { formatPrice } from "@shared/format";
import { Gatefold } from "@/components/invitation/Gatefold";
import { InvitationExperience } from "@/components/invitation/InvitationExperience";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { ErrorState, Logo, PageLoader, Spinner, useConfig } from "@/components/ui/Site";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconEye,
  IconMusic,
  IconPlus,
  IconReplay,
  IconTrash,
  IconUpload,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { useLocalStorage } from "@/lib/hooks";
import { defaultMessage, EMPTY_DATA, EVENT_OPTIONS, parseCoords } from "@/lib/invite";
import { resizeImage } from "@/lib/media";
import { navigate, useLocation } from "@/lib/router";
import { THEMES } from "@/lib/themes";

interface Draft {
  template: TemplateId;
  pkg: PackageId;
  data: InviteData;
  customer: Customer;
}

const STEPS = ["Dizayn", "Ma’lumotlar", "Surat va musiqa", "Buyurtma"] as const;

export default function Builder() {
  const { search } = useLocation();
  const orderId = search.get("order");
  const key = search.get("k") ?? "";
  if (orderId) return <EditLoader id={orderId} editKey={key} />;
  return <NewOrderBuilder initialTemplate={search.get("t")} initialPkg={search.get("p")} />;
}

function NewOrderBuilder({ initialTemplate, initialPkg }: { initialTemplate: string | null; initialPkg: string | null }) {
  const [draft, setDraft] = useLocalStorage<Draft>("visol-draft-v1", {
    template: "rishton",
    pkg: "premium",
    data: EMPTY_DATA,
    customer: { name: "", phone: "+998 ", telegram: "" },
  });
  // Deep links from the homepage take precedence over the saved draft.
  useEffect(() => {
    setDraft((d) => ({
      ...d,
      template: (TEMPLATE_IDS as readonly string[]).includes(initialTemplate ?? "") ? (initialTemplate as TemplateId) : d.template,
      pkg: (PACKAGE_IDS as readonly string[]).includes(initialPkg ?? "") ? (initialPkg as PackageId) : d.pkg,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <BuilderUI draft={draft} setDraft={setDraft} mode="new" />;
}

function EditLoader({ id, editKey }: { id: string; editKey: string }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.order(id, editKey).then(
      ({ order }) => setDraft({ template: order.template, pkg: order.package, data: order.data, customer: order.customer }),
      (e: Error) => setError(e.message),
    );
  }, [id, editKey]);
  if (error) return <ErrorState title="Buyurtma topilmadi" text={error} />;
  if (!draft) return <PageLoader />;
  return <BuilderUI draft={draft} setDraft={setDraft as React.Dispatch<React.SetStateAction<Draft>>} mode="edit" orderId={id} editKey={editKey} />;
}

/* ================================================================== */

function BuilderUI({
  draft,
  setDraft,
  mode,
  orderId,
  editKey,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  mode: "new" | "edit";
  orderId?: string;
  editKey?: string;
}) {
  const config = useConfig();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [replay, setReplay] = useState(0);
  const [mobilePreview, setMobilePreview] = useState(false);
  const formTop = useRef<HTMLDivElement>(null);
  const steps = mode === "edit" ? STEPS.slice(0, 3) : STEPS;
  const lastStep = steps.length - 1;
  const packages = config?.packages ?? DEFAULT_PACKAGES;
  const templates = config?.templates ?? DEFAULT_TEMPLATES;

  const setData = (patch: Partial<InviteData>) => setDraft((d) => ({ ...d, data: { ...d.data, ...patch } }));
  const setCustomer = (patch: Partial<Customer>) => setDraft((d) => ({ ...d, customer: { ...d.customer, ...patch } }));

  useEffect(() => {
    document.title = mode === "edit" ? "Taklifnomani tahrirlash" : "Taklifnoma yaratish";
  }, [mode]);

  /** Blank program rows are ignored rather than blocking the form. */
  const cleanData = () => ({ ...draft.data, program: draft.data.program.filter((p) => p.title.trim()) });

  const validateStep = (s: number) => {
    const next: Record<string, string> = {};
    if (s === 1) {
      const r = inviteDataSchema.safeParse(cleanData());
      if (!r.success) for (const issue of r.error.issues) next[String(issue.path[0])] ??= issue.message;
    }
    if (s === 3) {
      const r = customerSchema.safeParse(draft.customer);
      if (!r.success) for (const issue of r.error.issues) next[`c.${String(issue.path[0])}`] ??= issue.message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const go = (to: number) => {
    if (to > step) {
      for (let s = step; s < to; s++) {
        if (!validateStep(s)) {
          setStep(s);
          return;
        }
      }
    }
    setErrors({});
    setStep(to);
    requestAnimationFrame(() => formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const submit = async () => {
    if (!validateStep(1)) return go(1);
    if (mode === "new" && !validateStep(3)) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = inviteDataSchema.parse(cleanData());
      if (mode === "edit" && orderId && editKey) {
        await api.updateOrder(orderId, editKey, { template: draft.template, data });
        navigate(`/buyurtma/${orderId}?k=${encodeURIComponent(editKey)}&saved=1`);
      } else {
        const customer = customerSchema.parse(draft.customer);
        const res = await api.createOrder({ template: draft.template, package: draft.pkg, data, customer });
        try {
          const list = JSON.parse(localStorage.getItem("visol-orders") || "[]") as unknown[];
          localStorage.setItem("visol-orders", JSON.stringify([{ id: res.id, key: res.key, names: `${data.groom} & ${data.bride}` }, ...list].slice(0, 10)));
          localStorage.removeItem("visol-draft-v1");
        } catch {
          /* storage unavailable */
        }
        navigate(`/buyurtma/${res.id}?k=${encodeURIComponent(res.key)}&new=1`);
      }
    } catch (e) {
      setSubmitError((e as Error).message);
      setSubmitting(false);
    }
  };

  const preview = (
    <InvitationExperience
      key={draft.template}
      template={draft.template}
      data={{ ...draft.data, groom: draft.data.groom || "Aziz", bride: draft.data.bride || "Madina", venue: draft.data.venue || "To‘yxona nomi" }}
      mode="preview"
      embedded
      replayToken={replay}
      sound={false}
    />
  );

  return (
    <div className="min-h-screen-safe bg-ivory">
      <header className="sticky top-0 z-40 border-b border-line bg-ivory/85 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Logo name={config?.brandName} />
          <ol className="hidden items-center gap-2 text-[13px] sm:flex" aria-label="Qadamlar">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(i)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${i === step ? "bg-ink text-white" : i < step ? "text-ink" : "text-stone"}`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${i === step ? "bg-white/20" : "bg-black/5"}`}>
                    {i < step ? <IconCheck size={12} /> : i + 1}
                  </span>
                  {s}
                </button>
                {i < lastStep && <span className="h-px w-4 bg-line" />}
              </li>
            ))}
          </ol>
          <span className="text-[13px] text-stone sm:hidden">
            {step + 1} / {steps.length}
          </span>
        </div>
        <div className="h-0.5 bg-line sm:hidden">
          <div className="h-full bg-gold transition-[width] duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      <div className="container-x grid gap-10 pt-8 pb-40 lg:grid-cols-[minmax(0,1fr)_420px] lg:pb-16">
        <div ref={formTop} className="scroll-mt-24">
          <p className="eyebrow">
            {step + 1}-qadam · {steps[step]}
          </p>
          <h1 className="mt-3 font-serif text-[34px] leading-tight font-medium sm:text-[42px]">
            {
              [
                "Taklifnomangiz uslubini tanlang",
                "Kelin-kuyov va to‘y haqida",
                "Suratlar va musiqa qo‘shing",
                "Paket va aloqa ma’lumotlari",
              ][step]
            }
          </h1>

          <div className="mt-8">
            {step === 0 && <StepDesign draft={draft} setDraft={setDraft} setData={setData} templates={templates} />}
            {step === 1 && <StepDetails data={draft.data} setData={setData} errors={errors} />}
            {step === 2 && <StepMedia data={draft.data} setData={setData} pkg={draft.pkg} mode={mode} />}
            {step === 3 && mode === "new" && (
              <StepOrder draft={draft} setDraft={setDraft} setCustomer={setCustomer} errors={errors} packages={packages} />
            )}
          </div>

          {submitError && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-[14px] text-red-700">{submitError}</p>}

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/90 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl lg:static lg:mt-12 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div className="mx-auto flex max-w-[1160px] items-center gap-3">
              {step > 0 ? (
                <button type="button" className="btn btn-light !px-4" onClick={() => go(step - 1)} aria-label="Orqaga">
                  <IconArrowLeft size={18} />
                </button>
              ) : null}
              <button type="button" className="btn btn-light !px-4 lg:hidden" onClick={() => setMobilePreview(true)}>
                <IconEye size={18} /> Ko‘rish
              </button>
              {step < lastStep ? (
                <button type="button" className="btn btn-dark flex-1 lg:flex-none" onClick={() => go(step + 1)}>
                  Davom etish <IconArrowRight size={18} />
                </button>
              ) : (
                <button type="button" className="btn btn-dark flex-1 lg:flex-none" onClick={submit} disabled={submitting}>
                  {submitting ? <Spinner /> : mode === "edit" ? "O‘zgarishlarni saqlash" : "Buyurtmani tasdiqlash"}
                  {!submitting && <IconArrowRight size={18} />}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <PhoneFrame>{preview}</PhoneFrame>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button type="button" className="btn btn-light btn-sm" onClick={() => setReplay((r) => r + 1)}>
                <IconReplay size={16} /> Ochilishni qayta ko‘rish
              </button>
            </div>
          </div>
        </aside>
      </div>

      {mobilePreview && (
        <div className="fixed inset-0 z-50 bg-black">
          <div data-scroll-root className="absolute inset-0 overflow-y-auto overscroll-contain">{preview}</div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-3 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            <button type="button" className="btn btn-light btn-sm pointer-events-auto" onClick={() => setReplay((r) => r + 1)}>
              <IconReplay size={16} /> Qayta
            </button>
            <button type="button" className="btn btn-dark btn-sm pointer-events-auto" onClick={() => setMobilePreview(false)}>
              <IconClose size={16} /> Tahrirga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Field helpers                                                       */
/* ------------------------------------------------------------------ */

function Field({ label, hint, error, children, optional }: { label: string; hint?: string; error?: string; children: ReactNode; optional?: boolean }) {
  return (
    <label className="block">
      <span className="label">
        {label} {optional && <span className="font-normal text-stone">(ixtiyoriy)</span>}
      </span>
      {children}
      {error ? <span className="hint !text-red-600">{error}</span> : hint ? <span className="hint block">{hint}</span> : null}
    </label>
  );
}

function Card({ title, children, aside }: { title?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="card-surface p-5 sm:p-7">
      {title && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold">{title}</h2>
          {aside}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 text-left">
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {hint && <span className="hint block !mt-0.5">{hint}</span>}
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-ink" : "bg-sand"}`}>
        <span className={`absolute top-0.5 left-0 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

function StepDesign({
  draft,
  setDraft,
  setData,
  templates,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  setData: (p: Partial<InviteData>) => void;
  templates: typeof DEFAULT_TEMPLATES;
}) {
  const sample = { ...draft.data, groom: draft.data.groom || "Aziz", bride: draft.data.bride || "Madina" };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templates.map((t) => {
          const active = t.id === draft.template;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, template: t.id }))}
              className={`group relative overflow-hidden rounded-[22px] p-3 pb-4 text-left transition ${active ? "bg-white shadow-[0_0_0_2px_#141414]" : "bg-cream/70 hover:bg-cream"}`}
              aria-pressed={active}
            >
              <div className="mx-auto pt-2" style={{ width: 112, height: 168 }}>
                <Gatefold template={t.id} data={sample} width={112} state="closed" interactive={false} />
              </div>
              <p className="mt-4 font-serif text-[19px] leading-none font-medium">{t.name}</p>
              <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-stone">{t.tagline}</p>
              {active && (
                <span className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full bg-ink text-white">
                  <IconCheck size={14} />
                </span>
              )}
              <span className="absolute top-3 left-3 flex gap-1">
                {THEMES[t.id].swatch.map((c) => (
                  <i key={c} className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <Card title="Marosim turi">
        <div className="grid grid-cols-2 gap-2">
          {EVENT_OPTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setData({ eventType: id })}
              className={`min-h-[48px] rounded-2xl px-3 text-[14.5px] font-medium transition ${draft.data.eventType === id ? "bg-ink text-white" : "bg-ivory text-ink-soft ring-1 ring-line hover:ring-stone/40"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Toggle
          checked={draft.data.bismillah}
          onChange={(v) => setData({ bismillah: v })}
          label="“Bismillahir Rohmanir Rohiym” bilan boshlash"
          hint="Taklifnoma ichki qismining tepasida nafis yozuv"
        />
      </Card>
    </div>
  );
}

function StepDetails({ data, setData, errors }: { data: InviteData; setData: (p: Partial<InviteData>) => void; errors: Record<string, string> }) {
  const coords = parseCoords(data.mapUrl);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  return (
    <div className="space-y-5">
      <Card title="Kelin va kuyov">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kuyov ismi" error={errors.groom}>
            <input className="field" value={data.groom} onChange={(e) => setData({ groom: e.target.value })} placeholder="Masalan: Aziz" maxLength={40} autoComplete="off" />
          </Field>
          <Field label="Kelin ismi" error={errors.bride}>
            <input className="field" value={data.bride} onChange={(e) => setData({ bride: e.target.value })} placeholder="Masalan: Madina" maxLength={40} autoComplete="off" />
          </Field>
        </div>
        <Field label="Taklif qiluvchilar" optional hint="Masalan: Karimovlar va Rahimovlar oilasi">
          <input className="field" value={data.hosts} onChange={(e) => setData({ hosts: e.target.value })} placeholder="Karimovlar oilasi" maxLength={160} />
        </Field>
      </Card>

      <Card title="Sana va vaqt">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sana" error={errors.date}>
            <input type="date" className="field" min={minDate} value={data.date} onChange={(e) => setData({ date: e.target.value })} />
          </Field>
          <Field label="Boshlanish vaqti" error={errors.time}>
            <input type="time" className="field" value={data.time} onChange={(e) => setData({ time: e.target.value })} step={300} />
          </Field>
        </div>
      </Card>

      <Card title="To‘yxona">
        <Field label="To‘yxona nomi" error={errors.venue}>
          <input className="field" value={data.venue} onChange={(e) => setData({ venue: e.target.value })} placeholder="Masalan: Navro‘z to‘yxonasi" maxLength={120} />
        </Field>
        <Field label="Manzil" optional>
          <input className="field" value={data.address} onChange={(e) => setData({ address: e.target.value })} placeholder="Shahar, tuman, ko‘cha" maxLength={240} />
        </Field>
        <Field
          label="Xarita havolasi"
          optional
          error={errors.mapUrl}
          hint={
            data.mapUrl
              ? coords
                ? "✓ Joylashuv aniqlandi — mehmonlar to‘g‘ri manzilga yo‘l oladi."
                : "Havola saqlanadi. Aniq nuqta uchun Google Maps’dagi to‘liq havolani qo‘ying."
              : "Google Maps yoki Yandex’da to‘yxonani toping → “Ulashish” → havolani shu yerga qo‘ying."
          }
        >
          <input className="field" inputMode="url" value={data.mapUrl} onChange={(e) => setData({ mapUrl: e.target.value.trim() })} placeholder="https://maps.google.com/…" maxLength={600} />
        </Field>
        <Field label="Kiyinish uslubi" optional>
          <input className="field" value={data.dressCode} onChange={(e) => setData({ dressCode: e.target.value })} placeholder="Masalan: klassik, och ranglar" maxLength={120} />
        </Field>
      </Card>

      <Card
        title="Taklif matni"
        aside={
          <button type="button" className="text-[13px] font-semibold text-gold" onClick={() => setData({ message: defaultMessage(data) })}>
            Namunaviy matn
          </button>
        }
      >
        <Field label="Mehmonlarga murojaat" optional hint="Bo‘sh qoldirsangiz, nafis namunaviy matn ishlatiladi.">
          <textarea className="field" value={data.message} onChange={(e) => setData({ message: e.target.value })} placeholder={defaultMessage(data)} maxLength={900} rows={5} />
        </Field>
      </Card>

      <ProgramEditor data={data} setData={setData} />
    </div>
  );
}

function ProgramEditor({ data, setData }: { data: InviteData; setData: (p: Partial<InviteData>) => void }) {
  const items = data.program;
  const update = (i: number, patch: Partial<InviteData["program"][number]>) =>
    setData({ program: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  return (
    <Card
      title="To‘y dasturi"
      aside={
        items.length < 8 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold"
            onClick={() => setData({ program: [...items, { time: data.time || "18:00", title: "" }] })}
          >
            <IconPlus size={16} /> Qo‘shish
          </button>
        )
      }
    >
      {items.length === 0 && <p className="text-[14px] text-stone">Ixtiyoriy: mehmonlar uchun kun tartibi (masalan, 18:00 — Nikoh marosimi).</p>}
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="time" className="field !w-[118px] shrink-0" value={it.time} onChange={(e) => update(i, { time: e.target.value })} aria-label="Vaqt" />
          <input className="field" value={it.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Tadbir nomi" maxLength={80} aria-label="Tadbir" />
          <button type="button" className="grid h-[52px] w-11 shrink-0 place-items-center rounded-xl text-stone hover:text-red-600" onClick={() => setData({ program: items.filter((_, j) => j !== i) })} aria-label="O‘chirish">
            <IconTrash size={18} />
          </button>
        </div>
      ))}
    </Card>
  );
}

function StepMedia({ data, setData, pkg, mode }: { data: InviteData; setData: (p: Partial<InviteData>) => void; pkg: PackageId; mode: "new" | "edit" }) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const locked = mode === "edit" && !PACKAGE_FLAGS[pkg].photos;

  const onPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - data.photos.length);
    e.target.value = "";
    setError("");
    setUploading(files.length);
    const added: string[] = [];
    for (const f of files) {
      try {
        const blob = await resizeImage(f);
        const { url } = await api.upload(blob, "image");
        added.push(url);
      } catch (err) {
        setError((err as Error).message);
      }
      setUploading((n) => n - 1);
    }
    if (added.length) setData({ photos: [...data.photos, ...added].slice(0, 6) });
  };

  const onMusic = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return setError("Musiqa fayli 10 MB dan oshmasligi kerak");
    setError("");
    setUploading(1);
    try {
      const { url } = await api.upload(f, "audio");
      setData({ music: url });
    } catch (err) {
      setError((err as Error).message);
    }
    setUploading(0);
  };

  const premiumNote = (
    <span className="rounded-full bg-gold/12 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gold">PREMIUM</span>
  );

  if (locked) {
    return (
      <Card>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          Suratlar va musiqa Premium hamda Lux paketlarida mavjud. Paketni yangilash uchun biz bilan Telegram orqali bog‘laning.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card title="Juftlik suratlari" aside={premiumNote}>
        <p className="-mt-2 text-[14px] text-stone">6 tagacha surat. Sifatini saqlagan holda avtomatik siqiladi.</p>
        <div className="grid grid-cols-3 gap-3">
          {data.photos.map((src) => (
            <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute top-1.5 right-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
                onClick={() => setData({ photos: data.photos.filter((p) => p !== src) })}
                aria-label="Suratni o‘chirish"
              >
                <IconClose size={16} />
              </button>
            </div>
          ))}
          {Array.from({ length: uploading > 0 ? Math.min(uploading, 6 - data.photos.length) : 0 }).map((_, i) => (
            <div key={`u${i}`} className="grid aspect-[4/5] place-items-center rounded-2xl bg-cream text-gold">
              <Spinner />
            </div>
          ))}
          {data.photos.length + uploading < 6 && (
            <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-2xl border border-dashed border-stone/40 text-center text-[12.5px] text-stone transition hover:border-gold hover:text-gold">
              <span>
                <IconUpload className="mx-auto mb-1.5" />
                Surat qo‘shish
              </span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={onPhotos} />
            </label>
          )}
        </div>
      </Card>

      <Card title="Fon musiqasi" aside={premiumNote}>
        <div className="grid gap-2">
          {(
            [
              ["none", "Musiqasiz"],
              ...Object.entries(BUILTIN_MUSIC),
            ] as [string, string][]
          ).map(([id, label]) => (
            <MusicOption key={id} id={id} label={label} selected={data.music === id} onSelect={() => setData({ music: id })} />
          ))}
          {data.music.startsWith("/uploads/") && <MusicOption id={data.music} label="Sizning musiqangiz" selected onSelect={() => undefined} />}
          <label className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-stone/40 text-[14px] text-stone transition hover:border-gold hover:text-gold">
            {uploading && data.photos.length === 0 ? <Spinner /> : <IconUpload size={18} />} O‘z musiqangizni yuklang (MP3)
            <input type="file" accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/ogg" className="sr-only" onChange={onMusic} />
          </label>
        </div>
      </Card>

      {pkg === "standart" && mode === "new" && (data.photos.length > 0 || data.music !== "none") && (
        <p className="rounded-2xl bg-gold/10 px-4 py-3 text-[14px] text-ink-soft">
          Suratlar va musiqa Premium paketda ko‘rsatiladi — keyingi qadamda paketni tanlaysiz.
        </p>
      )}
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-[14px] text-red-700">{error}</p>}
    </div>
  );
}

function MusicOption({ id, label, selected, onSelect }: { id: string; label: string; selected: boolean; onSelect: () => void }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => audio.current?.pause(), []);
  const src = id === "none" ? null : id.startsWith("/uploads/") ? id : `/music/${id}.mp3`;
  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!src) return;
    audio.current ??= new Audio(src);
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else {
      void audio.current.play().then(() => setPlaying(true), () => setPlaying(false));
      audio.current.onended = () => setPlaying(false);
    }
  };
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={`flex min-h-[56px] cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 transition ${selected ? "bg-ink text-white" : "bg-ivory ring-1 ring-line hover:ring-stone/40"}`}
    >
      <span className="flex items-center gap-3 text-[15px] font-medium">
        <span className={`grid h-5 w-5 place-items-center rounded-full ${selected ? "bg-white text-ink" : "ring-1 ring-stone/40"}`}>{selected && <IconCheck size={13} />}</span>
        {label}
      </span>
      {src && (
        <button type="button" onClick={toggle} className={`grid h-9 w-9 place-items-center rounded-full ${selected ? "bg-white/15" : "bg-black/5"}`} aria-label={playing ? "To‘xtatish" : "Tinglash"}>
          {playing ? <span className="h-3 w-3 rounded-[2px] bg-current" /> : <IconMusic size={16} />}
        </button>
      )}
    </div>
  );
}

function StepOrder({
  draft,
  setDraft,
  setCustomer,
  errors,
  packages,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  setCustomer: (p: Partial<Customer>) => void;
  errors: Record<string, string>;
  packages: typeof DEFAULT_PACKAGES;
}) {
  const selected = packages.find((p) => p.id === draft.pkg) ?? packages[1];
  const loseExtras = !PACKAGE_FLAGS[draft.pkg].photos && (draft.data.photos.length > 0 || draft.data.music !== "none");
  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        {packages.map((p) => {
          const active = p.id === draft.pkg;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, pkg: p.id }))}
              className={`relative rounded-[22px] p-5 text-left transition ${active ? "bg-ink text-white shadow-xl" : "card-surface hover:shadow-lg"}`}
              aria-pressed={active}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-serif text-[24px] leading-none font-medium">
                    {p.name}
                    {p.popular && <span className="btn-gold rounded-full px-2 py-0.5 font-sans text-[10px] font-bold tracking-wider uppercase">Tavsiya</span>}
                  </p>
                  <p className={`mt-1.5 text-[13.5px] ${active ? "text-white/65" : "text-stone"}`}>{p.description}</p>
                </div>
                <p className="shrink-0 text-right font-serif text-[22px] leading-none font-medium">
                  {p.price.toLocaleString("ru-RU").replace(/ /g, " ")}
                  <span className={`block font-sans text-[11px] ${active ? "text-white/60" : "text-stone"}`}>so‘m</span>
                </p>
              </div>
              {active && (
                <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13.5px] text-white/85">
                      <IconCheck size={16} className="mt-0.5 shrink-0 text-gold-soft" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>
      {loseExtras && (
        <p className="rounded-2xl bg-gold/10 px-4 py-3 text-[14px] text-ink-soft">
          Diqqat: {selected.name} paketida suratlar va musiqa ko‘rsatilmaydi. Ularni saqlash uchun Premium’ni tanlang.
        </p>
      )}

      <Card title="Aloqa ma’lumotlari">
        <Field label="Ismingiz" error={errors["c.name"]}>
          <input className="field" value={draft.customer.name} onChange={(e) => setCustomer({ name: e.target.value })} placeholder="Ism va familiya" autoComplete="name" maxLength={80} />
        </Field>
        <Field label="Telefon raqamingiz" error={errors["c.phone"]} hint="To‘lov tasdiqlangach shu raqam orqali bog‘lanamiz">
          <input className="field" type="tel" inputMode="tel" value={draft.customer.phone} onChange={(e) => setCustomer({ phone: e.target.value })} placeholder="+998 90 123 45 67" autoComplete="tel" maxLength={20} />
        </Field>
        <Field label="Telegram username" optional error={errors["c.telegram"]}>
          <input className="field" value={draft.customer.telegram} onChange={(e) => setCustomer({ telegram: e.target.value })} placeholder="@username" autoCapitalize="off" autoCorrect="off" maxLength={40} />
        </Field>
      </Card>

      <div className="card-surface flex items-center justify-between p-5 sm:p-7">
        <div>
          <p className="text-[13px] text-stone">Jami to‘lov</p>
          <p className="mt-1 font-serif text-[32px] leading-none font-medium">{formatPrice(selected.price)}</p>
        </div>
        <p className="max-w-[180px] text-right text-[12.5px] leading-snug text-stone">To‘lov keyingi sahifada: Click, Payme yoki karta orqali</p>
      </div>
    </div>
  );
}
