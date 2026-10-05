import { Download, Paperclip } from "lucide-react";
import { button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/dictionaries";
import type { FormField, FormSchema, LocalText, SubmissionAttachment } from "@/lib/types";

const text = (v: LocalText | undefined, lang: string) =>
  v === undefined ? "" : typeof v === "string" ? v : (v[lang] ?? v.th ?? Object.values(v)[0] ?? "");

const sizeOf = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

function Value({
  field,
  value,
  files,
  lang,
  t,
}: {
  field: FormField;
  value: unknown;
  files: Map<string, SubmissionAttachment>;
  lang: string;
  t: Pick<Dictionary, "forms">;
}) {
  if (value === undefined || value === null || value === "") return <span className="text-muted-foreground">-</span>;
  const option = (v: unknown) => text(field.options?.find((o) => o.value === v)?.label, lang) || String(v);
  switch (field.type) {
    case "boolean":
      return <>{value ? t.forms.yes : t.forms.no}</>;
    case "select":
      return <>{option(value)}</>;
    case "multi_select":
      return <>{(Array.isArray(value) ? value : [value]).map(option).join(", ")}</>;
    case "file":
    case "photo":
    case "signature": {
      const ids = Array.isArray(value) ? value : [value];
      return (
        <ul className="space-y-2">
          {ids.map((id) => {
            const file = files.get(String(id));
            return (
              <li key={String(id)} className="flex flex-wrap items-center gap-2">
                <Paperclip className="size-4 text-muted-foreground" />
                <span className="text-sm">{file?.file_name ?? String(id)}</span>
                {file && <span className="text-xs text-muted-foreground">{sizeOf(file.size)}</span>}
                {file?.url ? (
                  <a href={file.url} target="_blank" rel="noreferrer" className={button({ variant: "outline", size: "sm", className: "h-8" })}>
                    <Download />
                    {t.forms.download}
                  </a>
                ) : (
                  <span className="text-xs text-amber">{t.forms.pending}</span>
                )}
              </li>
            );
          })}
        </ul>
      );
    }
    default:
      return <span className="whitespace-pre-wrap">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>;
  }
}

/** Answers of one submission, in the order of the form's questions. */
export function AnswerView({
  schema,
  data,
  attachments,
  lang,
  t,
}: {
  schema: FormSchema;
  data: Record<string, unknown>;
  attachments: SubmissionAttachment[];
  lang: string;
  t: Pick<Dictionary, "forms">;
}) {
  const files = new Map(attachments.map((a) => [a.id, a]));
  const fields = schema.sections.flatMap((s) => s.fields).filter((f) => f.type !== "note");
  return (
    <dl className="divide-y divide-border">
      {fields.map((field) => (
        <div key={field.key} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
          <dt className="text-sm font-medium text-muted-foreground">{text(field.label, lang) || field.key}</dt>
          <dd className="text-sm">
            <Value field={field} value={data[field.key]} files={files} lang={lang} t={t} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
