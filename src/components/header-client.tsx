"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, ChevronDown, Globe, LogOut, Menu, Monitor, Moon, Sun, UserRound, X } from "lucide-react";
import { button } from "@/components/ui/button";
import { LOCALE_COOKIE, switchLocalePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => {
    const depth = href.split("/").filter(Boolean).length;
    return depth <= 1 ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  };
}

/** Closes on outside click and Escape. */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

const menuPanel =
  "absolute right-0 top-full z-50 mt-2 min-w-48 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-lift animate-rise [animation-duration:180ms]";
const menuItem = "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted [&_svg]:size-4";

export function NavLinks({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();
  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            isActive(item.href) && "text-foreground",
          )}
        >
          {item.label}
          {isActive(item.href) && <span className="bg-brand absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full" />}
        </Link>
      ))}
    </nav>
  );
}

const subscribeNoop = () => () => {};
/** false during SSR and hydration, true afterwards (theme is only known on the client). */
const useMounted = () => useSyncExternalStore(subscribeNoop, () => true, () => false);

export function ThemeSwitch({ labels }: { labels: { label: string; light: string; dark: string; system: string } }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const { open, setOpen, ref } = usePopover();
  const options = [
    { value: "light", label: labels.light, icon: Sun },
    { value: "dark", label: labels.dark, icon: Moon },
    { value: "system", label: labels.system, icon: Monitor },
  ];
  const Icon = mounted && resolvedTheme === "dark" ? Moon : Sun;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={labels.label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={button({ variant: "ghost", size: "icon" })}
      >
        <Icon />
      </button>
      {open && (
        <div className={menuPanel} role="menu">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === o.value}
              className={menuItem}
              onClick={() => {
                setTheme(o.value);
                setOpen(false);
              }}
            >
              <o.icon />
              <span className="flex-1">{o.label}</span>
              {mounted && theme === o.value && <Check className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const LANGS: { value: Locale; label: string; short: string }[] = [
  { value: "th", label: "ไทย", short: "TH" },
  { value: "en", label: "English", short: "EN" },
];

/** The proxy reads this cookie to pick the language for paths without one. */
function rememberLocale(value: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const { open, setOpen, ref } = usePopover();
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={button({ variant: "ghost", size: "sm", className: "px-3" })}
      >
        <Globe />
        <span className="text-xs font-semibold">{lang.toUpperCase()}</span>
      </button>
      {open && (
        <div className={menuPanel} role="menu">
          {LANGS.map((l) => (
            <Link
              key={l.value}
              href={switchLocalePath(pathname, l.value)}
              role="menuitemradio"
              aria-checked={l.value === lang}
              onClick={() => {
                rememberLocale(l.value);
                setOpen(false);
              }}
              className={menuItem}
            >
              <span className="w-6 text-xs font-semibold text-muted-foreground">{l.short}</span>
              <span className="flex-1">{l.label}</span>
              {l.value === lang && <Check className="text-primary" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function UserMenu({
  name,
  email,
  links,
  signOutLabel,
  signOut,
}: {
  name: string;
  email: string;
  links: NavItem[];
  signOutLabel: string;
  signOut: () => Promise<void>;
}) {
  const { open, setOpen, ref } = usePopover();
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-sm transition-colors hover:border-primary/50"
      >
        <span className="bg-brand grid size-8 place-items-center rounded-full text-sm font-semibold text-white">{initial}</span>
        <span className="hidden max-w-32 truncate font-medium sm:block">{name || email}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {open && (
        <div className={cn(menuPanel, "min-w-60")} role="menu">
          <div className="border-b border-border px-3 pt-2 pb-3">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="py-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={menuItem} onClick={() => setOpen(false)}>
                <UserRound />
                {l.label}
              </Link>
            ))}
          </div>
          <form action={signOut} className="border-t border-border pt-1">
            <button type="submit" className={cn(menuItem, "text-danger")}>
              <LogOut />
              {signOutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function MobileMenu({
  items,
  extra,
  labels,
}: {
  items: NavItem[];
  extra: React.ReactNode;
  labels: { menu: string; close: string };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = useIsActive();
  // Close when the route changes (tracked during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? labels.close : labels.menu}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={button({ variant: "ghost", size: "icon" })}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-background/98 backdrop-blur-xl">
          <nav className="flex flex-col gap-1 p-4">
            {items.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${i * 40}ms` }}
                className={cn(
                  "animate-rise rounded-2xl px-4 py-3.5 font-display text-xl font-medium",
                  isActive(item.href) ? "bg-primary-soft text-primary-soft-foreground" : "hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4">{extra}</div>
        </div>
      )}
    </div>
  );
}
