import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { defaultLocale, hasLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/** Saved choice first, then the browser's languages, then Thai. */
function preferredLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (hasLocale(cookie)) return cookie;
  for (const part of (acceptLanguage ?? "").split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (hasLocale(code)) return code;
  }
  return defaultLocale;
}

/**
 * 1. Every page lives under /th or /en: redirect paths without a locale.
 * 2. /[lang]/account needs a session (optimistic check; pages verify again).
 * Wrapped in auth() so an expiring Keycloak token is refreshed and the
 * session cookie re-written on navigation.
 */
export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (!hasLocale(first)) {
    const lang = preferredLocale(request.cookies.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language"));
    return NextResponse.redirect(new URL(`/${lang}${pathname === "/" ? "" : pathname}${search}`, request.url));
  }

  const signedIn = !!request.auth?.user && !request.auth.error;
  if (!signedIn && /^\/(th|en)\/account(\/|$)/.test(pathname)) {
    const login = new URL(`/${first}/login`, request.url);
    login.searchParams.set("callbackUrl", `${pathname}${search}`);
    if (request.auth?.error) login.searchParams.set("error", "SessionExpired");
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
});

export const config = {
  // Pages only: not the auth routes, the API media rewrite, Next internals or files with an extension.
  matcher: ["/((?!api/|_next/|brand/|.*\\.[\\w]+$).*)"],
};
