"use client";

import { useActionState, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { createOrganization } from "@/actions/workspace";
import { button } from "@/components/ui/button";
import { Alert, Field, inputClass } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";

/** "บ้านสวน Clinic" -> "clinic"; Thai letters drop out, so people usually type the code. */
function suggestCode(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function CreateOrgForm({ t }: { t: Pick<Dictionary, "workspace" | "common"> }) {
  const [state, action, pending] = useActionState(createOrganization, undefined);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const w = t.workspace;
  return (
    <form action={action} className="max-w-xl space-y-5">
      <p className="text-muted-foreground">{w.createLead}</p>
      <Field label={w.orgName} htmlFor="org-name" error={state?.field === "name" ? t.common.required : undefined}>
        <input
          id="org-name"
          name="name"
          required
          maxLength={120}
          value={name}
          placeholder={w.orgNamePlaceholder}
          onChange={(e) => {
            setName(e.target.value);
            if (!touched) setCode(suggestCode(e.target.value));
          }}
          className={inputClass}
        />
      </Field>
      <Field
        label={w.orgCode}
        htmlFor="org-code"
        hint={w.orgCodeHint}
        error={state?.field === "code" ? (state.error === "taken" ? w.codeTaken : w.orgCodeHint) : undefined}
      >
        <input
          id="org-code"
          name="code"
          required
          pattern="[a-z0-9][a-z0-9\-]{1,38}[a-z0-9]"
          value={code}
          onChange={(e) => {
            setTouched(true);
            setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
          }}
          className={`${inputClass} font-mono`}
        />
      </Field>
      {state?.error && state.error !== "taken" && <Alert tone="danger">{state.error}</Alert>}
      <button type="submit" disabled={pending} className={button({ variant: "brand", size: "lg" })}>
        {pending && <LoaderCircle className="animate-spin" />}
        {pending ? w.creating : w.create}
      </button>
    </form>
  );
}
