import { Badge } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";
import type { OrderStatus } from "@/lib/types";

const TONE: Record<OrderStatus, "success" | "primary" | "danger" | "neutral" | "violet"> = {
  PAID: "success",
  PENDING: "primary",
  FAILED: "danger",
  CANCELLED: "neutral",
  REFUNDED: "violet",
};

export function OrderStatusBadge({ status, t }: { status: OrderStatus; t: Dictionary }) {
  return <Badge tone={TONE[status]}>{t.account.orderStatus[status]}</Badge>;
}
