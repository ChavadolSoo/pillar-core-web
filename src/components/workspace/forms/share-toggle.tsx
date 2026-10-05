"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { setFormSharing } from "@/actions/workspace";
import { button } from "@/components/ui/button";

export function ShareToggle({ id, shared, labels }: { id: string; shared: boolean; labels: { on: string; off: string } }) {
  const [state, action, pending] = useActionState(setFormSharing, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="public" value={String(!shared)} />
      <button type="submit" disabled={pending} className={button({ variant: shared ? "outline" : "brand", size: "sm" })}>
        {pending && <LoaderCircle className="animate-spin" />}
        {shared ? labels.off : labels.on}
      </button>
      {state?.error && <p className="mt-1 text-xs text-danger">{state.error}</p>}
    </form>
  );
}
