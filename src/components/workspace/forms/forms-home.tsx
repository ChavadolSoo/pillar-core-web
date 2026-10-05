import Link from "next/link";
import { ClipboardList, FileUp, Link2 } from "lucide-react";
import { NewFormForm } from "@/components/workspace/forms/new-form-form";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { ServiceOff } from "@/components/workspace/service-off";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate, href } from "@/lib/i18n";
import type { FormSummary, Paginated } from "@/lib/types";
import { getWorkspace, isOn } from "@/lib/workspace";

const nameOf = (f: FormSummary, lang: string) => f.name[lang] || f.name.th || Object.values(f.name)[0] || f.code;

/** Forms of one web service ("forms" or "documents") of the organization. */
export async function FormsHome({ app }: { app: "forms" | "documents" }) {
  const [{ lang, t }, ws] = await Promise.all([getDictionary(), getWorkspace()]);
  if (!ws.org) return null;
  if (!isOn(ws, app)) return <ServiceOff t={t} lang={lang} />;
  const f = t.forms;
  const base = `/workspace/${app}`;
  const list = await load<Paginated<FormSummary>>(`/api/form/forms?app_code=${app}&limit=100`, href(lang, base));
  const forms = list.data?.items ?? [];
  const Icon = app === "documents" ? FileUp : ClipboardList;
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <section>
        <h2 className="text-xl font-semibold">{app === "documents" ? f.docsTitle : f.formsTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{app === "documents" ? f.docsLead : f.formsLead}</p>
        <div className="mt-6 space-y-3">
          {!forms.length && <EmptyState icon={<Icon />} title={f.empty} />}
          {forms.map((form) => (
            <Link
              key={form.id}
              href={href(lang, `${base}/${form.id}`)}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{nameOf(form, lang)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(form.updated_at, lang, true)}</p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                {form.public && (
                  <Badge tone="teal">
                    <Link2 className="size-3" />
                    {f.shared}
                  </Badge>
                )}
                {form.published_version ? <Badge tone="success">{f.published}</Badge> : <Badge>{f.draft}</Badge>}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <aside>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">{app === "documents" ? f.newDocs : f.newForm}</h2>
          <NewFormForm app={app} t={t} />
        </Card>
      </aside>
    </div>
  );
}

export { nameOf as formName };
