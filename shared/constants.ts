/** Runtime constants shared by client and server (no validation library — keeps guest bundles small). */

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export const TEMPLATE_IDS = ["rishton", "zumrad", "atlas", "suzani", "oqoltin", "samarqand"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  tagline: string;
  badge: string;
  active: boolean;
  sort: number;
}

export const DEFAULT_TEMPLATES: TemplateMeta[] = [
  { id: "rishton", name: "Rishton", tagline: "Kumush lenta va Rishton sopolidagi ko‘k gullar", badge: "Eng mashhur", active: true, sort: 1 },
  { id: "zumrad", name: "Zumrad", tagline: "Zumrad yashil va oltin girih naqshlari", badge: "", active: true, sort: 2 },
  { id: "atlas", name: "Atlas", tagline: "Marg‘ilon atlasining nafis ranglari", badge: "Yangi", active: true, sort: 3 },
  { id: "suzani", name: "Suzani", tagline: "Qo‘l tikuvidagi suzani gullari", badge: "", active: true, sort: 4 },
  { id: "oqoltin", name: "Oq oltin", tagline: "Oq qog‘oz, qora lenta va oltin ravoq", badge: "Minimal", active: true, sort: 5 },
  { id: "samarqand", name: "Samarqand tuni", tagline: "Tungi moviy va oltin yulduzlar", badge: "", active: true, sort: 6 },
];

/* ------------------------------------------------------------------ */
/* Packages                                                            */
/* ------------------------------------------------------------------ */

export const PACKAGE_IDS = ["standart", "premium", "lux"] as const;
export type PackageId = (typeof PACKAGE_IDS)[number];

export interface PackageInfo {
  id: PackageId;
  name: string;
  price: number;
  description: string;
  features: string[];
  /** Feature flags are fixed per package; only texts/prices are editable. */
  photos: boolean;
  music: boolean;
  rsvp: boolean;
  popular?: boolean;
}

export const PACKAGE_FLAGS: Record<PackageId, Pick<PackageInfo, "photos" | "music" | "rsvp">> = {
  standart: { photos: false, music: false, rsvp: false },
  premium: { photos: true, music: true, rsvp: true },
  lux: { photos: true, music: true, rsvp: true },
};

export const DEFAULT_PACKAGES: PackageInfo[] = [
  {
    id: "standart",
    name: "Standart",
    price: 149000,
    description: "Nafis va tezkor taklifnoma",
    features: ["Istalgan shablon", "Ochiladigan 3D taklifnoma", "Ortga sanoq va xarita", "Shaxsiy havola", "1 marta tahrirlash"],
    ...PACKAGE_FLAGS.standart,
  },
  {
    id: "premium",
    name: "Premium",
    price: 249000,
    description: "To‘liq tajriba — eng ko‘p tanlanadi",
    features: [
      "Standart paketdagi hamma narsa",
      "6 tagacha juftlik fotosurati",
      "Fon musiqasi",
      "Mehmonlar javobi (RSVP) ro‘yxati",
      "To‘ygacha cheksiz tahrirlash",
    ],
    popular: true,
    ...PACKAGE_FLAGS.premium,
  },
  {
    id: "lux",
    name: "Lux",
    price: 449000,
    description: "Shaxsiy dizayner xizmati",
    features: [
      "Premium paketdagi hamma narsa",
      "Ranglar va matnni dizayner sozlaydi",
      "2 soat ichida tayyor",
      "Bosma uchun QR-kartochka",
      "Shaxsiy menejer",
    ],
    ...PACKAGE_FLAGS.lux,
  },
];

/* ------------------------------------------------------------------ */
/* Invitation constants                                                */
/* ------------------------------------------------------------------ */

export const EVENT_TYPES = {
  nikoh: "Nikoh to‘yi",
  fotiha: "Fotiha to‘yi",
  unashtiruv: "Unashtiruv",
  qizbazmi: "Qiz bazmi",
} as const;
export type EventType = keyof typeof EVENT_TYPES;

export const BUILTIN_MUSIC = {
  nafis: "Nafis — musiqa qutisi",
  sokin: "Sokin — fortepiano",
  toylar: "Bojalar — To‘ylar muborak",
  nashid: "Muhammad al-Muqit — To‘y nashidasi",
  nafosat: "Nafosat — to‘y kuyi",
} as const;

export const ORDER_STATUSES = {
  pending: "To‘lov kutilmoqda",
  review: "Chek tekshirilmoqda",
  active: "Faol",
  cancelled: "Bekor qilingan",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUSES;

