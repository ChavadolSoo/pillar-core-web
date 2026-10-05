"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { unstable_update } from "@/auth";
import { ApiError, userApi } from "@/lib/api";
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n";
import { getViewer, TENANT_COOKIE } from "@/lib/session";
import type { FormSchema, FormSummary, FormVersion, Organization, Ticket, TicketStatus } from "@/lib/types";

export type WorkspaceState = { ok?: boolean; error?: string; field?: string } | undefined;

function apiMessage(e: unknown) {
  return e instanceof ApiError ? e.message : "API unavailable";
}

/**
 * Language to redirect to: the form's `lang` field, else the page it was
 * sent from (root params cannot be read inside a server action).
 */
async function localeOf(formData: FormData): Promise<Locale> {
  const field = String(formData.get("lang") ?? "");
  if (hasLocale(field)) return field;
  const referer = (await headers()).get("referer");
  const first = referer ? new URL(referer).pathname.split("/")[1] : undefined;
  return hasLocale(first) ? first : defaultLocale;
}

const UUID = /^[0-9a-f-]{36}$/i;
const ORG_CODE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

const orgSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().toLowerCase().regex(ORG_CODE),
});

/**
 * Opens an organization for the signed-in user (plc-user creates the Keycloak
 * organization and makes them its admin), then refreshes the session so the
 * new token carries it.
 */
export async function createOrganization(_: WorkspaceState, formData: FormData): Promise<WorkspaceState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign-in required" };
  const parsed = orgSchema.safeParse({ name: formData.get("name"), code: formData.get("code") });
  if (!parsed.success) return { field: String(parsed.error.issues[0]?.path[0] ?? "name") };
  let org: Organization;
  try {
    org = await userApi<Organization>("POST", "/api/tenants", parsed.data);
  } catch (e) {
    if (e instanceof ApiError && e.status === 409 && /code/i.test(e.message)) return { field: "code", error: "taken" };
    return { error: apiMessage(e) };
  }
  await unstable_update({});
  (await cookies()).set(TENANT_COOKIE, org.code, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
  redirect(`/${await localeOf(formData)}/workspace`);
}

export async function renameOrganization(_: WorkspaceState, formData: FormData): Promise<WorkspaceState> {
  const name = z.string().trim().min(2).max(120).safeParse(formData.get("name"));
  if (!name.success) return { field: "name" };
  try {
    await userApi<Organization>("PATCH", "/api/tenants/current", { name: name.data });
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Turns a web service on or off for the caller's organization (admins). */
export async function toggleService(_: WorkspaceState, formData: FormData): Promise<WorkspaceState> {
  const code = String(formData.get("code") ?? "");
  const on = formData.get("on") === "true";
  if (!/^[a-z0-9_]{2,40}$/.test(code)) return { error: "invalid" };
  try {
    if (on) await userApi("POST", "/api/portal/subscriptions", { service_code: code });
    else await userApi("DELETE", `/api/portal/subscriptions/${code}`);
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------- forms

const FORM_APPS = ["forms", "documents"] as const;

/** A new form of `forms` or `documents`, then its editor. */
export async function createForm(_: WorkspaceState, formData: FormData): Promise<WorkspaceState> {
  const app = String(formData.get("app") ?? "");
  const name = z.string().trim().min(1).max(200).safeParse(formData.get("name"));
  if (!(FORM_APPS as readonly string[]).includes(app)) return { error: "invalid" };
  if (!name.success) return { field: "name" };
  const description = String(formData.get("description") ?? "").trim().slice(0, 1000);
  let form: FormSummary;
  try {
    form = await userApi<FormSummary>("POST", "/api/form/forms", {
      app_code: app,
      code: `f_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: { th: name.data, en: name.data },
      ...(description && { description: { th: description, en: description } }),
    });
  } catch (e) {
    return { error: apiMessage(e) };
  }
  redirect(`/${await localeOf(formData)}/workspace/${app}/${form.id}`);
}

export type SaveFormResult = { ok: true; published: boolean } | { ok: false; error: string; problems?: string[] };

/**
 * Saves the questions as the form's draft (a new draft when there is none)
 * and, with `publish`, makes it the version people fill in.
 */
export async function saveFormSchema(formId: string, schema: FormSchema, publish: boolean): Promise<SaveFormResult> {
  if (!UUID.test(formId)) return { ok: false, error: "invalid" };
  try {
    const form = await userApi<FormSummary>("GET", `/api/form/forms/${formId}`);
    const draft = form.versions?.find((v) => v.status === "DRAFT");
    const version = draft
      ? await userApi<FormVersion>("PUT", `/api/form/forms/${formId}/versions/${draft.number}`, { schema })
      : await userApi<FormVersion>("POST", `/api/form/forms/${formId}/versions`, { schema });
    if (publish) await userApi("POST", `/api/form/forms/${formId}/versions/${version.number}/publish`);
  } catch (e) {
    const problems =
      e instanceof ApiError && Array.isArray(e.body.problems)
        ? (e.body.problems as { path: string; message: string }[]).map((p) => `${p.path}: ${p.message}`)
        : undefined;
    return { ok: false, error: apiMessage(e), problems };
  }
  revalidatePath("/", "layout");
  return { ok: true, published: publish };
}

export async function setFormSharing(_: WorkspaceState, formData: FormData): Promise<WorkspaceState> {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "invalid" };
  try {
    await userApi("PUT", `/api/form/forms/${id}/sharing`, { public: formData.get("public") === "true" });
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function archiveForm(_: WorkspaceState, formData: FormData): Promise<WorkspaceState> {
  const id = String(formData.get("id") ?? "");
  const app = String(formData.get("app") ?? "");
  if (!UUID.test(id) || !(FORM_APPS as readonly string[]).includes(app)) return { error: "invalid" };
  try {
    await userApi("DELETE", `/api/form/forms/${id}`);
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  redirect(`/${await localeOf(formData)}/workspace/${app}`);
}

// ---------------------------------------------------------------- helpdesk

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"];

export async function replyHelpdesk(_: WorkspaceState, formData: FormData): Promise<WorkspaceState> {
  const id = String(formData.get("id") ?? "");
  const message = z.string().trim().min(1).max(10000).safeParse(formData.get("message"));
  if (!UUID.test(id) || !message.success) return { error: "invalid" };
  try {
    await userApi<Ticket>("POST", `/api/portal/helpdesk/tickets/${id}/replies`, {
      message: message.data,
      internal: formData.get("internal") === "on",
    });
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setHelpdeskStatus(_: WorkspaceState, formData: FormData): Promise<WorkspaceState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as TicketStatus;
  const version = Number(formData.get("version"));
  if (!UUID.test(id) || !STATUSES.includes(status) || !Number.isInteger(version)) return { error: "invalid" };
  try {
    await userApi<Ticket>("PATCH", `/api/portal/helpdesk/tickets/${id}`, { status, version });
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
