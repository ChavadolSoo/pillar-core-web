"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, publicSend, userApi, visitorHeaders } from "@/lib/api";
import { getViewer } from "@/lib/session";
import { TICKET_CATEGORIES, type Ticket } from "@/lib/types";

export type TicketFormState =
  | {
      ok?: false;
      error?: string;
      fields?: Partial<Record<"subject" | "message" | "contact_name" | "contact_email" | "category", string>>;
    }
  | { ok: true; number: string; id?: string; token?: string }
  | undefined;

export type ReplyState = { error?: string; ok?: boolean } | undefined;

const ticketSchema = z.object({
  app_code: z.string().max(40).nullable(),
  category: z.enum(TICKET_CATEGORIES as [string, ...string[]]),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
  contact_name: z.string().trim().min(1).max(120),
  contact_email: z.email().max(200),
  contact_phone: z.string().trim().max(30).optional(),
});

function apiMessage(e: unknown) {
  return e instanceof ApiError ? e.message : "API unavailable";
}

/**
 * Help-center form. Signed-in users file the ticket on their account (and
 * follow it in My account); guests get a number and a one-time tracking code.
 */
export async function submitTicket(_: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const viewer = await getViewer();
  const app = String(formData.get("app_code") ?? "");
  // An organization's contact page: always a guest ticket to that organization's helpdesk.
  const org = String(formData.get("org") ?? "");
  if (org && !/^[a-z0-9][a-z0-9-]{1,39}$/.test(org)) return { error: "invalid" };
  const parsed = ticketSchema.safeParse({
    app_code: app && app !== "other" ? app : null,
    category: formData.get("category"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    contact_name: formData.get("contact_name") || viewer?.name || "",
    contact_email: (!org && viewer?.email) || formData.get("contact_email"),
    contact_phone: String(formData.get("contact_phone") ?? "") || undefined,
  });
  if (!parsed.success) {
    const fields: NonNullable<Extract<TicketFormState, { ok?: false }>>["fields"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof fields;
      fields[key] ??= issue.code === "invalid_format" ? "email" : "invalid";
    }
    return { fields };
  }
  try {
    if (org) {
      const res = await publicSend<{ ticket: Ticket; access_token: string }>(
        "POST",
        `/orgs/${org}/tickets`,
        { ...parsed.data, app_code: undefined },
        await visitorHeaders(),
      );
      return { ok: true, number: res.ticket.number, token: res.access_token };
    }
    if (viewer) {
      // The account's e-mail is taken from the token.
      const { app_code, category, subject, message, contact_name, contact_phone } = parsed.data;
      const ticket = await userApi<Ticket>("POST", "/api/portal/support/tickets", {
        app_code,
        category,
        subject,
        message,
        contact_name,
        contact_phone,
      });
      revalidatePath("/", "layout");
      return { ok: true, number: ticket.number, id: ticket.id };
    }
    const res = await publicSend<{ ticket: Ticket; access_token: string }>("POST", "/support/tickets", parsed.data);
    return { ok: true, number: res.ticket.number, token: res.access_token };
  } catch (e) {
    return { error: apiMessage(e) };
  }
}

const replySchema = z.string().trim().min(1).max(5000);

/** Reply on one of the signed-in user's tickets. */
export async function replyTicket(_: ReplyState, formData: FormData): Promise<ReplyState> {
  const id = String(formData.get("id") ?? "");
  const message = replySchema.safeParse(formData.get("message"));
  if (!/^[0-9a-f-]{36}$/i.test(id) || !message.success) return { error: "invalid" };
  try {
    await userApi<Ticket>("POST", `/api/portal/support/tickets/${id}/replies`, { message: message.data });
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function closeTicket(_: ReplyState, formData: FormData): Promise<ReplyState> {
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "invalid" };
  try {
    await userApi<Ticket>("POST", `/api/portal/support/tickets/${id}/close`);
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Reply from the guest tracking page (number + tracking code). */
export async function guestReply(_: ReplyState, formData: FormData): Promise<ReplyState> {
  const number = String(formData.get("number") ?? "");
  const token = String(formData.get("token") ?? "");
  const message = replySchema.safeParse(formData.get("message"));
  if (!/^PC-\d+$/.test(number) || !token || !message.success) return { error: "invalid" };
  try {
    await publicSend<Ticket>(
      "POST",
      `/support/tickets/${encodeURIComponent(number)}/replies?token=${encodeURIComponent(token)}`,
      { message: message.data },
    );
  } catch (e) {
    return { error: apiMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
