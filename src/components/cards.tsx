import Link from "next/link";
import { ArrowUpRight, Pin, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";
import { formatDate, formatPrice, href, tx, type Locale } from "@/lib/i18n";
import type { MarketItem, NewsSummary, NewsType, SiteApp } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Media paths from plc-portal are served through the /api/portal/public/media rewrite. */
export function Media({ src, alt = "", className, style }: { src: string; alt?: string; className?: string; style?: React.CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} style={style} />;
}

/** App logo, or a tile in the app's colour with its initial. */
export function AppLogo({ app, size = 56, className }: { app: Pick<SiteApp, "name" | "color" | "logo_url">; size?: number; className?: string }) {
  const style = { width: size, height: size, borderRadius: size * 0.28 };
  if (app.logo_url) {
    return <Media src={app.logo_url} alt={app.name} style={style} className={cn("shrink-0 bg-card object-cover shadow-soft", className)} />;
  }
  return (
    <span
      style={{ ...style, background: `linear-gradient(140deg, ${app.color}, color-mix(in oklab, ${app.color} 55%, #000))` }}
      className={cn("grid shrink-0 place-items-center font-display font-semibold text-white shadow-soft", className)}
    >
      <span style={{ fontSize: size * 0.44 }}>{app.name.charAt(0)}</span>
    </span>
  );
}

export function AppCard({ app, lang, t, className }: { app: SiteApp; lang: Locale; t: Dictionary; className?: string }) {
  return (
    <Link
      href={href(lang, `/apps/${app.code}`)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lift",
        className,
      )}
      style={{ "--app": app.color } as React.CSSProperties}
    >
      <div className="relative h-40 overflow-hidden">
        {app.cover_url ? (
          <Media src={app.cover_url} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div
            className="size-full"
            style={{
              background: `radial-gradient(120% 120% at 0% 0%, color-mix(in oklab, ${app.color} 70%, transparent), transparent 60%), radial-gradient(90% 120% at 100% 100%, color-mix(in oklab, ${app.color} 35%, var(--primary)), transparent 70%), var(--muted)`,
            }}
          >
            <div className="bg-grid size-full opacity-50" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {app.status === "COMING_SOON" ? (
            <Badge tone="violet" className="bg-card/90 backdrop-blur">{t.apps.comingSoon}</Badge>
          ) : (
            app.featured && <Badge tone="primary" className="bg-card/90 backdrop-blur">{t.apps.featured}</Badge>
          )}
        </div>
      </div>
      <div className="relative flex flex-1 flex-col px-6 pb-6">
        <AppLogo app={app} size={64} className="-mt-8 ring-4 ring-card" />
        <div className="mt-4 flex items-center justify-between gap-2">
          <h3 className="text-xl font-semibold">{app.name}</h3>
          <ArrowUpRight className="size-5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </div>
        {app.tagline && <p className="mt-1 text-sm font-medium" style={{ color: app.color }}>{tx(app.tagline, lang)}</p>}
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{tx(app.description, lang)}</p>
      </div>
    </Link>
  );
}

const NEWS_TONE: Record<NewsType, "primary" | "teal" | "violet" | "amber"> = {
  NEWS: "teal",
  FEATURE: "violet",
  NEW_APP: "primary",
  ANNOUNCEMENT: "amber",
};

export function NewsTypeBadge({ type, t }: { type: NewsType; t: Dictionary }) {
  return <Badge tone={NEWS_TONE[type]}>{t.news.types[type]}</Badge>;
}

export function NewsCard({
  item,
  lang,
  t,
  large,
  className,
}: {
  item: NewsSummary;
  lang: Locale;
  t: Dictionary;
  large?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href(lang, `/news/${item.slug}`)}
      className={cn("group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:shadow-lift", className)}
    >
      <div className={cn("relative overflow-hidden bg-muted", large ? "aspect-[16/9]" : "aspect-[16/10]")}>
        {item.cover_url ? (
          <Media src={item.cover_url} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="bg-brand relative size-full opacity-90">
            <div className="bg-grid absolute inset-0 opacity-30 mix-blend-overlay" />
            <span className="absolute bottom-4 left-5 font-display text-5xl font-bold text-white/25">{t.news.types[item.type]}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <NewsTypeBadge type={item.type} t={t} />
          {item.pinned && (
            <Badge tone="neutral">
              <Pin className="size-3" />
              {t.news.pinned}
            </Badge>
          )}
          <time dateTime={item.published_at ?? undefined}>{formatDate(item.published_at, lang)}</time>
        </div>
        <h3 className={cn("mt-3 font-semibold group-hover:text-primary", large ? "text-2xl" : "text-lg")}>{tx(item.title, lang)}</h3>
        {item.summary && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{tx(item.summary, lang)}</p>}
        <span className="mt-auto pt-4 text-sm font-medium text-primary">{t.news.readMore} →</span>
      </div>
    </Link>
  );
}

export function PriceTag({ item, t, className }: { item: Pick<MarketItem, "price_minor" | "currency">; t: Dictionary; className?: string }) {
  return (
    <span className={cn("font-display font-semibold", className)}>
      {item.price_minor === 0 ? <span className="text-success">{t.market.free}</span> : formatPrice(item.price_minor, item.currency)}
    </span>
  );
}

export function MarketCard({ item, lang, t, className }: { item: MarketItem; lang: Locale; t: Dictionary; className?: string }) {
  return (
    <Link
      href={href(lang, `/marketplace/${item.slug}`)}
      className={cn("group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift", className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.cover_url ? (
          <Media src={item.cover_url} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div
            className="grid size-full place-items-center"
            style={{ background: `linear-gradient(150deg, color-mix(in oklab, ${item.app_color} 30%, var(--card)), color-mix(in oklab, ${item.app_color} 8%, var(--muted)))` }}
          >
            <ShoppingBag className="size-10" style={{ color: item.app_color }} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium backdrop-blur" style={{ color: item.app_color }}>
            {item.app_name}
          </span>
          {item.owned && <Badge tone="success" className="bg-card/90 backdrop-blur">{t.market.owned}</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-muted-foreground">{t.market.types[item.type]}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold group-hover:text-primary">{tx(item.name, lang)}</h3>
        {item.summary && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{tx(item.summary, lang)}</p>}
        <div className="mt-auto flex items-center justify-between pt-4">
          <PriceTag item={item} t={t} className="text-lg" />
          {item.tags.length > 0 && <span className="truncate pl-2 text-xs text-muted-foreground">#{item.tags[0]}</span>}
        </div>
      </div>
    </Link>
  );
}
