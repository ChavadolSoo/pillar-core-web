import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, MessageSquareOff } from "lucide-react";
import { SupportForm } from "@/components/support-form";
import { Card, Container, EmptyState } from "@/components/ui/primitives";
import { getOrg } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { fill } from "@/lib/i18n";
import { getViewer } from "@/lib/session";

export async function generateMetadata(props: PageProps<"/[lang]/o/[org]">): Promise<Metadata> {
  const [{ org: code }, { t }] = await Promise.all([props.params, getDictionary()]);
  const org = await getOrg(code);
  return org ? { title: fill(t.helpdesk.contactTitle, { org: org.name }), description: t.helpdesk.contactLead } : {};
}

/** An organization's contact page: questions go to its helpdesk. */
export default async function OrgPage(props: PageProps<"/[lang]/o/[org]">) {
  const { org: code } = await props.params;
  if (!/^[a-z0-9][a-z0-9-]{1,39}$/.test(code)) notFound();
  const [{ lang, t }, org, viewer] = await Promise.all([getDictionary(), getOrg(code), getViewer()]);
  if (!org) notFound();
  const h = t.helpdesk;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-primary/15 blur-3xl" />
        <Container className="relative flex items-center gap-4 py-12">
          <span className="bg-brand grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-soft [&_svg]:size-6">
            <Building2 />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold sm:text-3xl">{fill(h.contactTitle, { org: org.name })}</h1>
            <p className="mt-1 text-muted-foreground">{h.contactLead}</p>
          </div>
        </Container>
      </section>
      <Container className="max-w-3xl py-12">
        {org.services.includes("helpdesk") ? (
          <Card className="p-6 shadow-soft sm:p-10">
            <SupportForm
              apps={[]}
              lang={lang}
              t={{ support: { ...t.support, categories: h.category }, common: t.common, account: t.account }}
              viewer={viewer ? { name: viewer.name, email: viewer.email } : null}
              org={{ code: org.code }}
            />
          </Card>
        ) : (
          <EmptyState icon={<MessageSquareOff />} title={h.noHelpdesk} />
        )}
      </Container>
    </>
  );
}
