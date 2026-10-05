"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { toggleService } from "@/actions/workspace";
import { button } from "@/components/ui/button";

/** On/off button of one web service (organization admins). */
export function ServiceToggle({ code, on, labels }: { code: string; on: boolean; labels: { enable: string; disable: string } }) {
  const [state, action, pending] = useActionState(toggleService, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="on" value={String(!on)} />
      <button type="submit" disabled={pending} className={button({ variant: on ? "ghost" : "brand", size: "sm" })}>
        {pending && <LoaderCircle className="animate-spin" />}
        {on ? labels.disable : labels.enable}
      </button>
      {state?.error && <p className="mt-1 text-xs text-danger">{state.error}</p>}
    </form>
  );
}
