import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Clock, Mail, SearchCheck } from "lucide-react";
import { SupportForm } from "@/components/support-form";
import { Card, Container, PageHeader } from "@/components/ui/primitives";
import { getApps } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import { getViewer } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.support.title, description: t.support.lead };
}

export default async function SupportPage(props: PageProps<"/[lang]/support">) {
  const sp = await props.searchParams;
  const [{ lang, t }, apps, viewer] = await Promise.all([getDictionary(), getApps(), getViewer()]);
  const options = apps.filter((a) => a.status === "AVAILABLE").map((a) => ({ code: a.code, name: a.name, color: a.color }));
  const defaultApp = typeof sp.app === "string" && options.some((o) => o.code === sp.app) ? sp.app : undefined;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@pillarcore.app";

  return (
    <>
      <PageHeader title={t.support.title} lead={t.support.lead} />
      <Container className="grid gap-8 py-14 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6 shadow-soft sm:p-10">
          <h2 className="mb-8 text-2xl font-semibold">{t.support.formTitle}</h2>
          <SupportForm
            apps={options}
            lang={lang}
            t={{ support: t.support, common: t.common, account: t.account }}
            viewer={viewer ? { name: viewer.name, email: viewer.email } : null}
            defaultApp={defaultApp}
          />
        </Card>
        <aside className="space-y-4">
          <Link
            href={viewer ? href(lang, "/account/tickets") : href(lang, "/support/track")}
            className="group flex items-start gap-4 rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-soft"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-soft text-teal">
              <SearchCheck className="size-5" />
            </span>
            <span>
              <span className="block font-semibold group-hover:text-primary">{viewer ? t.account.tickets : t.support.trackTitle}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{t.support.trackLead}</span>
            </span>
          </Link>
          <Card className="space-y-5 p-6">
            <h3 className="font-semibold">{t.support.channels}</h3>
            <div className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t.support.channelEmail}</p>
                <a href={`mailto:${contactEmail}`} className="font-medium hover:text-primary">
                  {contactEmail}
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-violet" />
              <div>
                <p className="text-sm text-muted-foreground">{t.support.channelHours}</p>
                <p className="font-medium">{t.support.hours}</p>
              </div>
            </div>
          </Card>
        </aside>
      </Container>
      <Container className="max-w-3xl">
        <h2 className="mb-6 text-center text-3xl font-semibold">{t.support.faqTitle}</h2>
        <div className="space-y-3">
          {t.support.faq.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card px-6 py-4 open:shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}
