"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/** A read-only URL (path made absolute in the browser) with a copy button. */
export function CopyField({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = useState(false);
  // the origin is only known in the browser (no hydration mismatch: "" on the server)
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const url = `${origin}${path}`;
  return (
    <div className="flex gap-2">
      <input readOnly value={url} className={cn(inputClass, "font-mono text-xs")} onFocus={(e) => e.target.select()} />
      <button
        type="button"
        aria-label={label}
        className={button({ variant: "outline", size: "icon", className: "size-12" })}
        onClick={() => navigator.clipboard.writeText(url).then(() => setCopied(true))}
      >
        {copied ? <CheckCircle2 className="text-success" /> : <Copy />}
      </button>
    </div>
  );
}
