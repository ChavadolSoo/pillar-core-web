import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail, UserPlus } from "lucide-react";
import { startSignIn } from "@/actions/auth";
import { BrandMark, Wordmark } from "@/components/brand";
import { SocialIcon } from "@/components/social-icons";
import { button } from "@/components/ui/button";
import { Alert } from "@/components/ui/primitives";
import { getDictionary } from "@/lib/dictionaries";
import { fill, href } from "@/lib/i18n";
import { getViewer } from "@/lib/session";
import { enabledSocialProviders } from "@/lib/social";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.login.title, robots: { index: false } };
}

export default async function LoginPage(props: PageProps<"/[lang]/login">) {
  const sp = await props.searchParams;
  const [{ lang, t }, viewer] = await Promise.all([getDictionary(), getViewer()]);
  const callbackUrl = typeof sp.callbackUrl === "string" && sp.callbackUrl.startsWith("/") && !sp.callbackUrl.startsWith("//") ? sp.callbackUrl : href(lang, "/account");
  if (viewer) redirect(callbackUrl);

  const register = sp.mode === "register";
  const error = typeof sp.error === "string" ? sp.error : null;
  const errorText = error ? (t.login.errors[error as keyof typeof t.login.errors] ?? t.login.errors.default) : null;
  const providers = enabledSocialProviders();
  const hidden = (
    <>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
    </>
  );

  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute top-0 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
        <div className="hidden lg:block">
          <BrandMark size={360} priority className="animate-float drop-shadow-[0_30px_60px_rgba(242,96,12,0.35)]" />
          <p className="mt-6 max-w-sm text-lg text-muted-foreground">{t.footer.tagline}</p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-border bg-card/90 p-8 shadow-lift backdrop-blur sm:p-10">
          <div className="flex items-center gap-2 lg:hidden">
            <BrandMark size={44} />
            <Wordmark className="text-2xl" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold lg:mt-0">{register ? t.login.register : t.login.title}</h1>
          <p className="mt-2 text-muted-foreground">{register ? t.login.registerNote : t.login.lead}</p>

          {errorText && (
            <div className="mt-6">
              <Alert tone="danger">{errorText}</Alert>
            </div>
          )}

          {providers.length > 0 && (
            <div className="mt-8 space-y-3">
              {providers.map((p) => (
                <form key={p.id} action={startSignIn}>
                  {hidden}
                  <input type="hidden" name="provider" value={p.id} />
                  <button type="submit" className={button({ variant: "outline", size: "lg", className: "w-full justify-start gap-3 bg-card [&_svg]:size-5" })}>
                    <SocialIcon id={p.id} />
                    <span className="flex-1 text-center">{fill(t.login.with, { provider: p.name })}</span>
                  </button>
                </form>
              ))}
            </div>
          )}

          {providers.length > 0 && (
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              {t.login.or}
              <span className="h-px flex-1 bg-border" />
            </div>
          )}

          <div className={cn("space-y-3", !providers.length && "mt-8")}>
            <form action={startSignIn}>
              {hidden}
              {register && <input type="hidden" name="mode" value="register" />}
              <button type="submit" className={button({ variant: "brand", size: "lg", className: "w-full" })}>
                {register ? <UserPlus /> : <Mail />}
                {register ? t.login.register : t.login.email}
              </button>
            </form>
            <form action={startSignIn}>
              {hidden}
              {!register && <input type="hidden" name="mode" value="register" />}
              <p className="text-center text-sm text-muted-foreground">
                {register ? t.nav.signIn : t.login.noAccount}{" "}
                <button type="submit" className="font-medium text-primary hover:underline">
                  {register ? t.login.email : t.login.register}
                </button>
              </p>
            </form>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">{t.login.terms}</p>
        </div>
      </div>
    </div>
  );
}
