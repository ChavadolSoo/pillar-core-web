import Link from "next/link";
import { ArrowRight, Boxes, CloudOff, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { AppCard, MarketCard, NewsCard } from "@/components/cards";
import { HeroOrbit } from "@/components/hero-orbit";
import { button } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { getApps, getMarketItems, getNews } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PILLAR_STYLE = [
  { icon: KeyRound, tone: "bg-primary-soft text-primary" },
  { icon: Boxes, tone: "bg-violet-soft text-violet" },
  { icon: CloudOff, tone: "bg-teal-soft text-teal" },
  { icon: ShieldCheck, tone: "bg-amber/15 text-amber" },
];

export default async function HomePage() {
  const [{ lang, t }, apps, market, news] = await Promise.all([
    getDictionary(),
    getApps(),
    getMarketItems({ limit: 4, featured: true }),
    getNews({ limit: 3 }),
  ]);
  const [lead, ...rest] = news.items;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_40%,black,transparent)]" />
        <div className="pointer-events-none absolute -top-48 -right-40 size-[36rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-48 size-[28rem] rounded-full bg-violet/10 blur-3xl" />
        <Container className="relative grid items-center gap-12 pt-12 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-28">
          <div>
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-soft px-3.5 py-1.5 text-sm font-medium text-primary-soft-foreground">
              <Sparkles className="size-4" />
              {t.home.eyebrow}
            </p>
            <h1 className="animate-rise mt-6 text-5xl leading-[1.08] font-semibold [animation-delay:60ms] sm:text-6xl lg:text-7xl">
              {t.home.titleA}
              <br />
              <span className="text-brand">{t.home.titleB}</span>
            </h1>
            <p className="animate-rise mt-6 max-w-xl text-lg text-muted-foreground [animation-delay:120ms] sm:text-xl">{t.home.lead}</p>
            <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:180ms]">
              <Link href={`${href(lang, "/login")}?mode=register`} className={button({ variant: "brand", size: "lg" })}>
                {t.home.ctaStart}
                <ArrowRight />
              </Link>
              <Link href={href(lang, "/apps")} className={button({ variant: "outline", size: "lg" })}>
                {t.home.ctaApps}
              </Link>
            </div>
            <dl className="animate-rise mt-12 grid max-w-lg grid-cols-3 gap-4 [animation-delay:240ms]">
              {[
                { value: String(apps.length), label: t.home.stats.apps },
                { value: "1", label: t.home.stats.account },
                { value: "24/7", label: t.home.stats.offline },
              ].map((s) => (
                <div key={s.label} className="border-l-2 border-primary/40 pl-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-3xl font-semibold">{s.value}</dd>
                  <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-rise [animation-delay:150ms]">
            <HeroOrbit apps={apps} />
          </div>
        </Container>
      </section>

      {/* Pillars */}
      <section className="border-y border-border bg-card/60">
        <Container className="py-20">
          <SectionHeading title={t.home.pillarsTitle} lead={t.home.pillarsLead} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.pillars.map((p, i) => {
              const { icon: Icon, tone } = PILLAR_STYLE[i % PILLAR_STYLE.length];
              return (
                <div key={p.title} className="group rounded-3xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-soft">
                  <div className={cn("grid size-12 place-items-center rounded-2xl transition-transform group-hover:scale-110", tone)}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Apps */}
      <Container className="py-24">
        <SectionHeading
          title={t.home.appsTitle}
          lead={t.home.appsLead}
          action={
            <Link href={href(lang, "/apps")} className={button({ variant: "outline", size: "sm" })}>
              {t.home.viewAll} <ArrowRight />
            </Link>
          }
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.slice(0, 6).map((app) => (
            <AppCard key={app.code} app={app} lang={lang} t={t} />
          ))}
        </div>
      </Container>

      {/* Marketplace */}
      {market.items.length > 0 && (
        <section className="relative overflow-hidden bg-ink text-white">
          <div className="pointer-events-none absolute -top-32 left-1/4 size-[30rem] rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 size-[24rem] rounded-full bg-violet/25 blur-3xl" />
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [--foreground:#fff]" />
          <Container className="relative py-24">
            <SectionHeading
              eyebrow="Marketplace"
              title={t.home.marketTitle}
              lead={t.home.marketLead}
              className="[&_p]:text-white/70"
              action={
                <Link href={href(lang, "/marketplace")} className={button({ variant: "brand", size: "sm" })}>
                  {t.home.viewAll} <ArrowRight />
                </Link>
              }
            />
            <div className="dark mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {market.items.map((item) => (
                <MarketCard key={item.id} item={item} lang={lang} t={t} className="text-foreground" />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* News */}
      {lead && (
        <Container className="py-24">
          <SectionHeading
            title={t.home.newsTitle}
            lead={t.home.newsLead}
            action={
              <Link href={href(lang, "/news")} className={button({ variant: "outline", size: "sm" })}>
                {t.home.viewAll} <ArrowRight />
              </Link>
            }
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <NewsCard item={lead} lang={lang} t={t} large />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {rest.map((item) => (
                <NewsCard key={item.id} item={item} lang={lang} t={t} className="lg:flex-row [&>div:first-child]:lg:aspect-auto [&>div:first-child]:lg:w-2/5" />
              ))}
            </div>
          </div>
        </Container>
      )}

      {/* CTA */}
      <Container className={cn(!lead && "pt-24")}>
        <div className="bg-brand relative overflow-hidden rounded-[2rem] px-6 py-16 text-center text-white sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-20 [--foreground:#fff]" />
          <div className="relative">
            <h2 className="text-3xl font-semibold sm:text-5xl">{t.home.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85 sm:text-lg">{t.home.ctaLead}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={`${href(lang, "/login")}?mode=register`}
                className={button({ variant: "secondary", size: "lg", className: "bg-white text-[#1a0d06] hover:bg-white/90" })}
              >
                {t.home.ctaStart}
                <ArrowRight />
              </Link>
              <Link href={href(lang, "/support")} className={button({ size: "lg", className: "border border-white/40 bg-white/10 text-white hover:bg-white/20" })}>
                {t.nav.support}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
