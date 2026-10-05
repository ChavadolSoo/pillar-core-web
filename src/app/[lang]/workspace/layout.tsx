import { Building2 } from "lucide-react";
import { AccountNav } from "@/components/account-nav";
import { SERVICE_PATHS } from "@/components/services/service-icon";
import { Alert, Container } from "@/components/ui/primitives";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import { getWorkspace } from "@/lib/workspace";

export default async function WorkspaceLayout({ children }: LayoutProps<"/[lang]/workspace">) {
  const [{ lang, t }, ws] = await Promise.all([getDictionary(), getWorkspace()]);
  const on = ws.services.filter((s) => s.status === "ACTIVE" && SERVICE_PATHS[s.code]);
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-primary/15 blur-3xl" />
        <Container className="relative flex items-center gap-4 pt-10 pb-6">
          <span className="bg-brand grid size-14 place-items-center rounded-2xl text-white shadow-soft [&_svg]:size-6">
            <Building2 />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{t.workspace.title}</p>
            <h1 className="truncate text-2xl font-semibold sm:text-3xl">{ws.org?.name ?? t.workspace.createTitle}</h1>
          </div>
        </Container>
        {ws.org && (
          <Container>
            <AccountNav
              items={[
                { href: href(lang, "/workspace"), label: t.workspace.overview },
                ...on.map((s) => ({
                  href: href(lang, SERVICE_PATHS[s.code]),
                  label: { forms: t.forms.formsTitle, documents: t.forms.docsTitle, helpdesk: t.helpdesk.title }[s.code] ?? s.name,
                })),
              ]}
            />
          </Container>
        )}
      </section>
      <Container className="py-10">
        {ws.down && (
          <div className="mb-6">
            <Alert tone="danger">{t.account.apiDown}</Alert>
          </div>
        )}
        {children}
      </Container>
    </>
  );
}
