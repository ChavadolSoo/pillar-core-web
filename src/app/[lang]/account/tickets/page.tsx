import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LifeBuoy, Plus } from "lucide-react";
import { TicketStatusBadge } from "@/components/ticket-thread";
import { button } from "@/components/ui/button";
import { Alert, EmptyState } from "@/components/ui/primitives";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate, href } from "@/lib/i18n";
import type { Paginated, TicketSummary } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.account.tickets, robots: { index: false } };
}

export default async function TicketsPage() {
  const { lang, t } = await getDictionary();
  const res = await load<Paginated<TicketSummary>>("/api/portal/support/tickets?limit=50", href(lang, "/account/tickets"));
  const newTicket = (
    <Link href={href(lang, "/support")} className={button({ variant: "brand", size: "sm" })}>
      <Plus /> {t.account.newTicket}
    </Link>
  );
  if (res.error) return <Alert tone="danger">{t.account.apiDown}</Alert>;
  if (!res.data.items.length) return <EmptyState icon={<LifeBuoy />} title={t.account.noTickets} action={newTicket} />;
  return (
    <div className="space-y-4">
      <div className="flex justify-end">{newTicket}</div>
      <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {res.data.items.map((tk) => (
          <li key={tk.id}>
            <Link href={href(lang, `/account/tickets/${tk.id}`)} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-mono text-muted-foreground">{tk.number}</span>
                  <TicketStatusBadge status={tk.status} t={t} />
                  <span className="text-xs text-muted-foreground">{tk.app_name ?? t.support.other}</span>
                </div>
                <p className="mt-1 truncate font-medium">{tk.subject}</p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block">{formatDate(tk.last_reply_at ?? tk.updated_at, lang)}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
