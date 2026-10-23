import { EVENT_TYPES, type EventType } from "@shared/constants";
import type { InviteData } from "@shared/schema";

/** Default invitation wording in natural, respectful Uzbek. */
export function defaultMessage(d: Pick<InviteData, "groom" | "bride" | "eventType">) {
  const event = EVENT_TYPES[d.eventType].toLowerCase();
  const g = d.groom || "kuyov";
  const b = d.bride || "kelin";
  return `Sizni hayotimizdagi eng quvonchli kun — farzandlarimiz ${g} va ${b}ning ${event} marosimiga lutfan taklif etamiz. Ushbu baxtli onlarni siz bilan birga nishonlashdan mamnun bo‘lamiz.`;
}

export const EVENT_OPTIONS = Object.entries(EVENT_TYPES) as [EventType, string][];

export const SAMPLE_DATA: InviteData = {
  eventType: "nikoh",
  groom: "Aziz",
  bride: "Madina",
  date: nextSaturday(),
  time: "18:00",
  venue: "Navro‘z to‘yxonasi",
  address: "Toshkent sh., Yunusobod tumani, Amir Temur ko‘chasi, 108",
  mapUrl: "https://www.google.com/maps/@41.3384,69.2853,17z",
  hosts: "Karimovlar va Rahimovlar oilasi",
  message: "",
  bismillah: true,
  program: [
    { time: "17:30", title: "Mehmonlarni kutib olish" },
    { time: "18:00", title: "Nikoh marosimi" },
    { time: "19:00", title: "To‘y ziyofati" },
    { time: "22:30", title: "Yakuniy raqs" },
  ],
  photos: [],
  music: "nafis",
  dressCode: "",
};

function nextSaturday() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const EMPTY_DATA: InviteData = {
  ...SAMPLE_DATA,
  groom: "",
  bride: "",
  venue: "",
  address: "",
  mapUrl: "",
  hosts: "",
  program: [],
  music: "none",
};

/* ------------------------------------------------------------------ */
/* Maps                                                                */
/* ------------------------------------------------------------------ */

export function parseCoords(url: string): { lat: number; lng: number } | null {
  if (!url) return null;
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    /* keep raw */
  }
  const valid = (lat: number, lng: number) => Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
  // Yandex uses "ll=lng,lat" / "pt=lng,lat"
  const y = decoded.match(/yandex\.[a-z.]+\/.*?[?&](?:pt|ll|whatshere\[point\])=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (y) return valid(Number(y[2]), Number(y[1]));
  const patterns = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&](?:q|ll|query|destination|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/, /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/];
  for (const p of patterns) {
    const m = decoded.match(p);
    if (m) return valid(Number(m[1]), Number(m[2]));
  }
  return null;
}

export function mapLinks(d: Pick<InviteData, "venue" | "address" | "mapUrl">) {
  const coords = parseCoords(d.mapUrl);
  const query = [d.venue, d.address].filter(Boolean).join(", ");
  if (coords) {
    const ll = `${coords.lat},${coords.lng}`;
    return {
      embed: `https://maps.google.com/maps?q=${ll}&z=16&output=embed`,
      google: `https://www.google.com/maps/dir/?api=1&destination=${ll}`,
      yandex: `https://yandex.uz/maps/?rtext=~${ll}&rtt=auto`,
    };
  }
  const q = encodeURIComponent(query || "Toshkent");
  return {
    embed: `https://maps.google.com/maps?q=${q}&z=15&output=embed`,
    google: /google|goo\.gl/.test(d.mapUrl) ? d.mapUrl : `https://www.google.com/maps/search/?api=1&query=${q}`,
    yandex: /yandex/.test(d.mapUrl) ? d.mapUrl : `https://yandex.uz/maps/?text=${q}`,
  };
}
