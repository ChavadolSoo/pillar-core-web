import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ExternalLink, Inbox } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { TicketStatusBadge } from "@/components/ticket-thread";
import { button } from "@/components/ui/button";
import { Alert, Card, EmptyState } from "@/components/ui/primitives";
import { CopyField } from "@/components/workspace/copy-field";
import { ServiceOff } from "@/components/workspace/service-off";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { fill, formatDate, href } from "@/lib/i18n";
import type { Paginated, TicketStatus, TicketSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getWorkspace, isOn } from "@/lib/workspace";

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"];
const LIMIT = 20;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.helpdesk.title, robots: { index: false } };
}

/** The organization's helpdesk inbox. */
export default async function HelpdeskPage(props: PageProps<"/[lang]/workspace/helpdesk">) {
  const sp = await props.searchParams;
  const [{ lang, t }, ws] = await Promise.all([getDictionary(), getWorkspace()]);
  if (!ws.org) return null;
  if (!isOn(ws, "helpdesk")) return <ServiceOff t={t} lang={lang} />;
  const h = t.helpdesk;
  // the customer's "waiting for you" is "waiting for the customer" here
  const st = { ...t, ticket: { ...t.ticket, status: { ...t.ticket.status, WAITING_CUSTOMER: h.waitingCustomer } } };
  const status = STATUSES.find((s) => s === sp.status);
  const page = Math.max(1, Number(sp.page) || 1);
  const base = href(lang, "/workspace/helpdesk");
  const query = new URLSearchParams({ page: String(page), limit: String(LIMIT), ...(status && { status }) });
  const [tickets, stats] = await Promise.all([
    load<Paginated<TicketSummary>>(`/api/portal/helpdesk/tickets?${query}`, base),
    load<{ by_status: Record<TicketStatus, number> }>("/api/portal/helpdesk/stats", base),
  ]);
  const contact = href(lang, `/o/${ws.org.code}`);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">{h.title}</h2>
        <p className="mt-1 text-muted-foreground">{h.lead}</p>
      </div>

      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">{h.pageTitle}</h3>
          <Link href={contact} target="_blank" className={button({ variant: "outline", size: "sm" })}>
            <ExternalLink />
            {h.pageOpen}
          </Link>
        </div>
        <CopyField path={contact} label={t.workspace.copy} />
        <p className="text-xs text-muted-foreground">{h.pageHint}</p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {[undefined, ...STATUSES].map((s) => {
          const count = s ? stats.data?.by_status[s] : undefined;
          return (
            <Link
              key={s ?? "all"}
              href={s ? `${base}?status=${s}` : base}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                status === s ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:border-primary/40",
              )}
            >
              {s ? st.ticket.status[s] : h.all}
              {count ? <span className="ml-1.5 text-xs text-muted-foreground">{count}</span> : null}
            </Link>
          );
        })}
      </div>

      {tickets.error && <Alert tone="danger">{t.account.apiDown}</Alert>}
      {tickets.data && !tickets.data.items.length && <EmptyState icon={<Inbox />} title={h.empty} />}
      {tickets.data && tickets.data.items.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {tickets.data.items.map((tk) => (
            <li key={tk.id}>
              <Link href={href(lang, `/workspace/helpdesk/${tk.id}`)} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono text-muted-foreground">{tk.number}</span>
                    <TicketStatusBadge status={tk.status} t={st} />
                    <span className="text-xs text-muted-foreground">{h.category[tk.category]}</span>
                  </div>
                  <p className="mt-1 truncate font-medium">{tk.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {h.from} {tk.contact_name} · {tk.contact_email}
                  </p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">{formatDate(tk.last_reply_at ?? tk.updated_at, lang)}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {tickets.data && (
        <Pagination
          page={page}
          total={tickets.data.total}
          limit={LIMIT}
          basePath={base}
          params={status ? { status } : {}}
          labels={{ prev: t.news.prev, next: t.news.next, page: fill(t.common.page, { page, pages: Math.max(1, Math.ceil(tickets.data.total / LIMIT)) }) }}
        />
      )}
    </div>
  );
}
