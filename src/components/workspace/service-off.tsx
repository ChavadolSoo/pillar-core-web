import Link from "next/link";
import { PowerOff } from "lucide-react";
import { button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";

/** Shown on a service page while the organization has it turned off. */
export function ServiceOff({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <EmptyState
      icon={<PowerOff />}
      title={t.workspace.serviceOff}
      action={
        <Link href={href(lang, "/workspace")} className={button({ variant: "outline", size: "sm" })}>
          {t.workspace.turnOnFirst}
        </Link>
      }
    />
  );
}
