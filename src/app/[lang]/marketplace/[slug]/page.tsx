import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { buyItem } from "@/actions/marketplace";
import { ActionButton } from "@/components/action-button";
import { AppLogo, Media, PriceTag } from "@/components/cards";
import { Markdown } from "@/components/markdown";
import { button } from "@/components/ui/button";
import { Badge, Container } from "@/components/ui/primitives";
import { userApi } from "@/lib/api";
import { getApp, getMarketItem } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { fill, href, tx } from "@/lib/i18n";
import { getViewer } from "@/lib/session";
import type { Entitlement } from "@/lib/types";

export async function generateMetadata(props: PageProps<"/[lang]/marketplace/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [{ lang }, item] = await Promise.all([getDictionary(), getMarketItem(slug)]);
  if (!item) return {};
  return { title: tx(item.name, lang), description: tx(item.summary, lang), openGraph: item.cover_url ? { images: [item.cover_url] } : undefined };
}

export default async function MarketItemPage(props: PageProps<"/[lang]/marketplace/[slug]">) {
  const { slug } = await props.params;
  const [{ lang, t }, item, viewer] = await Promise.all([getDictionary(), getMarketItem(slug), getViewer()]);
  if (!item) notFound();
  const [app, owned] = await Promise.all([
    getApp(item.app_code),
    viewer
      ? userApi<Entitlement[]>("GET", "/api/portal/marketplace/entitlements")
          .then((list) => list.some((e) => e.item.id === item.id && e.status !== "REVOKED"))
          .catch(() => false)
      : false,
  ]);
  const self = href(lang, `/marketplace/${item.slug}`);
  const images = [item.cover_url, ...item.gallery].filter((x): x is string => !!x);

  return (
    <Container className="py-10">
      <Link href={href(lang, "/marketplace")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t.market.back}
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 space-y-4">
          {images.length > 0 ? (
            <>
              <Media src={images[0]} alt="" className="aspect-[4/3] w-full rounded-[2rem] border border-border object-cover" />
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {images.slice(1).map((src) => (
                    <Media key={src} src={src} className="aspect-square w-full rounded-2xl border border-border object-cover" />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              className="grid aspect-[4/3] place-items-center rounded-[2rem]"
              style={{ background: `linear-gradient(150deg, color-mix(in oklab, ${item.app_color} 35%, var(--card)), var(--muted))` }}
            >
              <ShoppingBag className="size-16" style={{ color: item.app_color }} />
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{t.market.types[item.type]}</Badge>
            {item.tags.map((tag) => (
              <Badge key={tag}>#{tag}</Badge>
            ))}
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">{tx(item.name, lang)}</h1>
          {item.summary && <p className="mt-3 text-lg text-muted-foreground">{tx(item.summary, lang)}</p>}
          {app && (
            <Link href={href(lang, `/apps/${app.code}`)} className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-border bg-card py-2 pr-4 pl-2 hover:border-primary/50">
              <AppLogo app={app} size={36} />
              <span className="text-sm font-medium">{app.name}</span>
            </Link>
          )}

          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <PriceTag item={item} t={t} className="text-4xl" />
            <div className="mt-6">
              {owned ? (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 font-medium text-success">
                    <CheckCircle2 className="size-5" /> {t.market.owned}
                  </p>
                  <Link href={href(lang, "/account/purchases")} className={button({ variant: "outline", size: "lg", className: "w-full" })}>
                    {t.market.openInApp}
                  </Link>
                </div>
              ) : viewer ? (
                <ActionButton action={buyItem} fields={{ item_id: item.id, lang, back: self }}>
                  {item.price_minor === 0 ? t.market.getFree : t.market.buy}
                </ActionButton>
              ) : (
                <Link href={`${href(lang, "/login")}?callbackUrl=${encodeURIComponent(self)}`} className={button({ variant: "brand", size: "lg", className: "w-full" })}>
                  {t.market.signInToBuy}
                </Link>
              )}
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
                {fill(t.market.deliveredTo, { app: item.app_name })}
              </li>
              {item.price_minor > 0 && (
                <li className="flex gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" />
                  {t.market.secure}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {item.description && (
        <div className="mt-16 max-w-3xl">
          <Markdown>{tx(item.description, lang)}</Markdown>
        </div>
      )}
    </Container>
  );
}
