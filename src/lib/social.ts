/**
 * Social sign-in buttons. Each id is the alias of a Keycloak identity
 * provider (pillar-core-backend/infra/keycloak/setup-web-client.sh); a button
 * shows only when its id is listed in AUTH_SOCIAL_PROVIDERS.
 */
export const SOCIAL_PROVIDERS = [
  { id: "google", name: "Google" },
  { id: "facebook", name: "Facebook" },
  { id: "line", name: "LINE" },
  { id: "github", name: "GitHub" },
] as const;

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export function enabledSocialProviders(env = process.env.AUTH_SOCIAL_PROVIDERS ?? ""): SocialProvider[] {
  const enabled = env.split(",").map((s) => s.trim().toLowerCase());
  return SOCIAL_PROVIDERS.filter((p) => enabled.includes(p.id));
}
