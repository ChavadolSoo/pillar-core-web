"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import type { ActionState } from "@/actions/marketplace";
import { button, type ButtonVariant } from "@/components/ui/button";

/**
 * A one-button form bound to a Server Action, with a pending spinner and the
 * action's error under it. Hidden fields go in `fields`.
 */
export function ActionButton({
  action,
  fields,
  children,
  variant = "brand",
  size = "lg",
  className,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" disabled={pending} className={button({ variant, size, className: "w-full" })}>
        {pending && <LoaderCircle className="animate-spin" />}
        {children}
      </button>
      {state?.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
