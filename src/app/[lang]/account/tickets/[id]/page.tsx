import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { closeTicket, replyTicket } from "@/actions/support";
import { ActionButton } from "@/components/action-button";
import { ReplyForm } from "@/components/reply-form";
import { TicketThread } from "@/components/ticket-thread";
import { Alert } from "@/components/ui/primitives";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import type { Ticket } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.account.tickets, robots: { index: false } };
}

export default async function TicketPage(props: PageProps<"/[lang]/account/tickets/[id]">) {
  const { id } = await props.params;
  const { lang, t } = await getDictionary();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const res = await load<Ticket>(`/api/portal/support/tickets/${id}`, href(lang, `/account/tickets/${id}`));
  if (res.error === "notFound") notFound();
  if (res.error) return <Alert tone="danger">{t.account.apiDown}</Alert>;
  const ticket = res.data;
  const closed = ticket.status === "CLOSED";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href={href(lang, "/account/tickets")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t.account.tickets}
      </Link>
      <TicketThread ticket={ticket} lang={lang} t={t} />
      {closed ? (
        <Alert>{t.ticket.closed}</Alert>
      ) : (
        <>
          <ReplyForm action={replyTicket} fields={{ id: ticket.id }} labels={{ placeholder: t.ticket.replyPlaceholder, send: t.ticket.send }} />
          <ActionButton action={closeTicket} fields={{ id: ticket.id }} variant="ghost" size="sm" className="flex justify-end [&_button]:w-auto">
            {t.ticket.close}
          </ActionButton>
        </>
      )}
    </div>
  );
}
