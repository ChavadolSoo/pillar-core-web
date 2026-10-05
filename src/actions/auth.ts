"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { endSessionUrl } from "@/lib/keycloak";
import { hasLocale, type Locale } from "@/lib/i18n";
import { getIdToken } from "@/lib/session";
import { SOCIAL_PROVIDERS } from "@/lib/social";

/** Only same-site paths, so the sign-in flow cannot be turned into an open redirect. */
function safePath(value: FormDataEntryValue | null, lang: Locale): string {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : `/${lang}/account`;
}

/**
 * Starts the Keycloak sign-in. `provider` skips the Keycloak page and goes
 * straight to that identity provider (kc_idp_hint); `mode=register` opens
 * Keycloak's sign-up form (e-mail + verification e-mail).
 */
export async function startSignIn(formData: FormData) {
  const langValue = String(formData.get("lang") ?? "");
  const lang: Locale = hasLocale(langValue) ? langValue : "th";
  const provider = String(formData.get("provider") ?? "");
  const params: Record<string, string> = { ui_locales: lang };
  if (SOCIAL_PROVIDERS.some((p) => p.id === provider)) params.kc_idp_hint = provider;
  if (formData.get("mode") === "register") params.prompt = "create";
  await signIn("keycloak", { redirectTo: safePath(formData.get("callbackUrl"), lang) }, params);
}

/** Drops the website session, then ends the Keycloak SSO session too. */
export async function signOutAction() {
  const idToken = await getIdToken();
  await signOut({ redirect: false });
  const base = (process.env.AUTH_URL ?? "http://localhost:3200").replace(/\/+$/, "");
  redirect(endSessionUrl(idToken, `${base}/`));
}
