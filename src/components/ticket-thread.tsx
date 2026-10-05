import { Badge } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";
import { formatDate, type Locale } from "@/lib/i18n";
import type { Ticket, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<TicketStatus, "primary" | "teal" | "violet" | "success" | "neutral"> = {
  OPEN: "primary",
  IN_PROGRESS: "teal",
  WAITING_CUSTOMER: "violet",
  RESOLVED: "success",
  CLOSED: "neutral",
};

export function TicketStatusBadge({ status, t }: { status: TicketStatus; t: Dictionary }) {
  return <Badge tone={STATUS_TONE[status]}>{t.ticket.status[status]}</Badge>;
}

/** Header + conversation of a ticket (internal staff notes never reach this page). */
export function TicketThread({ ticket, lang, t }: { ticket: Ticket; lang: Locale; t: Dictionary }) {
  const messages = [
    { id: "first", author: "CUSTOMER" as const, author_name: ticket.contact_name, message: ticket.message, created_at: ticket.created_at },
    ...ticket.replies.filter((r) => !r.internal),
  ];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="font-mono font-medium text-foreground">{ticket.number}</span>
        <TicketStatusBadge status={ticket.status} t={t} />
      </div>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{ticket.subject}</h1>
      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">{t.ticket.app}:</dt>
          <dd>{ticket.app_name ?? t.support.other}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">{t.ticket.category}:</dt>
          <dd>{t.support.categories[ticket.category]}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted-foreground">{t.ticket.created}:</dt>
          <dd>{formatDate(ticket.created_at, lang, true)}</dd>
        </div>
      </dl>

      <ol className="mt-8 space-y-4">
        {messages.map((m) => {
          const staff = m.author === "STAFF";
          return (
            <li key={m.id} className={cn("flex", staff ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-3xl px-5 py-4 sm:max-w-[75%]",
                  staff ? "rounded-tl-md border border-border bg-card" : "rounded-tr-md bg-primary-soft",
                )}
              >
                <div className="mb-1.5 flex items-center gap-2 text-xs">
                  <span className={cn("font-semibold", staff ? "text-primary" : "text-primary-soft-foreground")}>
                    {staff ? (m.author_name ?? t.ticket.staff) : t.ticket.you}
                  </span>
                  <time className="text-muted-foreground">{formatDate(m.created_at, lang, true)}</time>
                </div>
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{m.message}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
