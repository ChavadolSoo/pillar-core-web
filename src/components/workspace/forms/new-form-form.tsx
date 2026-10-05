"use client";

import { useActionState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { createForm } from "@/actions/workspace";
import { button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";

export function NewFormForm({ app, t }: { app: "forms" | "documents"; t: Pick<Dictionary, "forms" | "common"> }) {
  const [state, action, pending] = useActionState(createForm, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="app" value={app} />
      <Field label={t.forms.name} htmlFor="form-name" error={state?.field === "name" ? t.common.required : undefined}>
        <input id="form-name" name="name" required maxLength={200} className={inputClass} />
      </Field>
      <Field label={t.forms.description} htmlFor="form-description">
        <textarea id="form-description" name="description" rows={3} maxLength={1000} className={inputClass} />
      </Field>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className={button({ variant: "brand", className: "w-full" })}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
        {t.forms.create}
      </button>
    </form>
  );
}
