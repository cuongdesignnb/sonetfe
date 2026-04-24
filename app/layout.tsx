import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserSecurityGuard } from "@/components/browser-security-guard";
import { AuthProvider } from "@/providers/auth-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import ToasterClient from "@/components/toaster-client";
import { SiteSettingsProvider } from "@/providers/site-settings-provider";
import { fetchSiteSettings, splitKeywords } from "@/lib/site-settings";
import { CustomScripts } from "@/components/custom-scripts";
import { resolveAssetUrl } from "@/lib/asset-url";

// Force dynamic rendering - settings will be fetched on every request
export const dynamic = "force-dynamic";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const faviconUrl =
    resolveAssetUrl(settings.site.favicon_url) || "/favicon.svg";

  return {
    title: {
      default: settings.seo.default_title,
      template: settings.seo.title_template,
    },
    description: settings.seo.default_description,
    keywords: splitKeywords(settings.seo.keywords),
    icons: {
      icon: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await fetchSiteSettings();
  const customCode = settings.custom_code;

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={beVietnamPro.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BrowserSecurityGuard />
          <AuthProvider>
            <SiteSettingsProvider settings={settings}>
              {/* Custom Scripts Injector (handles head, body start, body end scripts, and custom CSS) */}
              <CustomScripts
                headScripts={customCode?.head_scripts}
                bodyStartScripts={customCode?.body_start_scripts}
                bodyEndScripts={customCode?.body_end_scripts}
                customCss={customCode?.custom_css}
              />
              <div className="min-h-screen bg-background">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <ToasterClient />
            </SiteSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
