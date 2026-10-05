import { BrandMark } from "@/components/brand";
import { AppLogo } from "@/components/cards";
import type { SiteApp } from "@/lib/types";

/**
 * Hero visual: the Pillar Core mark with the platform's apps orbiting it.
 * Pure CSS: the ring rotates and each logo counter-rotates to stay upright.
 */
export function HeroOrbit({ apps }: { apps: SiteApp[] }) {
  const inner = apps.slice(0, 3);
  const outer = apps.slice(3, 8);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      <div className="animate-glow absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(255,122,26,0.55),rgba(236,59,30,0.15)_45%,transparent_70%)] blur-2xl" />
      <Ring apps={inner} inset="14%" className="animate-orbit" counter="animate-orbit-reverse [animation-duration:28s]" />
      <Ring apps={outer} inset="0%" className="animate-orbit-reverse" counter="animate-orbit [animation-duration:40s]" dashed />
      <div className="absolute inset-[24%] grid place-items-center">
        <BrandMark size={320} priority className="animate-float size-full drop-shadow-[0_20px_40px_rgba(242,96,12,0.35)]" />
      </div>
    </div>
  );
}

function Ring({
  apps,
  inset,
  className,
  counter,
  dashed,
}: {
  apps: SiteApp[];
  inset: string;
  className: string;
  counter: string;
  dashed?: boolean;
}) {
  return (
    <div
      className={`absolute rounded-full border ${dashed ? "border-dashed border-primary/25" : "border-primary/30"} ${className}`}
      style={{ inset }}
    >
      {[25, 150, 245].map((deg) => (
        <span
          key={deg}
          aria-hidden
          className="bg-brand absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_14px_3px_rgba(255,122,26,0.55)]"
          style={{ left: `${50 + 50 * Math.cos((deg * Math.PI) / 180)}%`, top: `${50 + 50 * Math.sin((deg * Math.PI) / 180)}%` }}
        />
      ))}
      {apps.map((app, i) => {
        const angle = ((2 * Math.PI) / Math.max(apps.length, 1)) * i - Math.PI / 2;
        return (
          <div
            key={app.code}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` }}
          >
            <div className={counter}>
              <AppLogo app={app} size={52} className="ring-4 ring-background" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
