import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { decodeJwt } from "jose";
import { needsRefresh, refreshTokens, SessionExpiredError } from "@/lib/keycloak";

declare module "next-auth" {
  interface Session {
    /** Set when Keycloak ended the SSO session: the UI asks to sign in again. */
    error?: "SessionExpired";
    /** Keycloak organizations (1 organization = 1 tenant) the user belongs to. */
    organizations: string[];
    /** Keycloak realm roles, e.g. tenant-admin */
    roles: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    refresh_token?: string | null;
    id_token?: string | null;
    /** Unix seconds */
    expires_at?: number;
    organizations?: string[];
    roles?: string[];
    error?: "SessionExpired";
  }
}

/** Keycloak organization aliases of an access token (array or alias-keyed object). */
export function organizationsOf(accessToken: string | undefined): string[] {
  if (!accessToken) return [];
  try {
    const org = (decodeJwt(accessToken) as { organization?: unknown }).organization;
    if (Array.isArray(org)) return org.filter((o): o is string => typeof o === "string");
    return org && typeof org === "object" ? Object.keys(org) : [];
  } catch {
    return [];
  }
}

/** Realm roles of an access token. */
export function rolesOf(accessToken: string | undefined): string[] {
  if (!accessToken) return [];
  try {
    const roles = (decodeJwt(accessToken) as { realm_access?: { roles?: unknown } }).realm_access?.roles;
    return Array.isArray(roles) ? roles.filter((r): r is string => typeof r === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Auth.js with the Keycloak client `pillar-web` (realm pillarcore). Everything
 * about accounts happens on Keycloak: e-mail sign-up with e-mail verification,
 * password reset and the social identity providers (Google, Facebook, GitHub,
 * LINE), so a website account is the same account as in Landie and Appoiz.
 *
 * Sessions are encrypted JWT cookies (no database). Keycloak tokens live only
 * inside that cookie; the session the browser can read carries no token.
 */
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 10 * 60 * 60 },
  providers: [
    Keycloak({
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      clientId: process.env.AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      checks: ["pkce", "state", "nonce"],
      authorization: { params: { scope: "openid profile email organization" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, trigger }) {
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token ?? null,
          id_token: account.id_token ?? null,
          expires_at: account.expires_at,
          organizations: organizationsOf(account.access_token),
          roles: rolesOf(account.access_token),
          error: undefined,
        };
      }
      // `unstable_update()` (e.g. right after opening an organization) asks
      // Keycloak for a fresh token, so new memberships and roles show at once.
      const forced = trigger === "update";
      if (!token.refresh_token || (!forced && !needsRefresh(token.expires_at))) return token;
      try {
        const fresh = await refreshTokens(token.refresh_token);
        return {
          ...token,
          ...fresh,
          id_token: fresh.id_token ?? token.id_token,
          organizations: organizationsOf(fresh.access_token),
          roles: rolesOf(fresh.access_token),
        };
      } catch (e) {
        if (e instanceof SessionExpiredError) return { ...token, access_token: undefined, error: "SessionExpired" };
        console.error("[auth] token refresh failed:", (e as Error).message);
        return token;
      }
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.organizations = token.organizations ?? [];
      session.roles = token.roles ?? [];
      session.error = token.error;
      return session;
    },
  },
  pages: { signIn: "/th/login", error: "/th/login" },
});
