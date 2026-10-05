"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, Copy, LoaderCircle, Send } from "lucide-react";
import { submitTicket } from "@/actions/support";
import { button } from "@/components/ui/button";
import { Alert, Field, inputClass } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, href, type Locale } from "@/lib/i18n";
import { TICKET_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

type AppOption = { code: string; name: string; color: string };

export function SupportForm({
  apps,
  lang,
  t,
  viewer,
  defaultApp,
}: {
  apps: AppOption[];
  lang: Locale;
  t: Pick<Dictionary, "support" | "common" | "account">;
  viewer: { name: string; email: string } | null;
  defaultApp?: string;
}) {
  const [state, action, pending] = useActionState(submitTicket, undefined);
  const [app, setApp] = useState(defaultApp ?? "");
  const [copied, setCopied] = useState(false);
  const s = t.support;

  if (state?.ok) {
    const trackUrl = state.token
      ? `${window.location.origin}${href(lang, "/support/track")}?number=${state.number}&token=${encodeURIComponent(state.token)}`
      : null;
    return (
      <div className="animate-rise flex flex-col items-center px-4 py-10 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">{s.successTitle}</h2>
        <p className="mt-2 text-muted-foreground">{fill(s.successBody, { number: state.number })}</p>
        {trackUrl && (
          <div className="mt-6 w-full max-w-lg text-left">
            <p className="mb-2 text-sm font-medium">{s.trackLink}</p>
            <div className="flex gap-2">
              <input readOnly value={trackUrl} className={cn(inputClass, "font-mono text-xs")} onFocus={(e) => e.target.select()} />
              <button
                type="button"
                className={button({ variant: "outline", size: "icon", className: "size-12" })}
                onClick={() => navigator.clipboard.writeText(trackUrl).then(() => setCopied(true))}
                aria-label="Copy"
              >
                {copied ? <CheckCircle2 className="text-success" /> : <Copy />}
              </button>
            </div>
          </div>
        )}
        <Link
          href={state.id ? href(lang, `/account/tickets/${state.id}`) : (trackUrl ?? href(lang, "/support"))}
          className={button({ variant: "brand", className: "mt-8" })}
        >
          {s.openTicket}
        </Link>
      </div>
    );
  }

  const err = (key: "subject" | "message" | "contact_name" | "contact_email" | "category") => {
    const f = state && !state.ok ? state.fields?.[key] : undefined;
    if (!f) return undefined;
    return f === "email" ? t.common.invalidEmail : t.common.required;
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="app_code" value={app} />
      <fieldset>
        <legend className="mb-3 text-sm font-medium">{s.app}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[...apps, { code: "other", name: s.other, color: "" }].map((a) => (
            <button
              key={a.code}
              type="button"
              onClick={() => setApp(a.code)}
              aria-pressed={app === a.code}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all",
                app === a.code ? "border-primary bg-primary-soft ring-4 ring-primary/10" : "border-border bg-card hover:border-primary/40",
              )}
            >
              {a.color ? (
                <span className="grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: a.color }}>
                  {a.name.charAt(0)}
                </span>
              ) : (
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">?</span>
              )}
              <span className="line-clamp-2">{a.name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={s.category} htmlFor="category" error={err("category")}>
          <select id="category" name="category" defaultValue="QUESTION" className={inputClass}>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {s.categories[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={s.subject} htmlFor="subject" error={err("subject")}>
          <input id="subject" name="subject" required minLength={3} maxLength={200} className={inputClass} />
        </Field>
      </div>

      <Field label={s.message} htmlFor="message" hint={s.messageHint} error={err("message")}>
        <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} className={cn(inputClass, "resize-y")} />
      </Field>

      {viewer ? (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">{fill(s.signedInAs, { email: viewer.email })}</p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={s.name} htmlFor="contact_name" error={err("contact_name")}>
              <input id="contact_name" name="contact_name" required maxLength={120} autoComplete="name" className={inputClass} />
            </Field>
            <Field label={s.email} htmlFor="contact_email" error={err("contact_email")}>
              <input id="contact_email" name="contact_email" type="email" required autoComplete="email" className={inputClass} />
            </Field>
          </div>
          <Field label={s.phone} htmlFor="contact_phone">
            <input id="contact_phone" name="contact_phone" type="tel" maxLength={30} autoComplete="tel" className={inputClass} />
          </Field>
          <p className="text-sm text-muted-foreground">
            {s.guestNote}{" "}
            <Link href={`${href(lang, "/login")}?callbackUrl=${encodeURIComponent(href(lang, "/support"))}`} className="font-medium text-primary hover:underline">
              {s.guestSignIn}
            </Link>
          </p>
        </>
      )}

      {state && !state.ok && state.error && <Alert tone="danger">{state.error}</Alert>}

      <button type="submit" disabled={pending || !app} className={button({ variant: "brand", size: "lg", className: "w-full sm:w-auto" })}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
        {pending ? s.sending : s.submit}
      </button>
    </form>
  );
}
