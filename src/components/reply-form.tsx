"use client";

import { useActionState, useRef } from "react";
import { LoaderCircle, Send } from "lucide-react";
import type { ReplyState } from "@/actions/support";
import { button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/** Reply box under a ticket; clears itself after a successful send. */
export function ReplyForm({
  action,
  fields,
  labels,
  children,
}: {
  action: (state: ReplyState, formData: FormData) => Promise<ReplyState>;
  fields: Record<string, string>;
  labels: { placeholder: string; send: string };
  /** Extra controls next to the send button */
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: ReplyState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result?.ok) ref.current?.reset();
    return result;
  }, undefined);
  return (
    <form ref={ref} action={formAction} className="rounded-3xl border border-border bg-card p-3">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <textarea
        name="message"
        required
        maxLength={5000}
        rows={3}
        placeholder={labels.placeholder}
        className={cn(inputClass, "resize-y border-0 bg-transparent focus:ring-0")}
      />
      <div className="flex items-center justify-between gap-3 px-2 pb-1">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {children}
          <p className="text-sm text-danger">{state?.error}</p>
        </div>
        <button type="submit" disabled={pending} className={button({ variant: "brand", size: "sm" })}>
          {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
          {labels.send}
        </button>
      </div>
    </form>
  );
}
