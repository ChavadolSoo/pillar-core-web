import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Inbox } from "lucide-react";
import { archiveForm } from "@/actions/workspace";
import { ActionButton } from "@/components/action-button";
import { Pagination } from "@/components/pagination";
import { CopyField } from "@/components/workspace/copy-field";
import { FormBuilder } from "@/components/workspace/forms/form-builder";
import { formName } from "@/components/workspace/forms/forms-home";
import { ShareToggle } from "@/components/workspace/forms/share-toggle";
import { ServiceOff } from "@/components/workspace/service-off";
import { AccountNav } from "@/components/account-nav";
import { Alert, Badge, Card, EmptyState } from "@/components/ui/primitives";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { fill, formatDate, href } from "@/lib/i18n";
import type { FormSummary, FormVersion, Paginated, Submission } from "@/lib/types";
import { getWorkspace, isOn } from "@/lib/workspace";

const LIMIT = 20;

/** One form: its public link, its questions (editor) and the answers received. */
export async function FormDetail({
  app,
  id,
  view,
  page,
}: {
  app: "forms" | "documents";
  id: string;
  view: string | undefined;
  page: number;
}) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ lang, t }, ws] = await Promise.all([getDictionary(), getWorkspace()]);
  if (!ws.org) return null;
  if (!isOn(ws, app)) return <ServiceOff t={t} lang={lang} />;
  const f = t.forms;
  const base = `/workspace/${app}/${id}`;
  const loaded = await load<FormSummary>(`/api/form/forms/${id}`, href(lang, base));
  if (loaded.error === "notFound" || (loaded.data && loaded.data.app_code !== app)) notFound();
  if (!loaded.data) return <Alert tone="danger">{t.account.apiDown}</Alert>;
  const form = loaded.data;

  const editing = form.versions?.find((v) => v.status === "DRAFT") ?? form.versions?.find((v) => v.status === "PUBLISHED");
  const showAnswers = view !== "questions" && !!form.published_version;

  const [version, answers] = await Promise.all([
    editing && !showAnswers ? load<FormVersion>(`/api/form/forms/${id}/versions/${editing.number}`, href(lang, base)) : null,
    showAnswers ? load<Paginated<Submission>>(`/api/form/forms/${id}/submissions?page=${page}&limit=${LIMIT}`, href(lang, base)) : null,
  ]);
  const name = formName(form, lang);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href={href(lang, `/workspace/${app}`)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" />
            {f.back}
          </Link>
          <h2 className="mt-1 truncate text-2xl font-semibold">{name}</h2>
        </div>
        {form.published_version ? <Badge tone="success">{f.published}</Badge> : <Badge>{f.draft}</Badge>}
      </div>

      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">{f.shareTitle}</h3>
          {form.published_version ? (
            <ShareToggle id={form.id} shared={form.public} labels={{ on: f.shareOn, off: f.shareOff }} />
          ) : (
            <span className="text-sm text-muted-foreground">{f.shareNeedsPublish}</span>
          )}
        </div>
        {form.public && form.public_token ? (
          <>
            <CopyField path={href(lang, `/f/${form.public_token}`)} label={t.workspace.copy} />
            <p className="text-xs text-muted-foreground">{f.shareHint}</p>
          </>
        ) : (
          form.public_token && <p className="text-sm text-muted-foreground">{f.sharedOff}</p>
        )}
      </Card>

      <div className="border-b border-border">
        <AccountNav
          items={[
            ...(form.published_version ? [{ href: href(lang, base), label: f.answersTitle }] : []),
            { href: `${href(lang, base)}?view=questions`, label: f.questions },
          ]}
        />
      </div>

      {showAnswers ? (
        <section>
          {answers?.error && <Alert tone="danger">{t.account.apiDown}</Alert>}
          {answers?.data && !answers.data.items.length && <EmptyState icon={<Inbox />} title={f.noAnswers} />}
          <div className="space-y-2">
            {answers?.data?.items.map((s) => (
              <Link
                key={s.id}
                href={href(lang, `${base}/answers/${s.id}`)}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.title || f.anonymous}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.received} {formatDate(s.received_at, lang, true)}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
          {answers?.data && (
            <div className="mt-6">
              <Pagination
                page={page}
                total={answers.data.total}
                limit={LIMIT}
                basePath={href(lang, base)}
                params={{}}
                labels={{ prev: t.news.prev, next: t.news.next, page: fill(t.common.page, { page, pages: Math.ceil(answers.data.total / LIMIT) }) }}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-8">
          <FormBuilder formId={form.id} app={app} title={name} initial={version?.data?.schema ?? null} lang={lang} t={t} />
          <div className="border-t border-border pt-6">
            <ActionButton action={archiveForm} fields={{ id: form.id, app }} variant="danger" size="sm" className="w-auto">
              {f.archive}
            </ActionButton>
          </div>
        </section>
      )}
    </div>
  );
}
