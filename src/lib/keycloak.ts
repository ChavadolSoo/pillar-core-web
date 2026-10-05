/** Keycloak (realm pillarcore) calls made by the server, never the browser. */

export type KeycloakTokens = {
  access_token: string;
  refresh_token: string | null;
  id_token: string | null;
  /** Unix seconds */
  expires_at: number;
};

/** Keycloak rejected the refresh token: the SSO session is over. */
export class SessionExpiredError extends Error {
  constructor() {
    super("Keycloak session expired");
  }
}

const issuer = () => process.env.AUTH_KEYCLOAK_ISSUER!.replace(/\/+$/, "");

/** Seconds before expiry at which the access token is refreshed. */
export const REFRESH_LEEWAY_SECONDS = 30;

export function needsRefresh(expiresAt: number | null | undefined, now = Date.now()): boolean {
  if (!expiresAt) return true;
  return now / 1000 >= expiresAt - REFRESH_LEEWAY_SECONDS;
}

/**
 * Refresh grant for the confidential client `pillar-web`.
 * Throws [SessionExpiredError] on 400/401 (revoked, SSO session ended).
 */
export async function refreshTokens(
  refreshToken: string,
  now = Date.now(),
  fetchImpl: typeof fetch = fetch,
): Promise<KeycloakTokens> {
  const res = await fetchImpl(`${issuer()}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.AUTH_KEYCLOAK_ID!,
      client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });
  if (res.status === 400 || res.status === 401) throw new SessionExpiredError();
  if (!res.ok) throw new Error(`Keycloak token endpoint answered ${res.status}`);

  const body = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number;
  };
  return {
    access_token: body.access_token,
    // Keycloak may or may not rotate these; keep the old ones when omitted.
    refresh_token: body.refresh_token ?? refreshToken,
    id_token: body.id_token ?? null,
    expires_at: Math.floor(now / 1000) + body.expires_in,
  };
}

/**
 * RP-initiated logout: ends the Keycloak SSO session, then Keycloak sends the
 * browser back to `postLogoutRedirectUri` (registered on the pillar-web client).
 */
export function endSessionUrl(idToken: string | null | undefined, postLogoutRedirectUri: string): string {
  const url = new URL(`${issuer()}/protocol/openid-connect/logout`);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("client_id", process.env.AUTH_KEYCLOAK_ID!);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  return url.toString();
}
