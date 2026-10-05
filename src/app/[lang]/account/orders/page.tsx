import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status";
import { button } from "@/components/ui/button";
import { Alert, EmptyState } from "@/components/ui/primitives";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate, formatPrice, href, tx } from "@/lib/i18n";
import type { Order, Paginated } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.account.orders, robots: { index: false } };
}

export default async function OrdersPage() {
  const { lang, t } = await getDictionary();
  const res = await load<Paginated<Order>>("/api/portal/marketplace/orders?limit=50", href(lang, "/account/orders"));
  if (res.error) return <Alert tone="danger">{t.account.apiDown}</Alert>;
  if (!res.data.items.length) {
    return (
      <EmptyState
        icon={<Receipt />}
        title={t.account.noOrders}
        action={
          <Link href={href(lang, "/marketplace")} className={button({ variant: "brand" })}>
            {t.account.browseMarket}
          </Link>
        }
      />
    );
  }
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
      {res.data.items.map((o) => (
        <li key={o.id}>
          <Link href={href(lang, `/account/orders/${o.id}`)} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium">{o.number}</span>
                <OrderStatusBadge status={o.status} t={t} />
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">{o.items.map((i) => tx(i.name, lang)).join(", ")}</p>
            </div>
            <div className="text-right">
              <p className="font-display font-semibold">{o.total_minor === 0 ? t.market.free : formatPrice(o.total_minor, o.currency)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(o.created_at, lang)}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
