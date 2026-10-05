import type { Metadata } from "next";
import { AppCard } from "@/components/cards";
import { Container, EmptyState, PageHeader } from "@/components/ui/primitives";
import { getApps } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.apps.title, description: t.apps.lead };
}

export default async function AppsPage() {
  const [{ lang, t }, apps] = await Promise.all([getDictionary(), getApps()]);
  const available = apps.filter((a) => a.status === "AVAILABLE");
  const soon = apps.filter((a) => a.status === "COMING_SOON");
  return (
    <>
      <PageHeader title={t.apps.title} lead={t.apps.lead} />
      <Container className="py-16">
        {!apps.length && <EmptyState title={t.apps.empty} />}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((app) => (
            <AppCard key={app.code} app={app} lang={lang} t={t} />
          ))}
        </div>
        {soon.length > 0 && (
          <>
            <h2 className="mt-20 mb-8 text-2xl font-semibold">{t.apps.comingSoon}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {soon.map((app) => (
                <AppCard key={app.code} app={app} lang={lang} t={t} className="opacity-90" />
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
