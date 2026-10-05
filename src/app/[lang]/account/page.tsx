import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ExternalLink, LifeBuoy, Package, Receipt } from "lucide-react";
import { chooseOrganization } from "@/actions/account";
import { button } from "@/components/ui/button";
import { Alert, Card, inputClass } from "@/components/ui/primitives";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import { getViewer } from "@/lib/session";
import type { MeSummary } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.account.title, robots: { index: false } };
}

export default async function AccountPage() {
  const { lang, t } = await getDictionary();
  const [viewer, summary] = await Promise.all([getViewer(), load<MeSummary>("/api/portal/me/summary", href(lang, "/account"))]);
  const keycloakAccount = `${(process.env.AUTH_KEYCLOAK_ISSUER ?? "").replace(/\/+$/, "")}/account?kc_locale=${lang}`;
  const tiles = [
    { label: t.account.purchases, value: summary.data?.entitlements, icon: Package, to: "/account/purchases", tone: "bg-primary-soft text-primary" },
    { label: t.account.orders, value: summary.data?.orders, icon: Receipt, to: "/account/orders", tone: "bg-violet-soft text-violet" },
    { label: t.account.openTickets, value: summary.data?.tickets_open, icon: LifeBuoy, to: "/account/tickets", tone: "bg-teal-soft text-teal" },
  ];

  return (
    <div className="space-y-8">
      {summary.error && <Alert tone="danger">{t.account.apiDown}</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.to} href={href(lang, tile.to)} className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <div className="flex items-center justify-between">
              <span className={`grid size-11 place-items-center rounded-2xl ${tile.tone}`}>
                <tile.icon className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-5 font-display text-4xl font-semibold">{tile.value ?? "–"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{tile.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Building2 className="size-5 text-primary" />
            <h2 className="font-semibold">{t.account.organization}</h2>
          </div>
          {!viewer?.organizations.length ? (
            <p className="mt-4 text-sm text-muted-foreground">{t.account.noOrganization}</p>
          ) : viewer.organizations.length === 1 ? (
            <p className="mt-4 font-mono text-sm">{viewer.organizations[0]}</p>
          ) : (
            <form action={chooseOrganization} className="mt-4 flex gap-2">
              <select name="organization" defaultValue={viewer.tenant ?? undefined} className={inputClass}>
                {viewer.organizations.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <button type="submit" className={button({ variant: "outline", className: "h-auto" })}>
                {t.account.switchOrg}
              </button>
            </form>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold">{t.account.profile}</h2>
          <dl className="mt-4 space-y-1 text-sm">
            <dd className="font-medium">{viewer?.name}</dd>
            <dd className="text-muted-foreground">{viewer?.email}</dd>
          </dl>
          <a href={keycloakAccount} target="_blank" rel="noopener noreferrer" className={button({ variant: "outline", size: "sm", className: "mt-5" })}>
            {t.account.manageAccount} <ExternalLink />
          </a>
        </Card>
      </div>
    </div>
  );
}
