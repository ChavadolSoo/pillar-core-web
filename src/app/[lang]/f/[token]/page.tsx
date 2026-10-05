import type { Metadata } from "next";
import Link from "next/link";
import { Ban } from "lucide-react";
import { PublicFormView } from "@/components/public-form/public-form-view";
import { button } from "@/components/ui/button";
import { Card, Container } from "@/components/ui/primitives";
import { getPublicForm } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { fill, href, tx } from "@/lib/i18n";

export async function generateMetadata(props: PageProps<"/[lang]/f/[token]">): Promise<Metadata> {
  const [{ token }, { lang }] = await Promise.all([props.params, getDictionary()]);
  const form = await getPublicForm(token);
  const title = form && form !== "off" ? tx(form.name, lang) : undefined;
  return { title, robots: { index: false, follow: false } };
}

/** A form shared by an organization: anyone with the link fills it in. */
export default async function PublicFormPage(props: PageProps<"/[lang]/f/[token]">) {
  const [{ token }, { lang, t }] = await Promise.all([props.params, getDictionary()]);
  const form = /^[A-Za-z0-9_-]{16,64}$/.test(token) ? await getPublicForm(token) : null;
  const p = t.publicForm;

  if (!form || form === "off") {
    return (
      <Container className="max-w-2xl py-20">
        <Card className="flex flex-col items-center p-10 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <Ban className="size-7" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold">{p.closedTitle}</h1>
          <p className="mt-2 text-muted-foreground">{p.closedBody}</p>
          <Link href={href(lang)} className={button({ variant: "outline", className: "mt-8" })}>
            {t.common.backHome}
          </Link>
        </Card>
      </Container>
    );
  }

  const description = form.description ? tx(form.description, lang) : "";
  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <Card className="p-6 shadow-soft sm:p-10">
        {form.organization && <p className="text-sm font-medium text-primary">{fill(p.by, { org: form.organization.name })}</p>}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{tx(form.name, lang)}</h1>
        {description && <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{description}</p>}
        <div className="mt-8 border-t border-border pt-8">
          <PublicFormView token={token} schema={form.schema} maxFileBytes={form.max_file_bytes} lang={lang} t={{ publicForm: p, forms: t.forms }} />
        </div>
      </Card>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href={href(lang)} className="hover:text-primary">
          {p.poweredBy}
        </Link>
      </p>
    </Container>
  );
}
