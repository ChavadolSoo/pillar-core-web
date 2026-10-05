import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { replyHelpdesk } from "@/actions/workspace";
import { ReplyForm } from "@/components/reply-form";
import { TicketStatusBadge } from "@/components/ticket-thread";
import { Alert, Badge } from "@/components/ui/primitives";
import { ServiceOff } from "@/components/workspace/service-off";
import { StatusSelect } from "@/components/workspace/helpdesk/status-select";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { fill, formatDate, href } from "@/lib/i18n";
import type { Ticket } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getWorkspace, isOn } from "@/lib/workspace";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.helpdesk.title, robots: { index: false } };
}

/** One customer request: the conversation, a reply box and its status. */
export default async function HelpdeskTicketPage(props: PageProps<"/[lang]/workspace/helpdesk/[id]">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ lang, t }, ws] = await Promise.all([getDictionary(), getWorkspace()]);
  if (!ws.org) return null;
  if (!isOn(ws, "helpdesk")) return <ServiceOff t={t} lang={lang} />;
  const h = t.helpdesk;
  // the customer's "waiting for you" is "waiting for the customer" here
  const st = { ...t, ticket: { ...t.ticket, status: { ...t.ticket.status, WAITING_CUSTOMER: h.waitingCustomer } } };
  const res = await load<Ticket>(`/api/portal/helpdesk/tickets/${id}`, href(lang, `/workspace/helpdesk/${id}`));
  if (res.error === "notFound") notFound();
  if (!res.data) return <Alert tone="danger">{t.account.apiDown}</Alert>;
  const tk = res.data;
  const messages = [
    { id: "first", author: "CUSTOMER" as const, author_name: tk.contact_name, message: tk.message, internal: false, created_at: tk.created_at },
    ...tk.replies,
  ];

  return (
    <div className="space-y-8">
      <div>
        <Link href={href(lang, "/workspace/helpdesk")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />
          {t.forms.back}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono font-medium">{tk.number}</span>
          <TicketStatusBadge status={tk.status} t={st} />
          <span className="text-muted-foreground">{h.category[tk.category]}</span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold">{tk.subject}</h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <ol className="space-y-4">
            {messages.map((m) => {
              const staff = m.author === "STAFF";
              return (
                <li key={m.id} className={cn("flex", staff ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-3xl px-5 py-4 sm:max-w-[75%]",
                      m.internal
                        ? "rounded-tr-md border border-dashed border-amber/60 bg-amber/5"
                        : staff
                          ? "rounded-tr-md bg-primary-soft"
                          : "rounded-tl-md border border-border bg-card",
                    )}
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold">{staff ? (m.author_name ?? ws.org!.name) : m.author_name}</span>
                      {m.internal && <Badge>{h.internalBadge}</Badge>}
                      <time className="text-muted-foreground">{formatDate(m.created_at, lang, true)}</time>
                    </div>
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{m.message}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">{fill(h.replyAs, { org: ws.org.name })}</p>
            <ReplyForm action={replyHelpdesk} fields={{ id: tk.id }} labels={{ placeholder: h.replyPlaceholder, send: h.send }}>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="internal" />
                {h.internal}
              </label>
            </ReplyForm>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-border bg-card p-5 text-sm">
          <div>
            <p className="mb-2 font-medium">{h.setStatus}</p>
            <StatusSelect id={tk.id} version={tk.version} status={tk.status} labels={{ title: h.setStatus, status: st.ticket.status }} />
          </div>
          <dl className="space-y-2 border-t border-border pt-4">
            <div>
              <dt className="text-xs text-muted-foreground">{h.customer}</dt>
              <dd className="font-medium">{tk.contact_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">E-mail</dt>
              <dd>
                <a href={`mailto:${tk.contact_email}`} className="break-all text-primary hover:underline">
                  {tk.contact_email}
                </a>
              </dd>
            </div>
            {tk.contact_phone && (
              <div>
                <dt className="text-xs text-muted-foreground">{h.phone}</dt>
                <dd>{tk.contact_phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">{t.ticket.created}</dt>
              <dd>{formatDate(tk.created_at, lang, true)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
