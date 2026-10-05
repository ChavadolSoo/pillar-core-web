import type { Metadata } from "next";
import { SearchCheck } from "lucide-react";
import { guestReply } from "@/actions/support";
import { ReplyForm } from "@/components/reply-form";
import { TicketThread } from "@/components/ticket-thread";
import { button } from "@/components/ui/button";
import { Alert, Card, Container, Field, inputClass } from "@/components/ui/primitives";
import { ApiError, publicSend } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import type { Ticket } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.support.trackTitle, robots: { index: false } };
}

/** Guests follow a ticket with its number + tracking code (from the link they got). */
export default async function TrackPage(props: PageProps<"/[lang]/support/track">) {
  const sp = await props.searchParams;
  const { lang, t } = await getDictionary();
  const number = typeof sp.number === "string" ? sp.number.trim().toUpperCase() : "";
  const token = typeof sp.token === "string" ? sp.token.trim() : "";

  let ticket: Ticket | null = null;
  let failed: "notFound" | "down" | null = null;
  if (number && token) {
    try {
      ticket = await publicSend<Ticket>("GET", `/support/tickets/${encodeURIComponent(number)}?token=${encodeURIComponent(token)}`);
    } catch (e) {
      failed = e instanceof ApiError && e.status < 500 ? "notFound" : "down";
    }
  }

  if (ticket) {
    const closed = ticket.status === "CLOSED";
    return (
      <Container className="max-w-3xl space-y-8 py-12">
        <TicketThread ticket={ticket} lang={lang} t={t} />
        {closed ? (
          <Alert>{t.ticket.closed}</Alert>
        ) : (
          <ReplyForm action={guestReply} fields={{ number, token }} labels={{ placeholder: t.ticket.replyPlaceholder, send: t.ticket.send }} />
        )}
      </Container>
    );
  }

  return (
    <Container className="max-w-xl py-16">
      <Card className="p-8 shadow-soft">
        <div className="grid size-12 place-items-center rounded-2xl bg-teal-soft text-teal">
          <SearchCheck className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">{t.support.trackTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.support.trackLead}</p>
        {failed && (
          <div className="mt-6">
            <Alert tone="danger">{failed === "notFound" ? t.support.notFound : t.account.apiDown}</Alert>
          </div>
        )}
        <form action={href(lang, "/support/track")} className="mt-6 space-y-4">
          <Field label={t.support.number} htmlFor="number">
            <input id="number" name="number" required defaultValue={number} placeholder="PC-000123" className={`${inputClass} font-mono`} />
          </Field>
          <Field label={t.support.token} htmlFor="token">
            <input id="token" name="token" required defaultValue={token} className={`${inputClass} font-mono`} />
          </Field>
          <button type="submit" className={button({ variant: "brand", className: "w-full" })}>
            {t.support.track}
          </button>
        </form>
      </Card>
    </Container>
  );
}
