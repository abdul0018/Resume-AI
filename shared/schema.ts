import { z } from "zod";
import {
  EVENT_TYPES,
  BUILTIN_MUSIC,
  TEMPLATE_IDS,
  PACKAGE_IDS,
  PACKAGE_FLAGS,
  DEFAULT_PACKAGES,
  type EventType,
  type PackageId,
  type PackageInfo,
  type TemplateId,
  type OrderStatus,
} from "./constants.ts";

export * from "./constants.ts";

/* ------------------------------------------------------------------ */
/* Invitation data                                                     */
/* ------------------------------------------------------------------ */

const trimmed = (max: number) => z.string().trim().max(max);
const uploadUrl = z.string().regex(/^\/uploads\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|mp3|m4a|aac|ogg)$/);

export const programItemSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  title: trimmed(80).min(1),
});

export const inviteDataSchema = z.object({
  eventType: z.enum(Object.keys(EVENT_TYPES) as [EventType, ...EventType[]]),
  groom: trimmed(40).min(1, "Kuyov ismini kiriting"),
  bride: trimmed(40).min(1, "Kelin ismini kiriting"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sanani tanlang"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Vaqtni tanlang"),
  venue: trimmed(120).min(1, "To‘yxona nomini kiriting"),
  address: trimmed(240).default(""),
  mapUrl: trimmed(600)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Havola https:// bilan boshlanishi kerak")
    .default(""),
  hosts: trimmed(160).default(""),
  message: trimmed(900).default(""),
  bismillah: z.boolean().default(false),
  program: z.array(programItemSchema).max(8).default([]),
  photos: z.array(uploadUrl).max(6).default([]),
  music: z.union([z.literal("none"), z.enum(Object.keys(BUILTIN_MUSIC) as [string, ...string[]]), uploadUrl]).default("none"),
  dressCode: trimmed(120).default(""),
});
export type InviteData = z.infer<typeof inviteDataSchema>;

export const customerSchema = z.object({
  name: trimmed(80).min(2, "Ismingizni kiriting"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d+]/g, ""))
    .refine((v) => /^\+?\d{9,15}$/.test(v), "Telefon raqamini to‘g‘ri kiriting"),
  telegram: trimmed(40)
    .transform((v) => v.replace(/^@/, ""))
    .refine((v) => v === "" || /^[a-zA-Z0-9_]{4,32}$/.test(v), "Telegram username noto‘g‘ri")
    .default(""),
});
export type Customer = z.infer<typeof customerSchema>;

export const createOrderSchema = z.object({
  template: z.enum(TEMPLATE_IDS),
  package: z.enum(PACKAGE_IDS),
  data: inviteDataSchema,
  customer: customerSchema,
  /** Honeypot: real users never fill it. */
  website: z.string().max(0).optional(),
});

export const updateOrderSchema = z.object({
  template: z.enum(TEMPLATE_IDS),
  data: inviteDataSchema,
});

export const rsvpSchema = z.object({
  name: trimmed(80).min(2, "Ismingizni kiriting"),
  attending: z.boolean(),
  guests: z.number().int().min(1).max(20).default(1),
  message: trimmed(500).default(""),
  website: z.string().max(0).optional(),
});

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const settingsSchema = z.object({
  brandName: trimmed(40).min(1),
  instagram: trimmed(60),
  telegram: trimmed(60),
  phone: trimmed(30),
  cardNumber: trimmed(30),
  cardHolder: trimmed(80),
  clickUrl: trimmed(300),
  paymeUrl: trimmed(300),
  paymentNote: trimmed(500),
  packages: z
    .array(
      z.object({
        id: z.enum(PACKAGE_IDS),
        name: trimmed(30).min(1),
        price: z.number().int().min(0).max(100_000_000),
        description: trimmed(120),
        features: z.array(trimmed(120)).max(10),
        popular: z.boolean().optional(),
      }),
    )
    .length(3),
});
export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  brandName: "Visol",
  instagram: "visol.uz",
  telegram: "visol_uz",
  phone: "+998 90 000 00 00",
  cardNumber: "8600 0000 0000 0000",
  cardHolder: "VISOL MCHJ",
  clickUrl: "",
  paymeUrl: "",
  paymentNote: "To‘lovdan so‘ng chek rasmini shu sahifada yuklang. Taklifnomangiz 15 daqiqa ichida faollashtiriladi.",
  packages: DEFAULT_PACKAGES.map(({ id, name, price, description, features, popular }) => ({
    id,
    name,
    price,
    description,
    features,
    popular,
  })),
};

/** Public settings merged with fixed feature flags. */
export function resolvePackages(settings: Settings): PackageInfo[] {
  return settings.packages.map((p) => ({ ...p, ...PACKAGE_FLAGS[p.id] }));
}

/* ------------------------------------------------------------------ */
/* API shapes                                                          */
/* ------------------------------------------------------------------ */

export interface PublicInvite {
  slug: string;
  template: TemplateId;
  package: PackageId;
  status: OrderStatus;
  data: InviteData;
}

export interface OrderView extends PublicInvite {
  id: string;
  price: number;
  customer: Customer;
  receipt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder extends OrderView {
  adminNote: string;
  rsvpCount: number;
}

export interface RsvpEntry {
  id: number;
  name: string;
  attending: boolean;
  guests: number;
  message: string;
  createdAt: string;
}
