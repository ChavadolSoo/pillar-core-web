"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getViewer, TENANT_COOKIE } from "@/lib/session";

/** Users in several organizations choose the one they act in (sent as X-Tenant-Code). */
export async function chooseOrganization(formData: FormData) {
  const viewer = await getViewer();
  const org = String(formData.get("organization") ?? "");
  if (!viewer || !viewer.organizations.includes(org)) return;
  (await cookies()).set(TENANT_COOKIE, org, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}
