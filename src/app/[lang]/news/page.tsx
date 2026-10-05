import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { NewsCard } from "@/components/cards";
import { Pagination } from "@/components/pagination";
import { Container, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getNews } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import type { NewsType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPES: NewsType[] = ["NEW_APP", "FEATURE", "NEWS", "ANNOUNCEMENT"];
const LIMIT = 12;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.news.title, description: t.news.lead };
}

export default async function NewsPage(props: PageProps<"/[lang]/news">) {
  const sp = await props.searchParams;
  const type = typeof sp.type === "string" && (TYPES as string[]).includes(sp.type) ? (sp.type as NewsType) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ lang, t }, news] = await Promise.all([getDictionary(), getNews({ type, page, limit: LIMIT })]);
  const base = href(lang, "/news");
  const [first, ...rest] = news.items;

  return (
    <>
      <PageHeader title={t.news.title} lead={t.news.lead}>
        <div className="mt-8 flex flex-wrap gap-2">
          {[undefined, ...TYPES].map((value) => (
            <Link
              key={value ?? "all"}
              href={value ? `${base}?type=${value}` : base}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                type === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50",
              )}
            >
              {value ? t.news.types[value] : t.news.all}
            </Link>
          ))}
        </div>
      </PageHeader>
      <Container className="py-14">
        {!first ? (
          <EmptyState icon={<Newspaper />} title={t.news.empty} />
        ) : (
          <>
            {page === 1 ? (
              <NewsCard item={first} lang={lang} t={t} large className="md:flex-row [&>div:first-child]:md:aspect-auto [&>div:first-child]:md:w-3/5 [&>div:last-child]:md:justify-center [&>div:last-child]:md:p-10" />
            ) : null}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(page === 1 ? rest : news.items).map((item) => (
                <NewsCard key={item.id} item={item} lang={lang} t={t} />
              ))}
            </div>
            <Pagination
              page={page}
              total={news.total}
              limit={LIMIT}
              basePath={base}
              params={{ type }}
              labels={{ prev: t.news.prev, next: t.news.next, page: t.common.page }}
            />
          </>
        )}
      </Container>
    </>
  );
}
