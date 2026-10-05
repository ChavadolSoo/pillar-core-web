import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppLogo, Media, NewsCard, NewsTypeBadge } from "@/components/cards";
import { Markdown } from "@/components/markdown";
import { Container } from "@/components/ui/primitives";
import { getApp, getNews, getNewsItem } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate, href, tx } from "@/lib/i18n";

export async function generateMetadata(props: PageProps<"/[lang]/news/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [{ lang }, item] = await Promise.all([getDictionary(), getNewsItem(slug)]);
  if (!item) return {};
  return {
    title: tx(item.title, lang),
    description: tx(item.summary, lang),
    openGraph: { type: "article", publishedTime: item.published_at ?? undefined, images: item.cover_url ? [item.cover_url] : undefined },
  };
}

export default async function NewsItemPage(props: PageProps<"/[lang]/news/[slug]">) {
  const { slug } = await props.params;
  const [{ lang, t }, item] = await Promise.all([getDictionary(), getNewsItem(slug)]);
  if (!item) notFound();
  const [app, more] = await Promise.all([item.app_code ? getApp(item.app_code) : null, getNews({ limit: 4 })]);
  const others = more.items.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <article>
      <Container className="max-w-4xl py-12">
        <Link href={href(lang, "/news")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {t.news.back}
        </Link>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <NewsTypeBadge type={item.type} t={t} />
          <time dateTime={item.published_at ?? undefined}>{formatDate(item.published_at, lang)}</time>
        </div>
        <h1 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">{tx(item.title, lang)}</h1>
        {item.summary && <p className="mt-5 text-xl text-muted-foreground">{tx(item.summary, lang)}</p>}
        {app && (
          <Link href={href(lang, `/apps/${app.code}`)} className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-border bg-card py-2 pr-4 pl-2 hover:border-primary/50">
            <AppLogo app={app} size={36} />
            <span className="text-sm font-medium">{app.name}</span>
          </Link>
        )}
      </Container>
      {item.cover_url && (
        <Container className="max-w-5xl">
          <Media src={item.cover_url} alt="" className="aspect-[16/8] w-full rounded-[2rem] object-cover shadow-lift" />
        </Container>
      )}
      <Container className="max-w-3xl py-12">
        <Markdown className="text-[1.05rem]">{tx(item.body, lang)}</Markdown>
      </Container>
      {others.length > 0 && (
        <Container className="border-t border-border pt-16">
          <h2 className="mb-8 text-2xl font-semibold">{t.home.newsTitle}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {others.map((n) => (
              <NewsCard key={n.id} item={n} lang={lang} t={t} />
            ))}
          </div>
        </Container>
      )}
    </article>
  );
}
