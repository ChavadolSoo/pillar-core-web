import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";

export default async function NotFound() {
  const { lang, t } = await getDictionary();
  return (
    <Container className="flex flex-col items-center py-28 text-center">
      <BrandMark size={120} className="animate-float opacity-90" />
      <p className="text-brand mt-6 font-display text-6xl font-bold">404</p>
      <h1 className="mt-4 text-3xl font-semibold">{t.common.notFoundTitle}</h1>
      <p className="mt-2 text-muted-foreground">{t.common.notFoundBody}</p>
      <Link href={href(lang, "/")} className={button({ variant: "brand", className: "mt-8" })}>
        {t.common.backHome}
      </Link>
    </Container>
  );
}
