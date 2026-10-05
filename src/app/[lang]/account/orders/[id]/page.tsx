import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cancelOrder, payOrder } from "@/actions/marketplace";
import { ActionButton } from "@/components/action-button";
import { OrderStatusBadge } from "@/components/order-status";
import { Alert, Card } from "@/components/ui/primitives";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate, formatPrice, href, tx } from "@/lib/i18n";
import type { Order } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.account.order, robots: { index: false } };
}

export default async function OrderPage(props: PageProps<"/[lang]/account/orders/[id]">) {
  const [{ id }, sp] = await Promise.all([props.params, props.searchParams]);
  const { lang, t } = await getDictionary();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const res = await load<Order>(`/api/portal/marketplace/orders/${id}`, href(lang, `/account/orders/${id}`));
  if (res.error === "notFound") notFound();
  if (res.error) return <Alert tone="danger">{t.account.apiDown}</Alert>;
  const order = res.data;
  const money = (minor: number) => (minor === 0 ? t.market.free : formatPrice(minor, order.currency));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={href(lang, "/account/orders")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t.account.orders}
      </Link>
      {sp.status === "success" && order.status === "PAID" && <Alert tone="success">{t.account.paySuccess}</Alert>}
      {sp.status === "cancel" && order.status === "PENDING" && <Alert>{t.account.payCancelled}</Alert>}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{t.account.order}</p>
            <h2 className="font-mono text-2xl font-semibold">{order.number}</h2>
          </div>
          <OrderStatusBadge status={order.status} t={t} />
        </div>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {order.items.map((i) => (
            <li key={i.item_id} className="flex items-center justify-between gap-4 py-4">
              <Link href={href(lang, `/marketplace/${i.slug}`)} className="font-medium hover:text-primary">
                {tx(i.name, lang)}
              </Link>
              <span className="font-display">{money(i.price_minor)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-muted-foreground">{t.account.total}</span>
          <span className="font-display text-2xl font-semibold">{money(order.total_minor)}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatDate(order.created_at, lang, true)}
          {order.paid_at && ` · ${t.account.paidAt} ${formatDate(order.paid_at, lang, true)}`}
        </p>
        {order.status === "PENDING" && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <ActionButton action={payOrder} fields={{ order_id: order.id, lang }}>
              {t.account.payNow}
            </ActionButton>
            <ActionButton action={cancelOrder} fields={{ order_id: order.id, lang }} variant="outline">
              {t.account.cancel}
            </ActionButton>
          </div>
        )}
        {order.status === "PAID" && (
          <Link href={href(lang, "/account/purchases")} className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            {t.market.openInApp} →
          </Link>
        )}
      </Card>
    </div>
  );
}
