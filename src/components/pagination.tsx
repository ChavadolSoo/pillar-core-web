import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { button } from "@/components/ui/button";
import { fill } from "@/lib/i18n";

/** Prev / next links that keep the other search params. */
export function Pagination({
  page,
  total,
  limit,
  basePath,
  params,
  labels,
}: {
  page: number;
  total: number;
  limit: number;
  basePath: string;
  params: Record<string, string | undefined>;
  labels: { prev: string; next: string; page: string };
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  const to = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <nav className="mt-12 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={to(page - 1)} className={button({ variant: "outline", size: "sm" })}>
          <ChevronLeft /> {labels.prev}
        </Link>
      ) : (
        <span className={button({ variant: "outline", size: "sm", className: "pointer-events-none opacity-40" })}>
          <ChevronLeft /> {labels.prev}
        </span>
      )}
      <span className="text-sm text-muted-foreground">{fill(labels.page, { page, pages })}</span>
      {page < pages ? (
        <Link href={to(page + 1)} className={button({ variant: "outline", size: "sm" })}>
          {labels.next} <ChevronRight />
        </Link>
      ) : (
        <span className={button({ variant: "outline", size: "sm", className: "pointer-events-none opacity-40" })}>
          {labels.next} <ChevronRight />
        </span>
      )}
    </nav>
  );
}
