import Link from "next/link";
import { Logo } from "@/components/brand";
import { Container } from "@/components/ui/primitives";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import type { SiteApp } from "@/lib/types";

export async function SiteFooter({ apps }: { apps: SiteApp[] }) {
  const { lang, t } = await getDictionary();
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@pillarcore.app";
  const columns = [
    {
      title: t.footer.product,
      links: [
        ...apps.slice(0, 4).map((a) => ({ href: href(lang, `/apps/${a.code}`), label: a.name })),
        { href: href(lang, "/marketplace"), label: t.nav.marketplace },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: href(lang, "/apps"), label: t.nav.apps },
        { href: href(lang, "/news"), label: t.nav.news },
      ],
    },
    {
      title: t.footer.help,
      links: [
        { href: href(lang, "/support"), label: t.footer.contact },
        { href: href(lang, "/support/track"), label: t.footer.track },
        { href: href(lang, "/account"), label: t.nav.account },
      ],
    },
  ];
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-card">
      <div className="bg-brand absolute inset-x-0 top-0 h-px opacity-60" />
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo size={44} wordmarkClassName="text-2xl" />
          <p className="max-w-xs text-sm text-muted-foreground">{t.footer.tagline}</p>
          <a href={`mailto:${contactEmail}`} className="text-sm font-medium text-primary hover:underline">
            {contactEmail}
          </a>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-semibold">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} Pillar Core. {t.footer.rights}
          </p>
          <p>{t.footer.tagline}</p>
        </Container>
      </div>
    </footer>
  );
}
