"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, SignInRequiredError, userApi } from "@/lib/api";
import { hasLocale, type Locale } from "@/lib/i18n";
import type { Checkout, Order } from "@/lib/types";

export type ActionState = { error?: string } | undefined;

const localeOf = (formData: FormData): Locale => {
  const v = String(formData.get("lang") ?? "");
  return hasLocale(v) ? v : "th";
};
const uuid = /^[0-9a-f-]{36}$/i;

function message(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return "API unavailable";
}

/** Where the browser goes after an order is placed or a payment is started. */
function afterCheckout(lang: Locale, checkout: Checkout): never {
  if (checkout.checkout_url) redirect(checkout.checkout_url);
  redirect(`/${lang}/account/orders/${checkout.order.id}?status=success`);
}

/** Buy one Marketplace item (free items are delivered at once). */
export async function buyItem(_: ActionState, formData: FormData): Promise<ActionState> {
  const lang = localeOf(formData);
  const itemId = String(formData.get("item_id") ?? "");
  const back = String(formData.get("back") ?? `/${lang}/marketplace`);
  if (!uuid.test(itemId)) return { error: "Invalid item" };
  let checkout: Checkout;
  try {
    checkout = await userApi<Checkout>("POST", "/api/portal/marketplace/orders", { item_ids: [itemId] });
  } catch (e) {
    if (e instanceof SignInRequiredError || (e instanceof ApiError && e.status === 401)) {
      redirect(`/${lang}/login?callbackUrl=${encodeURIComponent(back)}`);
    }
    return { error: message(e) };
  }
  revalidatePath(`/${lang}/account`, "layout");
  afterCheckout(lang, checkout);
}

/** New payment session for a PENDING order. */
export async function payOrder(_: ActionState, formData: FormData): Promise<ActionState> {
  const lang = localeOf(formData);
  const orderId = String(formData.get("order_id") ?? "");
  if (!uuid.test(orderId)) return { error: "Invalid order" };
  let checkout: Checkout;
  try {
    checkout = await userApi<Checkout>("POST", `/api/portal/marketplace/orders/${orderId}/checkout`);
  } catch (e) {
    return { error: message(e) };
  }
  afterCheckout(lang, checkout);
}

export async function cancelOrder(_: ActionState, formData: FormData): Promise<ActionState> {
  const lang = localeOf(formData);
  const orderId = String(formData.get("order_id") ?? "");
  if (!uuid.test(orderId)) return { error: "Invalid order" };
  try {
    await userApi<Order>("POST", `/api/portal/marketplace/orders/${orderId}/cancel`);
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath(`/${lang}/account`, "layout");
  return undefined;
}

/** Development payment page (PAYMENT_PROVIDER=mock in plc-portal). */
export async function mockPay(_: ActionState, formData: FormData): Promise<ActionState> {
  const lang = localeOf(formData);
  const orderId = String(formData.get("order_id") ?? "");
  const outcome = formData.get("outcome") === "fail" ? "fail" : "success";
  if (!uuid.test(orderId)) return { error: "Invalid order" };
  try {
    await userApi<Order>("POST", `/api/portal/marketplace/orders/${orderId}/mock-pay`, { outcome });
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath(`/${lang}/account`, "layout");
  redirect(`/${lang}/account/orders/${orderId}?status=${outcome === "success" ? "success" : "cancel"}`);
}
