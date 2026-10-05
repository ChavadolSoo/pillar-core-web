import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/th";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  th: () => import("@/dictionaries/th").then((m) => m.default),
  en: () => import("@/dictionaries/en").then((m) => m.default),
};

/** Locale of the current route (the root `[lang]` segment). */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<{ lang: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { lang: locale, t: await dictionaries[locale]() };
}

export type { Dictionary };
