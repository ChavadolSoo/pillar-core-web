import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ServiceIcon } from "@/components/services/service-icon";
import { button } from "@/components/ui/button";
import { Badge, Card, Container, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getServices } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href, tx } from "@/lib/i18n";
import { getViewer } from "@/lib/session";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.services.title, description: t.services.lead };
}

export default async function ServicesPage() {
  const [{ lang, t }, services, viewer] = await Promise.all([getDictionary(), getServices(), getViewer()]);
  const s = t.services;
  const groups = [
    { title: s.available, items: services.filter((x) => x.status === "AVAILABLE") },
    { title: s.comingSoon, items: services.filter((x) => x.status === "COMING_SOON") },
  ].filter((g) => g.items.length);
  const start = viewer ? href(lang, "/workspace") : `${href(lang, "/login")}?mode=register&callbackUrl=${encodeURIComponent(href(lang, "/workspace"))}`;

  return (
    <>
      <PageHeader title={s.title} lead={s.lead}>
        <div className="animate-rise mt-8 flex flex-wrap items-center gap-3 [animation-delay:160ms]">
          <Link href={start} className={button({ variant: "brand", size: "lg" })}>
            {viewer ? s.open : s.start}
            <ArrowRight />
          </Link>
          <Badge tone="primary" className="px-3 py-1 text-sm">
            <Sparkles className="size-3.5" />
            {s.free}
          </Badge>
        </div>
      </PageHeader>
      <Container className="py-16">
        {!services.length && <EmptyState title={s.empty} />}
        {groups.map((g, gi) => (
          <section key={g.title} className={cn(gi > 0 && "mt-16")}>
            <h2 className="mb-6 text-2xl font-semibold">{g.title}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((svc) => (
                <Card key={svc.code} className={cn("flex flex-col p-6", svc.status === "COMING_SOON" && "opacity-80")}>
                  <div className="flex items-start justify-between gap-3">
                    <ServiceIcon icon={svc.icon} color={svc.color} />
                    {svc.status === "COMING_SOON" && <Badge tone="violet">{s.comingSoon}</Badge>}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{tx(svc.tagline, lang) || svc.name}</h3>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{svc.name}</p>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{tx(svc.description, lang)}</p>
                  {svc.status === "AVAILABLE" && (
                    <Link href={start} className={button({ variant: "outline", size: "sm", className: "mt-5 self-start" })}>
                      {viewer ? s.open : s.start}
                      <ArrowRight />
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))}
        <p className="mt-16 text-center text-sm text-muted-foreground">
          <Link href={href(lang, "/apps")} className="underline-offset-4 hover:text-primary hover:underline">
            {s.appsNote}
          </Link>
        </p>
      </Container>
    </>
  );
}
