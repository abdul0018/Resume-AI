/** Uzbek (Latin) formatting helpers shared by server and client. */

export const MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

export const WEEKDAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Parses YYYY-MM-DD without timezone drift. */
export function parseDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "12-iyun, 2027-yil" */
export function formatDateLong(date: string) {
  if (!date) return "";
  const { y, m, d } = parseDate(date);
  return `${d}-${MONTHS[m - 1]}, ${y}-yil`;
}

/** "12 · 06 · 2027" */
export function formatDateDots(date: string) {
  if (!date) return "";
  const { y, m, d } = parseDate(date);
  return `${String(d).padStart(2, "0")} · ${String(m).padStart(2, "0")} · ${y}`;
}

export function formatWeekday(date: string, capitalize = true) {
  if (!date) return "";
  const w = WEEKDAYS[parseDate(date).weekday];
  return capitalize ? cap(w) : w;
}

/** Wedding moment as an absolute timestamp. Uzbekistan is UTC+5 all year (no DST). */
export function eventTimestamp(date: string, time: string) {
  const { y, m, d } = parseDate(date);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh - 5, mm);
}

export function formatPrice(sum: number) {
  return `${sum.toLocaleString("ru-RU").replace(/ |,/g, " ")} so‘m`;
}

export function initials(groom: string, bride: string) {
  const g = groom.trim().charAt(0).toUpperCase() || "A";
  const b = bride.trim().charAt(0).toUpperCase() || "M";
  return `${g}${b}`;
}

/** ASCII slug from Uzbek names: "Oʻgʻiloy" → "ogiloy" */
export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[‘’ʻʼ'`]/g, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}
