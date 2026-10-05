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
  /** APP: store app; WEB: service used on this website */
  kind?: ServiceKind;
};

export type ServiceKind = "APP" | "WEB";

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
export type Ticket = TicketSummary & { message: string; contact_phone: string | null; replies: TicketReply[]; version: number };

export type MeSummary = { tickets_open: number; orders: number; entitlements: number };

// ---------------------------------------------------------------- organizations and web services

/** A catalog row as the caller's organization sees it (GET /api/portal/catalog). */
export type CatalogItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  category: string;
  kind: ServiceKind;
  status: "ACTIVE" | "NOT_INSTALLED" | "COMING_SOON";
};

export type Organization = { id: string; code: string; name: string; status: string };

/** Public page of an organization. */
export type OrgProfile = { code: string; name: string; services: string[] };

// ---------------------------------------------------------------- forms (plc-form)

/** {"th": "...", "en": "..."} or a plain string */
export type LocalText = string | Record<string, string>;

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "boolean"
  | "file"
  | "photo"
  | "note"
  | (string & {});

export type FormField = {
  key: string;
  type: FormFieldType;
  label?: LocalText;
  hint?: LocalText;
  required?: boolean;
  options?: { value: string; label?: LocalText }[];
  max_count?: number;
  [extra: string]: unknown;
};

export type FormSection = { key: string; title?: LocalText; description?: LocalText; fields: FormField[] };
export type FormSchema = { version?: number; title_field?: string; sections: FormSection[] };

export type FormVersionSummary = { id: string; number: number; status: "DRAFT" | "PUBLISHED" | "RETIRED"; published_at: string | null };

export type FormSummary = {
  id: string;
  app_code: string;
  code: string;
  name: Record<string, string>;
  description: Record<string, string> | null;
  published_version: number | null;
  public: boolean;
  public_token: string | null;
  versions?: FormVersionSummary[];
  version: number;
  created_at: string;
  updated_at: string;
};

export type FormVersion = FormVersionSummary & {
  form_id: string;
  schema: FormSchema;
  problems: { path: string; message: string }[];
};

export type SubmissionAttachment = {
  id: string;
  field_key: string;
  mime: string;
  size: number;
  file_name: string | null;
  status: string;
  url?: string;
};

export type Submission = {
  id: string;
  form_id: string;
  version_number: number;
  submitted_by: string;
  title: string | null;
  data: Record<string, unknown>;
  received_at: string;
  attachments?: SubmissionAttachment[];
};

/** A form shared as a public link. */
export type PublicForm = {
  name: I18nText;
  description: I18nText | null;
  organization: { code: string; name: string } | null;
  form_version_id: string;
  schema: FormSchema;
  max_file_bytes: number;
};

/** Per-field answer errors of a 422 (code like "validation.required"). */
export type FieldErrors = Record<string, { code: string; args?: Record<string, string> }>;
