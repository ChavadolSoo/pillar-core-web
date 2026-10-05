import "server-only";
import { cache } from "react";
import { ApiError, emptyPage, publicGet } from "@/lib/api";
import type { MarketItem, MarketItemDetail, NewsDetail, NewsSummary, Paginated, SiteApp } from "@/lib/types";

/**
 * Shown while plc-portal cannot be reached, so the public site never renders
 * an empty home page. The real list comes from the Admin web.
 */
const FALLBACK_APPS: SiteApp[] = [
  {
    code: "landie",
    name: "Landie",
    tagline: { th: "เก็บข้อมูลภาคสนาม แม้ไม่มีสัญญาณ", en: "Field data collection that works offline" },
    description: {
      th: "แบบสำรวจและฟอร์มภาคสนามที่ทำงานได้แบบออฟไลน์ ถ่ายรูป ระบุพิกัด แล้วซิงก์ขึ้นระบบเมื่อกลับมาออนไลน์",
      en: "Offline-first surveys and field forms with photos and GPS that sync when you are back online.",
    },
    body: null,
    color: "#16a34a",
    category: "Operations",
    icon: "travel_explore",
    logo_url: null,
    cover_url: null,
    gallery: [],
    website_url: null,
    platforms: ["android", "ios"],
    status: "AVAILABLE",
    featured: true,
    sort_order: 0,
  },
  {
    code: "appointment",
    name: "Appoiz",
    tagline: { th: "ระบบนัดหมายที่ใช้ง่ายทั้งผู้ให้บริการและลูกค้า", en: "Appointments made simple for staff and customers" },
    description: {
      th: "จองคิว จัดตารางนัด และแจ้งเตือนอัตโนมัติ ให้ลูกค้าและทีมงานไม่พลาดทุกนัดสำคัญ",
      en: "Bookings, schedules and automatic reminders so neither customers nor staff miss an appointment.",
    },
    body: null,
    color: "#ff6a3d",
    category: "Core",
    icon: "event_available",
    logo_url: null,
    cover_url: null,
    gallery: [],
    website_url: null,
    platforms: ["android", "ios"],
    status: "AVAILABLE",
    featured: true,
    sort_order: 1,
  },
];

function query(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** Published apps; the built-in list when the API is down. */
export const getApps = cache(async (): Promise<SiteApp[]> => {
  try {
    return await publicGet<SiteApp[]>("/apps");
  } catch (e) {
    console.error("[content] apps:", (e as Error).message);
    return FALLBACK_APPS;
  }
});

export const getApp = cache(async (code: string): Promise<SiteApp | null> => {
  try {
    return await publicGet<SiteApp>(`/apps/${encodeURIComponent(code)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    console.error("[content] app:", (e as Error).message);
    return FALLBACK_APPS.find((a) => a.code === code) ?? null;
  }
});

export async function getNews(params: { type?: string; app?: string; page?: number; limit?: number } = {}) {
  try {
    return await publicGet<Paginated<NewsSummary>>(`/news${query(params)}`);
  } catch (e) {
    console.error("[content] news:", (e as Error).message);
    return emptyPage as Paginated<NewsSummary>;
  }
}

export const getNewsItem = cache(async (slug: string): Promise<NewsDetail | null> => {
  try {
    return await publicGet<NewsDetail>(`/news/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 404)) console.error("[content] news item:", (e as Error).message);
    return null;
  }
});

export type MarketQuery = { app?: string; type?: string; q?: string; featured?: boolean; page?: number; limit?: number };

export async function getMarketItems(params: MarketQuery = {}) {
  try {
    return await publicGet<Paginated<MarketItem>>(`/marketplace/items${query(params)}`);
  } catch (e) {
    console.error("[content] marketplace:", (e as Error).message);
    return emptyPage as Paginated<MarketItem>;
  }
}

export const getMarketItem = cache(async (slug: string): Promise<MarketItemDetail | null> => {
  try {
    return await publicGet<MarketItemDetail>(`/marketplace/items/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 404)) console.error("[content] item:", (e as Error).message);
    return null;
  }
});

export { query as toQuery };
