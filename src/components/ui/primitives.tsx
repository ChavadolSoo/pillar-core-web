import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-3xl border border-border bg-card text-card-foreground", className)}>{children}</div>;
}

type Tone = "neutral" | "primary" | "teal" | "violet" | "success" | "danger" | "amber";
const tones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-soft text-primary-soft-foreground",
  teal: "bg-teal-soft text-teal",
  violet: "bg-violet-soft text-violet",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  amber: "bg-amber/15 text-amber",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>}
        <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
        {lead && <p className="mt-3 text-base text-muted-foreground sm:text-lg">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <Container className="relative py-14 sm:py-20">
        <h1 className="animate-rise text-4xl font-semibold sm:text-5xl">{title}</h1>
        {lead && <p className="animate-rise mt-4 max-w-2xl text-lg text-muted-foreground [animation-delay:80ms]">{lead}</p>}
        {children}
      </Container>
    </section>
  );
}

export function EmptyState({ icon, title, action }: { icon?: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
      {icon && <div className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary [&_svg]:size-6">{icon}</div>}
      <p className="text-muted-foreground">{title}</p>
      {action}
    </div>
  );
}

export function Alert({ tone = "primary", children }: { tone?: "primary" | "success" | "danger"; children: React.ReactNode }) {
  const cls = {
    primary: "border-primary/30 bg-primary-soft text-primary-soft-foreground",
    success: "border-success/30 bg-success-soft text-success",
    danger: "border-danger/30 bg-danger-soft text-danger",
  }[tone];
  return <div className={cn("rounded-2xl border px-4 py-3 text-sm", cls)}>{children}</div>;
}

/** Label + control + error, for plain forms. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-60";
