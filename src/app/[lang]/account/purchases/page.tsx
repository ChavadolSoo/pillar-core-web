import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Media } from "@/components/cards";
import { button } from "@/components/ui/button";
import { Alert, Badge, EmptyState } from "@/components/ui/primitives";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate, href, tx } from "@/lib/i18n";
import type { Entitlement, EntitlementStatus } from "@/lib/types";

const TONE: Record<EntitlementStatus, "success" | "primary" | "danger" | "neutral"> = {
  FULFILLED: "success",
  PENDING: "primary",
  FAILED: "danger",
  REVOKED: "neutral",
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.account.purchases, robots: { index: false } };
}

export default async function PurchasesPage() {
  const { lang, t } = await getDictionary();
  const res = await load<Entitlement[]>("/api/portal/marketplace/entitlements", href(lang, "/account/purchases"));
  if (res.error) return <Alert tone="danger">{t.account.apiDown}</Alert>;
  if (!res.data.length) {
    return (
      <EmptyState
        icon={<Package />}
        title={t.account.noPurchases}
        action={
          <Link href={href(lang, "/marketplace")} className={button({ variant: "brand" })}>
            {t.account.browseMarket}
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {res.data.map((e) => (
        <div key={e.id} className="flex gap-4 rounded-3xl border border-border bg-card p-4">
          <Link href={href(lang, `/marketplace/${e.item.slug}`)} className="shrink-0">
            {e.item.cover_url ? (
              <Media src={e.item.cover_url} className="size-24 rounded-2xl object-cover" />
            ) : (
              <span className="grid size-24 place-items-center rounded-2xl" style={{ background: `color-mix(in oklab, ${e.item.app_color} 18%, var(--muted))` }}>
                <Package className="size-8" style={{ color: e.item.app_color }} />
              </span>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium" style={{ color: e.item.app_color }}>
              {e.item.app_name} · {t.market.types[e.item.type]}
            </p>
            <Link href={href(lang, `/marketplace/${e.item.slug}`)} className="mt-1 line-clamp-2 font-semibold hover:text-primary">
              {tx(e.item.name, lang)}
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge tone={TONE[e.status]}>{t.account.delivery[e.status]}</Badge>
              {formatDate(e.granted_at, lang)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
