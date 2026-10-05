import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { MarketCard } from "@/components/cards";
import { Pagination } from "@/components/pagination";
import { button } from "@/components/ui/button";
import { Container, EmptyState, PageHeader, inputClass } from "@/components/ui/primitives";
import { userApi } from "@/lib/api";
import { getApps, getMarketItems, toQuery, type MarketQuery } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import { getViewer } from "@/lib/session";
import type { MarketItem, MarketItemType, Paginated } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPES: MarketItemType[] = ["TEMPLATE", "FEATURE", "ADDON"];
const LIMIT = 12;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.market.title, description: t.market.lead };
}

/** Signed-in visitors get the `owned` flags; everybody else the public list. */
async function loadItems(params: MarketQuery): Promise<Paginated<MarketItem>> {
  if (await getViewer()) {
    try {
      return await userApi<Paginated<MarketItem>>("GET", `/api/portal/marketplace/items${toQuery(params)}`);
    } catch (e) {
      unstable_rethrow(e);
      // fall back to the public list
    }
  }
  return getMarketItems(params);
}

export default async function MarketplacePage(props: PageProps<"/[lang]/marketplace">) {
  const sp = await props.searchParams;
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  const app = str(sp.app);
  const q = str(sp.q)?.slice(0, 80);
  const type = TYPES.find((x) => x === sp.type);
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ lang, t }, apps, items] = await Promise.all([getDictionary(), getApps(), loadItems({ app, type, q, page, limit: LIMIT })]);
  const base = href(lang, "/marketplace");
  const link = (patch: Record<string, string | undefined>) => `${base}${toQuery({ app, type, q, ...patch })}`;

  return (
    <>
      <PageHeader title={t.market.title} lead={t.market.lead}>
        <form action={base} className="mt-8 flex max-w-2xl gap-2">
          {app && <input type="hidden" name="app" value={app} />}
          {type && <input type="hidden" name="type" value={type} />}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <input name="q" defaultValue={q} placeholder={t.market.search} className={cn(inputClass, "rounded-full pl-11")} />
          </div>
          <button type="submit" className={button({ variant: "brand" })}>
            <Search />
          </button>
        </form>
      </PageHeader>
      <Container className="py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {[{ code: undefined, name: t.market.allApps, color: undefined as string | undefined }, ...apps].map((a) => (
              <Link
                key={a.code ?? "all"}
                href={link({ app: a.code, page: undefined })}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  app === a.code ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-primary/50",
                )}
              >
                {a.color && <span className="size-2 rounded-full" style={{ background: a.color }} />}
                {a.name}
              </Link>
            ))}
          </div>
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {[undefined, ...TYPES].map((value) => (
              <Link
                key={value ?? "all"}
                href={link({ type: value, page: undefined })}
                className={cn(
                  "rounded-full px-3.5 py-1 text-sm whitespace-nowrap transition-colors",
                  type === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value ? t.market.types[value] : t.market.allTypes}
              </Link>
            ))}
          </div>
        </div>

        {items.items.length === 0 ? (
          <EmptyState icon={<ShoppingBag />} title={t.market.empty} />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.items.map((item) => (
              <MarketCard key={item.id} item={item} lang={lang} t={t} />
            ))}
          </div>
        )}
        <Pagination
          page={page}
          total={items.total}
          limit={LIMIT}
          basePath={base}
          params={{ app, type, q }}
          labels={{ prev: t.news.prev, next: t.news.next, page: t.common.page }}
        />
      </Container>
    </>
  );
}
