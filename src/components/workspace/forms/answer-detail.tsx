import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AnswerView } from "@/components/workspace/forms/answer-view";
import { ServiceOff } from "@/components/workspace/service-off";
import { Alert, Card } from "@/components/ui/primitives";
import { load } from "@/lib/account";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate, href } from "@/lib/i18n";
import type { FormSummary, FormVersion, Submission } from "@/lib/types";
import { getWorkspace, isOn } from "@/lib/workspace";

/** One answer of a form, with links to its uploaded files. */
export async function AnswerDetail({ app, id, sid }: { app: "forms" | "documents"; id: string; sid: string }) {
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(sid)) notFound();
  const [{ lang, t }, ws] = await Promise.all([getDictionary(), getWorkspace()]);
  if (!ws.org) return null;
  if (!isOn(ws, app)) return <ServiceOff t={t} lang={lang} />;
  const f = t.forms;
  const back = `/workspace/${app}/${id}`;
  const path = href(lang, `${back}/answers/${sid}`);
  const [form, sub] = await Promise.all([
    load<FormSummary>(`/api/form/forms/${id}`, path),
    load<Submission>(`/api/form/submissions/${sid}`, path),
  ]);
  if (form.error === "notFound" || sub.error === "notFound") notFound();
  if (!form.data || !sub.data) return <Alert tone="danger">{t.account.apiDown}</Alert>;
  if (form.data.app_code !== app || sub.data.form_id !== id) notFound();
  const version = await load<FormVersion>(`/api/form/forms/${id}/versions/${sub.data.version_number}`, path);
  if (!version.data) return <Alert tone="danger">{t.account.apiDown}</Alert>;

  return (
    <div className="space-y-6">
      <div>
        <Link href={href(lang, back)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" />
          {f.back}
        </Link>
        <h2 className="mt-1 text-2xl font-semibold">{sub.data.title || f.anonymous}</h2>
        <p className="text-sm text-muted-foreground">
          {f.received} {formatDate(sub.data.received_at, lang, true)}
        </p>
      </div>
      <Card className="px-5">
        <AnswerView schema={version.data.schema} data={sub.data.data} attachments={sub.data.attachments ?? []} lang={lang} t={t} />
      </Card>
    </div>
  );
}
