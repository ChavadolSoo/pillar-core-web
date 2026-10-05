"use client";

import { useActionState, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import { setHelpdeskStatus } from "@/actions/workspace";
import { inputClass } from "@/components/ui/primitives";
import type { TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"];

/** Changes a helpdesk ticket's status as soon as another one is picked. */
export function StatusSelect({
  id,
  version,
  status,
  labels,
}: {
  id: string;
  version: number;
  status: TicketStatus;
  labels: { title: string; status: Record<TicketStatus, string> };
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(setHelpdeskStatus, undefined);
  return (
    <form ref={ref} action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={version} />
      <select
        name="status"
        aria-label={labels.title}
        defaultValue={status}
        key={`${status}-${version}`}
        disabled={pending}
        onChange={() => ref.current?.requestSubmit()}
        className={cn(inputClass, "w-auto py-2")}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {labels.status[s]}
          </option>
        ))}
      </select>
      {pending && <LoaderCircle className="size-4 animate-spin text-muted-foreground" />}
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
