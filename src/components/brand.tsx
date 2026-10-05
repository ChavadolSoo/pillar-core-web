import Image from "next/image";
import { cn } from "@/lib/utils";

/** The Pillar Core mark (the logo without its lettering). */
export function BrandMark({ size = 40, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src={size > 128 ? "/brand/pillarcore-mark.png" : "/brand/pillarcore-mark-256.png"}
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 select-none", className)}
    />
  );
}

/**
 * The wordmark is set in code (Kanit, like the logo's geometric lettering):
 * "Pillar" follows the theme's text colour, "Core" carries the brand gradient.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-semibold tracking-tight", className)}>
      Pillar<span className="text-brand">Core</span>
    </span>
  );
}

export function Logo({ size = 36, className, wordmarkClassName }: { size?: number; className?: string; wordmarkClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark size={size} priority />
      <Wordmark className={cn("text-xl", wordmarkClassName)} />
    </span>
  );
}
