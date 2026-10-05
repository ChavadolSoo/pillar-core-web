import "server-only";
import { cache } from "react";
import { load, requireViewer } from "@/lib/account";
import { getLocale } from "@/lib/dictionaries";
import type { Viewer } from "@/lib/session";
import type { CatalogItem, Organization } from "@/lib/types";

export type Workspace = {
  viewer: Viewer;
  /** null until the user opens (or joins) an organization */
  org: Organization | null;
  /** Web services with the organization's state */
  services: CatalogItem[];
  down: boolean;
};

/** The signed-in user's organization and its web services. Memoized per request. */
export const getWorkspace = cache(async (): Promise<Workspace> => {
  const lang = await getLocale();
  const path = `/${lang}/workspace`;
  const viewer = await requireViewer(path);
  if (!viewer.organizations.length) return { viewer, org: null, services: [], down: false };
  const [org, services] = await Promise.all([
    load<Organization>("/api/tenants/current", path),
    load<CatalogItem[]>("/api/portal/catalog?kind=WEB", path),
  ]);
  return { viewer, org: org.data ?? null, services: services.data ?? [], down: !!(org.error || services.error) };
});

/** Is the web service `code` on for the organization? */
export const isOn = (ws: Workspace, code: string) => ws.services.some((s) => s.code === code && s.status === "ACTIVE");
