import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { mockPay } from "@/actions/marketplace";
import { ActionButton } from "@/components/action-button";
import { Card, Container } from "@/components/ui/primitives";
import { load, requireViewer } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { formatPrice, href, tx } from "@/lib/i18n";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { robots: { index: false } };

/** Payment page of PAYMENT_PROVIDER=mock (development): plc-portal points checkout_url here. */
export default async function MockCheckoutPage(props: PageProps<"/[lang]/checkout/mock/[orderId]">) {
  const { orderId } = await props.params;
  const { lang, t } = await getDictionary();
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) notFound();
  const self = href(lang, `/checkout/mock/${orderId}`);
  await requireViewer(self);
  const res = await load<Order>(`/api/portal/marketplace/orders/${orderId}`, self);
  if (!res.data) notFound();
  const order = res.data;

  return (
    <Container className="max-w-lg py-16">
      <Card className="p-8 shadow-lift">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-amber/15 text-amber">
            <FlaskConical className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold">{t.checkout.title}</h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t.checkout.lead}</p>
        <div className="mt-6 rounded-2xl bg-muted p-4">
          <p className="font-mono text-sm">{order.number}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {order.items.map((i) => (
              <li key={i.item_id}>{tx(i.name, lang)}</li>
            ))}
          </ul>
          <p className="mt-3 font-display text-3xl font-semibold">{formatPrice(order.total_minor, order.currency)}</p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ActionButton action={mockPay} fields={{ order_id: order.id, lang, outcome: "success" }}>
            {t.checkout.success}
          </ActionButton>
          <ActionButton action={mockPay} fields={{ order_id: order.id, lang, outcome: "fail" }} variant="danger">
            {t.checkout.fail}
          </ActionButton>
        </div>
      </Card>
    </Container>
  );
}
