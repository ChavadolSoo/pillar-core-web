"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, LoaderCircle, Plus, Send, Trash2 } from "lucide-react";
import { saveFormSchema } from "@/actions/workspace";
import { button } from "@/components/ui/button";
import { Alert, Card, inputClass } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";
import type { FormField, FormSchema, LocalText } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Question types the website editor offers (other types made in Admin are kept as they are). */
const TYPES = ["text", "textarea", "number", "date", "select", "multi_select", "boolean", "file", "note"] as const;
type EditableType = (typeof TYPES)[number];

type Draft = {
  key: string;
  type: string;
  label: string;
  hint: string;
  required: boolean;
  /** select / multi_select: one option per line */
  options: string;
  maxCount: number;
  /** properties this editor does not show, kept on save */
  rest: Record<string, unknown>;
};

const text = (v: LocalText | undefined, lang: string) =>
  v === undefined ? "" : typeof v === "string" ? v : (v[lang] ?? v.th ?? Object.values(v)[0] ?? "");

function toDrafts(schema: FormSchema | null, lang: string): Draft[] {
  const fields = schema?.sections.flatMap((s) => s.fields) ?? [];
  return fields.map((f) => {
    const { key, type, label, hint, required, options, max_count, ...rest } = f;
    return {
      key,
      type,
      label: text(label, lang),
      hint: text(hint, lang),
      required: !!required,
      options: (options ?? []).map((o) => text(o.label, lang) || o.value).join("\n"),
      maxCount: typeof max_count === "number" ? max_count : 5,
      rest,
    };
  });
}

/** The same text in both languages (the editor writes one). */
const both = (s: string) => ({ th: s, en: s });

function toSchema(drafts: Draft[], title: string): FormSchema {
  const fields: FormField[] = drafts.map((d) => {
    const field: FormField = { ...d.rest, key: d.key, type: d.type, label: both(d.label.trim()) };
    if (d.hint.trim()) field.hint = both(d.hint.trim());
    if (d.type !== "note" && d.required) field.required = true;
    if (d.type === "select" || d.type === "multi_select") {
      field.options = d.options
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean)
        .map((label, i) => ({ value: `o${i + 1}`, label: both(label) }));
    }
    if (d.type === "file") field.max_count = Math.max(1, Math.min(20, d.maxCount || 1));
    return field;
  });
  const titleField = drafts.find((d) => d.type === "text")?.key;
  return {
    version: 1,
    ...(titleField && { title_field: titleField }),
    sections: [{ key: "main", title: both(title), fields }],
  };
}

function nextKey(drafts: Draft[]): string {
  const used = new Set(drafts.map((d) => d.key));
  for (let i = drafts.length + 1; ; i++) if (!used.has(`q${i}`)) return `q${i}`;
}

export function FormBuilder({
  formId,
  app,
  title,
  initial,
  lang,
  t,
}: {
  formId: string;
  app: string;
  title: string;
  initial: FormSchema | null;
  lang: string;
  t: Pick<Dictionary, "forms">;
}) {
  const f = t.forms;
  const [drafts, setDrafts] = useState<Draft[]>(() => toDrafts(initial, lang));
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string; problems?: string[] } | null>(null);
  const [pending, start] = useTransition();

  const update = (i: number, patch: Partial<Draft>) => setDrafts((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const move = (i: number, by: number) =>
    setDrafts((ds) => {
      const next = [...ds];
      const [it] = next.splice(i, 1);
      next.splice(Math.max(0, Math.min(next.length, i + by)), 0, it);
      return next;
    });
  const add = () =>
    setDrafts((ds) => [
      ...ds,
      {
        key: nextKey(ds),
        type: app === "documents" ? "file" : "text",
        label: "",
        hint: "",
        required: true,
        options: "",
        maxCount: 5,
        rest: {},
      },
    ]);

  const save = (publish: boolean) => {
    if (!drafts.length || drafts.some((d) => !d.label.trim())) {
      setMessage({ tone: "danger", text: f.needQuestion });
      return;
    }
    if (drafts.some((d) => (d.type === "select" || d.type === "multi_select") && !d.options.trim())) {
      setMessage({ tone: "danger", text: f.needOptions });
      return;
    }
    start(async () => {
      const res = await saveFormSchema(formId, toSchema(drafts, title), publish);
      setMessage(
        res.ok
          ? { tone: "success", text: res.published ? f.publishedOk : f.savedOk }
          : { tone: "danger", text: res.error, problems: res.problems },
      );
    });
  };

  return (
    <div className="space-y-4">
      {drafts.map((d, i) => (
        <Card key={d.key} className="space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
            <select
              aria-label={f.type}
              value={d.type}
              onChange={(e) => update(i, { type: e.target.value })}
              className={cn(inputClass, "w-auto py-2")}
            >
              {!TYPES.includes(d.type as EditableType) && <option value={d.type}>{d.type}</option>}
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {f.types[type]}
                </option>
              ))}
            </select>
            {d.type !== "note" && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={d.required} onChange={(e) => update(i, { required: e.target.checked })} />
                {f.required}
              </label>
            )}
            <div className="ml-auto flex gap-1">
              <button type="button" aria-label={f.moveUp} disabled={i === 0} onClick={() => move(i, -1)} className={button({ variant: "ghost", size: "icon", className: "size-9" })}>
                <ArrowUp />
              </button>
              <button
                type="button"
                aria-label={f.moveDown}
                disabled={i === drafts.length - 1}
                onClick={() => move(i, 1)}
                className={button({ variant: "ghost", size: "icon", className: "size-9" })}
              >
                <ArrowDown />
              </button>
              <button
                type="button"
                aria-label={f.remove}
                onClick={() => setDrafts((ds) => ds.filter((_, j) => j !== i))}
                className={button({ variant: "ghost", size: "icon", className: "size-9 text-danger" })}
              >
                <Trash2 />
              </button>
            </div>
          </div>
          <input
            aria-label={f.question}
            placeholder={f.question}
            value={d.label}
            maxLength={500}
            onChange={(e) => update(i, { label: e.target.value })}
            className={inputClass}
          />
          <input
            aria-label={f.hint}
            placeholder={f.hint}
            value={d.hint}
            maxLength={500}
            onChange={(e) => update(i, { hint: e.target.value })}
            className={cn(inputClass, "py-2 text-xs")}
          />
          {(d.type === "select" || d.type === "multi_select") && (
            <textarea
              aria-label={f.options}
              placeholder={f.options}
              rows={4}
              value={d.options}
              onChange={(e) => update(i, { options: e.target.value })}
              className={inputClass}
            />
          )}
          {d.type === "file" && (
            <label className="flex items-center gap-3 text-sm">
              {f.maxFiles}
              <input
                type="number"
                min={1}
                max={20}
                value={d.maxCount}
                onChange={(e) => update(i, { maxCount: Number(e.target.value) })}
                className={cn(inputClass, "w-24 py-2")}
              />
            </label>
          )}
        </Card>
      ))}
      <button type="button" onClick={add} className={button({ variant: "outline", className: "w-full border-dashed" })}>
        <Plus />
        {f.addQuestion}
      </button>
      {message && (
        <Alert tone={message.tone}>
          {message.text}
          {message.problems && (
            <ul className="mt-1 list-disc pl-5 text-xs">
              {message.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => save(true)} className={button({ variant: "brand" })}>
          {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
          {f.publish}
        </button>
        <button type="button" disabled={pending} onClick={() => save(false)} className={button({ variant: "outline" })}>
          {f.saveDraft}
        </button>
      </div>
    </div>
  );
}
