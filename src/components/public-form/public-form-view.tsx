"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Paperclip, Send, X } from "lucide-react";
import { submitPublicForm, type PublicFile } from "@/actions/public-form";
import { button } from "@/components/ui/button";
import { Alert, inputClass } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";
import { fill } from "@/lib/i18n";
import type { FormField, FormSchema, LocalText } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Same list as plc-form accepts for file questions (photo questions take images). */
const FILE_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  txt: "text/plain",
  csv: "text/csv",
  zip: "application/zip",
  doc: "application/msword",
  xls: "application/vnd.ms-excel",
  ppt: "application/vnd.ms-powerpoint",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};
const ACCEPT = Object.keys(FILE_TYPES)
  .map((e) => `.${e}`)
  .join(",");

const text = (v: LocalText | undefined, lang: string) =>
  v === undefined ? "" : typeof v === "string" ? v : (v[lang] ?? v.th ?? Object.values(v)[0] ?? "");

/** The type plc-form will accept for this file, or null. */
function mimeOf(file: File, field: FormField): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = FILE_TYPES[ext] ?? (Object.values(FILE_TYPES).includes(file.type) ? file.type : null);
  if (!mime) return null;
  return field.type === "photo" && !mime.startsWith("image/") ? null : mime;
}

async function sha256(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

type Picked = { id: string; file: File; mime: string };

const without = (errors: Record<string, string>, key: string) => Object.fromEntries(Object.entries(errors).filter(([k]) => k !== key));

const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

/** A form shared as a public link: answers, then each file streamed on its own. */
export function PublicFormView({
  token,
  schema,
  maxFileBytes,
  lang,
  t,
}: {
  token: string;
  schema: FormSchema;
  maxFileBytes: number;
  lang: string;
  t: Pick<Dictionary, "publicForm" | "forms">;
}) {
  const p = t.publicForm;
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, Picked[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);

  const set = (key: string, value: unknown) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => without(e, key));
  };
  const errorText = (e: { code: string; args?: Record<string, string> }) => fill(p.errors[e.code] ?? p.errors.default, e.args ?? {});
  const fields = schema.sections.flatMap((s) => s.fields);

  const pick = (field: FormField, list: FileList | null) => {
    if (!list) return;
    const max = field.max_count ?? 20;
    const current = files[field.key] ?? [];
    const added: Picked[] = [];
    for (const file of Array.from(list)) {
      const mime = mimeOf(file, field);
      if (!mime) return setErrors((e) => ({ ...e, [field.key]: p.errors.default }));
      if (file.size > maxFileBytes || file.size === 0) return setErrors((e) => ({ ...e, [field.key]: fill(p.tooLarge, { name: file.name }) }));
      added.push({ id: crypto.randomUUID(), file, mime });
    }
    if (current.length + added.length > max) return setErrors((e) => ({ ...e, [field.key]: fill(p.tooMany, { n: max }) }));
    setFiles((f) => ({ ...f, [field.key]: [...current, ...added] }));
    setErrors((e) => without(e, field.key));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const missing: Record<string, string> = {};
    for (const f of fields) {
      const value = f.type === "file" || f.type === "photo" ? files[f.key] : values[f.key];
      if (f.required && f.type !== "note" && isEmpty(value)) missing[f.key] = p.errors["validation.required"];
    }
    if (Object.keys(missing).length) {
      setErrors(missing);
      return;
    }
    setBusy(true);
    try {
      const data: Record<string, unknown> = { ...values };
      const announced: PublicFile[] = [];
      for (const [key, list] of Object.entries(files)) {
        if (!list.length) continue;
        data[key] = list.map((f) => f.id);
        for (const f of list) {
          announced.push({ id: f.id, field_key: key, mime: f.mime, size: f.file.size, checksum: await sha256(f.file), name: f.file.name.slice(0, 200) });
        }
      }
      const res = await submitPublicForm(token, data, announced);
      if (!res.ok) {
        if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, e]) => [k, errorText(e)])));
        setMessage(
          res.error === "rateLimited" ? p.rateLimited : res.error === "closed" ? p.closedTitle : res.errors ? null : (res.message ?? p.uploadFailed),
        );
        return;
      }
      const byId = new Map(Object.values(files).flat().map((f) => [f.id, f]));
      setProgress({ done: 0, total: res.uploads.length });
      for (const [i, id] of res.uploads.entries()) {
        const picked = byId.get(id);
        if (!picked) continue;
        const put = await fetch(`/api/form-files/${id}`, { method: "PUT", body: picked.file, headers: { "content-type": "application/octet-stream" } });
        if (!put.ok) {
          setMessage(put.status === 429 ? p.rateLimited : p.uploadFailed);
          return;
        }
        setProgress({ done: i + 1, total: res.uploads.length });
      }
      setDone(true);
    } catch {
      setMessage(p.uploadFailed);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  if (done) {
    return (
      <div className="animate-rise flex flex-col items-center px-4 py-10 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">{p.thanksTitle}</h2>
        <p className="mt-2 text-muted-foreground">{p.thanksBody}</p>
        <button
          type="button"
          className={button({ variant: "outline", className: "mt-8" })}
          onClick={() => {
            setValues({});
            setFiles({});
            setDone(false);
            setRound((r) => r + 1);
          }}
        >
          {p.again}
        </button>
      </div>
    );
  }

  return (
    <form key={round} onSubmit={submit} noValidate className="space-y-8">
      {schema.sections.map((section) => (
        <fieldset key={section.key} className="space-y-6">
          {schema.sections.length > 1 && <legend className="mb-2 text-lg font-semibold">{text(section.title, lang)}</legend>}
          {section.fields.map((field) => {
            const id = `q-${field.key}`;
            const label = text(field.label, lang);
            const hint = text(field.hint, lang);
            const error = errors[field.key];
            if (field.type === "note") {
              return (
                <div key={field.key} className="rounded-2xl bg-muted px-4 py-3 text-sm">
                  {label && <p className="font-medium">{label}</p>}
                  {hint && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{hint}</p>}
                </div>
              );
            }
            return (
              <div key={field.key} className="space-y-2">
                <label htmlFor={id} className="block text-sm font-medium">
                  {label}
                  {field.required && <span className="text-danger"> *</span>}
                </label>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                <Control field={field} id={id} value={values[field.key]} set={(v) => set(field.key, v)} lang={lang} t={t} invalid={!!error} />
                {(field.type === "file" || field.type === "photo") && (
                  <div className="space-y-2">
                    {(files[field.key] ?? []).map((f) => (
                      <div key={f.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                        <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{f.file.name}</span>
                        <button
                          type="button"
                          aria-label={t.forms.remove}
                          onClick={() => setFiles((all) => ({ ...all, [field.key]: all[field.key].filter((x) => x.id !== f.id) }))}
                          className="text-muted-foreground hover:text-danger"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                    <label className={button({ variant: "outline", size: "sm", className: "cursor-pointer" })}>
                      <Paperclip />
                      {p.chooseFiles}
                      <input
                        id={id}
                        type="file"
                        multiple
                        accept={field.type === "photo" ? "image/*" : ACCEPT}
                        className="sr-only"
                        onChange={(e) => {
                          pick(field, e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground">{fill(p.fileTypes, { size: Math.floor(maxFileBytes / 1024 / 1024) })}</p>
                  </div>
                )}
                {error && <p className="text-xs text-danger">{error}</p>}
              </div>
            );
          })}
        </fieldset>
      ))}
      {message && <Alert tone="danger">{message}</Alert>}
      <button type="submit" disabled={busy} className={button({ variant: "brand", size: "lg", className: "w-full sm:w-auto" })}>
        {busy ? <LoaderCircle className="animate-spin" /> : <Send />}
        {progress ? fill(p.uploading, progress) : busy ? p.sending : p.submit}
      </button>
    </form>
  );
}

function Control({
  field,
  id,
  value,
  set,
  lang,
  t,
  invalid,
}: {
  field: FormField;
  id: string;
  value: unknown;
  set: (v: unknown) => void;
  lang: string;
  t: Pick<Dictionary, "publicForm" | "forms">;
  invalid: boolean;
}) {
  const cls = cn(inputClass, invalid && "border-danger");
  switch (field.type) {
    case "textarea":
      return <textarea id={id} rows={4} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={cn(cls, "resize-y")} />;
    case "number":
      return (
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value === undefined ? "" : String(value)}
          onChange={(e) => set(e.target.value === "" ? undefined : Number(e.target.value))}
          className={cls}
        />
      );
    case "date":
      return <input id={id} type="date" value={String(value ?? "")} onChange={(e) => set(e.target.value || undefined)} className={cls} />;
    case "select":
      return (
        <select id={id} value={String(value ?? "")} onChange={(e) => set(e.target.value || undefined)} className={cls}>
          <option value="">{t.publicForm.select}</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {text(o.label, lang) || o.value}
            </option>
          ))}
        </select>
      );
    case "multi_select": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div id={id} className="space-y-2">
          {field.options?.map((o) => (
            <label key={o.value} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={list.includes(o.value)}
                onChange={(e) => set(e.target.checked ? [...list, o.value] : list.filter((v) => v !== o.value))}
                className="size-4"
              />
              {text(o.label, lang) || o.value}
            </label>
          ))}
        </div>
      );
    }
    case "boolean":
      return (
        <div id={id} className="flex gap-2">
          {[true, false].map((b) => (
            <button
              key={String(b)}
              type="button"
              aria-pressed={value === b}
              onClick={() => set(value === b ? undefined : b)}
              className={cn(
                "rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors",
                value === b ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:border-primary/40",
              )}
            >
              {b ? t.forms.yes : t.forms.no}
            </button>
          ))}
        </div>
      );
    case "file":
    case "photo":
      return null;
    default:
      return <input id={id} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={cls} />;
  }
}
