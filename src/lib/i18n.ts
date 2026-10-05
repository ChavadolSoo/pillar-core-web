/** Website languages; Thai first (the realm's default locale too). */
export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "th";
export const LOCALE_COOKIE = "plc_lang";

export const hasLocale = (value: string | undefined | null): value is Locale =>
  !!value && (locales as readonly string[]).includes(value);

/** Localized API text: Thai is always there, English is optional. */
export type I18nText = { th: string; en?: string };

export function tx(text: I18nText | null | undefined, lang: Locale): string {
  if (!text) return "";
  return (lang === "en" && text.en) || text.th;
}

/** `/en/apps` -> `/th/apps` */
export function switchLocalePath(pathname: string, lang: Locale): string {
  const parts = pathname.split("/");
  if (hasLocale(parts[1])) parts[1] = lang;
  else parts.splice(1, 0, lang);
  return parts.join("/") || `/${lang}`;
}

/** Locale-prefixed href. */
export const href = (lang: Locale, path = "") => `/${lang}${path === "/" ? "" : path}`;

export function formatDate(iso: string | null | undefined, lang: Locale, withTime = false): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-GB", {
    dateStyle: "medium",
    ...(withTime && { timeStyle: "short" }),
    timeZone: "Asia/Bangkok",
  }).format(new Date(iso));
}

/** 19900 THB minor units -> "฿199" / "฿199.50" */
export function formatPrice(minor: number, currency: string): string {
  // th-TH prints the ฿ symbol (en-US would print "THB 199") and Western digits.
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

/** "สวัสดี {name}" + { name } */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));
}
