import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CopyField } from "@/components/workspace/copy-field";
import { CreateOrgForm } from "@/components/workspace/create-org-form";
import { RenameOrg } from "@/components/workspace/rename-org";
import { ServiceToggle } from "@/components/workspace/service-toggle";
import { SERVICE_PATHS, ServiceIcon } from "@/components/services/service-icon";
import { button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import { getServices } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href, tx } from "@/lib/i18n";
import { getWorkspace } from "@/lib/workspace";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.workspace.title };
}

export default async function WorkspacePage() {
  const [{ lang, t }, ws, site] = await Promise.all([getDictionary(), getWorkspace(), getServices()]);
  const w = t.workspace;
  if (!ws.org) return <CreateOrgForm t={t} />;

  const admin = ws.viewer.isOrgAdmin;
  const siteByCode = new Map(site.map((s) => [s.code, s]));
  const orgPage = href(lang, `/o/${ws.org.code}`);
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <section>
        <h2 className="text-xl font-semibold">{w.servicesTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{admin ? w.servicesLead : w.notAdmin}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ws.services.map((svc) => {
            const page = site.length ? siteByCode.get(svc.code) : undefined;
            const on = svc.status === "ACTIVE";
            const path = SERVICE_PATHS[svc.code];
            return (
              <Card key={svc.code} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <ServiceIcon icon={svc.icon} color={svc.color} />
                  {svc.status === "COMING_SOON" ? (
                    <Badge tone="violet">{w.soon}</Badge>
                  ) : (
                    on && <Badge tone="success">{w.enabled}</Badge>
                  )}
                </div>
                <h3 className="mt-4 font-semibold">{tx(page?.tagline, lang) || svc.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{tx(page?.description, lang) || svc.description}</p>
                {svc.status !== "COMING_SOON" && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {on && path && (
                      <Link href={href(lang, path)} className={button({ variant: "outline", size: "sm" })}>
                        {w.manage}
                        <ArrowRight />
                      </Link>
                    )}
                    {admin && <ServiceToggle code={svc.code} on={on} labels={{ enable: w.enable, disable: w.disable }} />}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
      <aside className="space-y-6">
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">{w.publicPage}</h2>
          <p className="text-sm text-muted-foreground">{w.publicPageHint}</p>
          <CopyField path={orgPage} label={w.copy} />
        </Card>
        {admin ? (
          <Card className="p-5">
            <RenameOrg name={ws.org.name} labels={{ rename: w.rename, save: w.save, saved: w.saved }} />
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">{w.member}</p>
        )}
      </aside>
    </div>
  );
}
