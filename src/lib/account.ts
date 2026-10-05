import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { ApiError, SignInRequiredError, userApi } from "@/lib/api";
import { getLocale } from "@/lib/dictionaries";
import { getViewer, type Viewer } from "@/lib/session";

/** Account pages: the signed-in user, or a trip to the login page. */
export async function requireViewer(path: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) {
    const lang = await getLocale();
    redirect(`/${lang}/login?callbackUrl=${encodeURIComponent(path)}`);
  }
  return viewer;
}

export type Loaded<T> = { data: T; error?: undefined } | { data?: undefined; error: "down" | "notFound" };

/** GET as the user; a dead session goes back to the login page. */
export async function load<T>(path: string, returnTo: string): Promise<Loaded<T>> {
  try {
    return { data: await userApi<T>("GET", path) };
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof SignInRequiredError || (e instanceof ApiError && e.status === 401)) {
      const lang = await getLocale();
      redirect(`/${lang}/login?error=SessionExpired&callbackUrl=${encodeURIComponent(returnTo)}`);
    }
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) return { error: "notFound" };
    console.error("[account]", (e as Error).message);
    return { error: "down" };
  }
}
