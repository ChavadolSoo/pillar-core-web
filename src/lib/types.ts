/** plc-portal website API (pillar-core-backend/docs/pillarcore-site-api.md). */
import type { I18nText } from "@/lib/i18n";

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

export type Platform = "web" | "android" | "ios" | "windows" | "macos";

export type SiteApp = {
  code: string;
  name: string;
  tagline: I18nText | null;
  description: I18nText | null;
  body: I18nText | null;
  color: string;
  category: string;
  icon: string;
  logo_url: string | null;
  cover_url: string | null;
  gallery: string[];
  website_url: string | null;
  platforms: Platform[];
  status: "AVAILABLE" | "COMING_SOON";
  featured: boolean;
  sort_order: number;
};

export type NewsType = "NEWS" | "FEATURE" | "NEW_APP" | "ANNOUNCEMENT";
export type NewsSummary = {
  id: string;
  slug: string;
  type: NewsType;
  title: I18nText;
  summary: I18nText | null;
  cover_url: string | null;
  app_code: string | null;
  pinned: boolean;
  published_at: string | null;
};
export type NewsDetail = NewsSummary & { body: I18nText };

export type MarketItemType = "TEMPLATE" | "FEATURE" | "ADDON";
export type MarketItem = {
  id: string;
  slug: string;
  app_code: string;
  app_name: string;
  app_color: string;
  type: MarketItemType;
  name: I18nText;
  summary: I18nText | null;
  cover_url: string | null;
  price_minor: number;
  currency: string;
  tags: string[];
  featured: boolean;
  owned?: boolean;
};
export type MarketItemDetail = MarketItem & { description: I18nText | null; gallery: string[] };

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  total_minor: number;
  currency: string;
  provider: "free" | "mock" | "stripe";
  items: { item_id: string; slug: string; name: I18nText; app_code: string; price_minor: number }[];
  paid_at: string | null;
  created_at: string;
};
export type Checkout = { order: Order; checkout_url: string | null };

export type EntitlementStatus = "PENDING" | "FULFILLED" | "FAILED" | "REVOKED";
export type Entitlement = {
  id: string;
  item: MarketItem;
  order_id: string;
  status: EntitlementStatus;
  result: Record<string, unknown> | null;
  granted_at: string;
};

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
export type TicketCategory = "BUG" | "QUESTION" | "ACCOUNT" | "BILLING" | "FEATURE_REQUEST" | "OTHER";
export const TICKET_CATEGORIES: TicketCategory[] = ["BUG", "QUESTION", "ACCOUNT", "BILLING", "FEATURE_REQUEST", "OTHER"];

export type TicketSummary = {
  id: string;
  number: string;
  app_code: string | null;
  app_name: string | null;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  contact_name: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
  last_reply_at: string | null;
};
export type TicketReply = {
  id: string;
  author: "CUSTOMER" | "STAFF";
  author_name: string | null;
  message: string;
  internal: boolean;
  created_at: string;
};
export type Ticket = TicketSummary & { message: string; contact_phone: string | null; replies: TicketReply[] };

export type MeSummary = { tickets_open: number; orders: number; entitlements: number };
