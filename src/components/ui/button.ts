import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "brand" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
  brand: "bg-brand text-white shadow-[0_10px_30px_-10px_rgba(242,96,12,0.65)] hover:brightness-110",
  secondary: "bg-foreground text-background hover:opacity-90",
  outline: "border border-border bg-card/60 text-foreground backdrop-blur hover:border-primary/50 hover:text-primary",
  ghost: "text-foreground hover:bg-muted",
  danger: "border border-danger/30 text-danger hover:bg-danger-soft",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
  icon: "size-10",
};

/** Class names for buttons and button-looking links. */
export function button({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
    variants[variant],
    sizes[size],
    className,
  );
}
