"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { renameOrganization } from "@/actions/workspace";
import { button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/primitives";

export function RenameOrg({ name, labels }: { name: string; labels: { rename: string; save: string; saved: string } }) {
  const [state, action, pending] = useActionState(renameOrganization, undefined);
  return (
    <form action={action} className="space-y-2">
      <label htmlFor="org-rename" className="text-sm font-medium">
        {labels.rename}
      </label>
      <div className="flex gap-2">
        <input id="org-rename" name="name" defaultValue={name} required maxLength={120} className={inputClass} />
        <button type="submit" disabled={pending} className={button({ variant: "outline", className: "h-12" })}>
          {pending && <LoaderCircle className="animate-spin" />}
          {labels.save}
        </button>
      </div>
      {state?.ok && <p className="text-xs text-success">{labels.saved}</p>}
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
