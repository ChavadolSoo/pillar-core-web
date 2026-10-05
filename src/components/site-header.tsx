import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import { Logo } from "@/components/brand";
import { LanguageSwitch, MobileMenu, NavLinks, ThemeSwitch, UserMenu } from "@/components/header-client";
import { Container } from "@/components/ui/primitives";
import { button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import { getViewer } from "@/lib/session";

export async function SiteHeader() {
  const [{ lang, t }, viewer] = await Promise.all([getDictionary(), getViewer()]);
  const items = [
    { href: href(lang, "/"), label: t.nav.home },
    { href: href(lang, "/apps"), label: t.nav.apps },
    { href: href(lang, "/marketplace"), label: t.nav.marketplace },
    { href: href(lang, "/news"), label: t.nav.news },
    { href: href(lang, "/support"), label: t.nav.support },
  ];
  const accountLinks = [
    { href: href(lang, "/account"), label: t.account.overview },
    { href: href(lang, "/account/purchases"), label: t.account.purchases },
    { href: href(lang, "/account/orders"), label: t.account.orders },
    { href: href(lang, "/account/tickets"), label: t.account.tickets },
  ];
  const signInLinks = (
    <div className="flex items-center gap-2">
      <Link href={href(lang, "/login")} className={button({ variant: "ghost", size: "sm" })}>
        {t.nav.signIn}
      </Link>
      <Link href={`${href(lang, "/login")}?mode=register`} className={button({ variant: "brand", size: "sm" })}>
        {t.nav.signUp}
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center gap-4">
        <Link href={href(lang, "/")} aria-label="Pillar Core" className="shrink-0">
          <Logo size={36} />
        </Link>
        <div className="flex flex-1 justify-center">
          <NavLinks items={items} />
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitch lang={lang} label={t.language.label} />
          <ThemeSwitch labels={t.theme} />
          <div className="ml-1 hidden sm:block">
            {viewer ? (
              <UserMenu
                name={viewer.name}
                email={viewer.email}
                links={accountLinks}
                signOutLabel={t.nav.signOut}
                signOut={signOutAction}
              />
            ) : (
              signInLinks
            )}
          </div>
          <MobileMenu
            items={viewer ? [...items, { href: href(lang, "/account"), label: t.nav.account }] : items}
            labels={{ menu: t.nav.menu, close: t.nav.close }}
            extra={
              viewer ? (
                <form action={signOutAction}>
                  <p className="mb-3 truncate text-sm text-muted-foreground">{viewer.email}</p>
                  <button type="submit" className={button({ variant: "danger", className: "w-full" })}>
                    {t.nav.signOut}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={href(lang, "/login")} className={button({ variant: "outline" })}>
                    {t.nav.signIn}
                  </Link>
                  <Link href={`${href(lang, "/login")}?mode=register`} className={button({ variant: "brand" })}>
                    {t.nav.signUp}
                  </Link>
                </div>
              )
            }
          />
        </div>
      </Container>
    </header>
  );
}
