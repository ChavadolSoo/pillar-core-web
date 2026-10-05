import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Globe, Monitor, Smartphone } from "lucide-react";
import { AppLogo, MarketCard, Media, NewsCard } from "@/components/cards";
import { Markdown } from "@/components/markdown";
import { button } from "@/components/ui/button";
import { Badge, Container } from "@/components/ui/primitives";
import { getApp, getMarketItems, getNews } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href, tx } from "@/lib/i18n";
import type { Platform } from "@/lib/types";

const PLATFORM: Record<Platform, { label: string; icon: typeof Globe }> = {
  web: { label: "Web", icon: Globe },
  android: { label: "Android", icon: Smartphone },
  ios: { label: "iOS", icon: Smartphone },
  windows: { label: "Windows", icon: Monitor },
  macos: { label: "macOS", icon: Monitor },
};

export async function generateMetadata(props: PageProps<"/[lang]/apps/[code]">): Promise<Metadata> {
  const { code } = await props.params;
  const [{ lang }, app] = await Promise.all([getDictionary(), getApp(code)]);
  if (!app) return {};
  return {
    title: app.name,
    description: tx(app.tagline, lang) || tx(app.description, lang),
    openGraph: app.cover_url ? { images: [app.cover_url] } : undefined,
  };
}

export default async function AppPage(props: PageProps<"/[lang]/apps/[code]">) {
  const { code } = await props.params;
  const [{ lang, t }, app] = await Promise.all([getDictionary(), getApp(code)]);
  if (!app) notFound();
  const [news, market] = await Promise.all([getNews({ app: app.code, limit: 3 }), getMarketItems({ app: app.code, limit: 4 })]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: `radial-gradient(60% 80% at 85% 0%, color-mix(in oklab, ${app.color} 35%, transparent), transparent 70%)` }}
        />
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Container className="relative grid gap-12 py-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-20">
          <div>
            <Link href={href(lang, "/apps")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> {t.apps.back}
            </Link>
            <div className="mt-8 flex items-center gap-5">
              <AppLogo app={app} size={88} />
              <div>
                <h1 className="text-4xl font-semibold sm:text-5xl">{app.name}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={app.status === "AVAILABLE" ? "success" : "violet"}>
                    {app.status === "AVAILABLE" ? t.apps.available : t.apps.comingSoon}
                  </Badge>
                  <Badge>{app.category}</Badge>
                </div>
              </div>
            </div>
            {app.tagline && (
              <p className="mt-8 font-display text-2xl font-medium" style={{ color: app.color }}>
                {tx(app.tagline, lang)}
              </p>
            )}
            <p className="mt-4 text-lg text-muted-foreground">{tx(app.description, lang)}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {app.website_url && (
                <a href={app.website_url} target="_blank" rel="noopener noreferrer" className={button({ variant: "brand" })}>
                  {t.apps.visit} <ExternalLink />
                </a>
              )}
              {app.platforms.map((p) => {
                const { label, icon: Icon } = PLATFORM[p] ?? PLATFORM.web;
                return (
                  <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                    <Icon className="size-4 text-muted-foreground" /> {label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="relative">
            {app.cover_url ? (
              <Media src={app.cover_url} alt={app.name} className="aspect-[16/10] w-full rounded-[2rem] object-cover shadow-lift" />
            ) : (
              <div
                className="grid aspect-[16/10] place-items-center rounded-[2rem] shadow-lift"
                style={{ background: `linear-gradient(140deg, ${app.color}, color-mix(in oklab, ${app.color} 40%, #0b0b10))` }}
              >
                <span className="font-display text-7xl font-bold text-white/90">{app.name}</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      <Container className="grid gap-16 py-16 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          {app.body && <Markdown className="text-[1.05rem]">{tx(app.body, lang)}</Markdown>}
          {app.gallery.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-6 text-2xl font-semibold">{t.apps.gallery}</h2>
              <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4">
                {app.gallery.map((src) => (
                  <Media key={src} src={src} className="h-80 w-auto shrink-0 snap-start rounded-3xl border border-border object-cover shadow-soft" />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">{t.apps.category}</dt>
                <dd className="mt-1 font-medium">{app.category}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t.apps.platforms}</dt>
                <dd className="mt-1 font-medium">{app.platforms.map((p) => PLATFORM[p]?.label ?? p).join(", ") || "—"}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </Container>

      {market.items.length > 0 && (
        <Container className="pb-8">
          <h2 className="mb-8 text-2xl font-semibold">
            {app.name} {t.apps.marketplace}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {market.items.map((item) => (
              <MarketCard key={item.id} item={item} lang={lang} t={t} />
            ))}
          </div>
        </Container>
      )}

      {news.items.length > 0 && (
        <Container className="pt-16">
          <h2 className="mb-8 text-2xl font-semibold">{t.apps.related}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {news.items.map((item) => (
              <NewsCard key={item.id} item={item} lang={lang} t={t} />
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
