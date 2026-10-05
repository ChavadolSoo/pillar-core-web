import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import { auth } from "@/auth";
import { needsRefresh, refreshTokens } from "@/lib/keycloak";

export const TENANT_COOKIE = "plc_tenant";

export type Viewer = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  organizations: string[];
  /** Organization the user acts in (cookie), when they belong to several. */
  tenant: string | null;
  /** Admin of their organization (realm role tenant-admin or platform-admin) */
  isOrgAdmin: boolean;
};

/** The signed-in user for the UI, or null. Memoized per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth();
  if (!session?.user || session.error) return null;
  const organizations = session.organizations ?? [];
  const chosen = (await cookies()).get(TENANT_COOKIE)?.value;
  return {
    id: session.user.id ?? "",
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
    organizations,
    tenant: chosen && organizations.includes(chosen) ? chosen : (organizations[0] ?? null),
    isOrgAdmin: (session.roles ?? []).some((r) => r === "tenant-admin" || r === "platform-admin"),
  };
});

/**
 * Keycloak access token of the signed-in user (server only), refreshed in
 * memory when the cookie still holds an expiring one. The proxy refreshes and
 * re-writes the cookie on navigation, so this only bridges the current request.
 */
export const getAccessToken = cache(async (): Promise<string | null> => {
  const token = await getToken({
    req: { headers: Object.fromEntries((await headers()).entries()) },
    secret: process.env.AUTH_SECRET!,
    secureCookie: process.env.AUTH_URL?.startsWith("https://") ?? false,
  });
  if (!token?.access_token || token.error) return null;
  if (!needsRefresh(token.expires_at)) return token.access_token;
  if (!token.refresh_token) return null;
  try {
    return (await refreshTokens(token.refresh_token)).access_token;
  } catch {
    return null;
  }
});

/** id_token for RP-initiated logout. */
export async function getIdToken(): Promise<string | null> {
  const token = await getToken({
    req: { headers: Object.fromEntries((await headers()).entries()) },
    secret: process.env.AUTH_SECRET!,
    secureCookie: process.env.AUTH_URL?.startsWith("https://") ?? false,
  });
  return token?.id_token ?? null;
}
