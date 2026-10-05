import type { Metadata, Viewport } from "next";
import { Kanit, Noto_Sans_Thai } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getApps } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { locales } from "@/lib/i18n";
import "../globals.css";

/** Display face: geometric like the logo lettering, with Thai glyphs. */
const kanit = Kanit({ variable: "--font-kanit", subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"] });
const noto = Noto_Sans_Thai({ variable: "--font-noto", subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"] });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDictionary();
  const base = process.env.AUTH_URL ?? "http://localhost:3200";
  return {
    metadataBase: new URL(base),
    title: { default: t.meta.title, template: "%s · Pillar Core" },
    description: t.meta.description,
    applicationName: "Pillar Core",
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: {
      type: "website",
      siteName: "Pillar Core",
      title: t.meta.title,
      description: t.meta.description,
      locale: lang === "th" ? "th_TH" : "en_US",
      images: ["/brand/pillarcore-icon-512.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b10" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [{ lang }, apps] = await Promise.all([getDictionary(), getApps()]);
  return (
    <html lang={lang} suppressHydrationWarning className={`${kanit.variable} ${noto.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter apps={apps} />
        </ThemeProvider>
      </body>
    </html>
  );
}
