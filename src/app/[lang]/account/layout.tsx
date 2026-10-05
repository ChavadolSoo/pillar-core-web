import { AccountNav } from "@/components/account-nav";
import { Container } from "@/components/ui/primitives";
import { getDictionary } from "@/lib/dictionaries";
import { fill, href } from "@/lib/i18n";
import { requireViewer } from "@/lib/account";

export default async function AccountLayout({ children }: LayoutProps<"/[lang]/account">) {
  const { lang, t } = await getDictionary();
  const viewer = await requireViewer(href(lang, "/account"));
  const initial = (viewer.name || viewer.email).charAt(0).toUpperCase();
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-primary/15 blur-3xl" />
        <Container className="relative flex items-center gap-4 pt-10 pb-6">
          <span className="bg-brand grid size-14 place-items-center rounded-2xl font-display text-2xl font-semibold text-white shadow-soft">{initial}</span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold sm:text-3xl">{fill(t.account.hello, { name: viewer.name || viewer.email })}</h1>
            <p className="truncate text-sm text-muted-foreground">{viewer.email}</p>
          </div>
        </Container>
        <Container>
          <AccountNav
            items={[
              { href: href(lang, "/account"), label: t.account.overview },
              { href: href(lang, "/account/purchases"), label: t.account.purchases },
              { href: href(lang, "/account/orders"), label: t.account.orders },
              { href: href(lang, "/account/tickets"), label: t.account.tickets },
            ]}
          />
        </Container>
      </section>
      <Container className="py-10">{children}</Container>
    </>
  );
}
