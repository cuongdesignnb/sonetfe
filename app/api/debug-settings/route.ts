import { NextResponse } from "next/server";
import { fetchSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await fetchSiteSettings();

  // Test multiple URLs to find which one works
  const testUrls = [
    process.env.INTERNAL_API_URL || "NOT_SET",
    "http://127.0.0.1:8000/api",
    "http://localhost:8000/api",
    "https://admin.phamanhchien.vn/api",
  ];

  const urlResults: Array<{
    url: string;
    status?: number;
    ok?: boolean;
    error?: string;
    data?: { site_name?: string };
  }> = [];

  for (const url of testUrls) {
    if (url === "NOT_SET") {
      urlResults.push({ url, error: "NOT_SET" });
      continue;
    }
    try {
      const res = await fetch(`${url}/settings`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        urlResults.push({
          url,
          status: res.status,
          ok: true,
          data: { site_name: json.settings?.site?.name },
        });
      } else {
        urlResults.push({
          url,
          status: res.status,
          ok: false,
        });
      }
    } catch (e: unknown) {
      urlResults.push({
        url,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    env: {
      INTERNAL_API_URL: process.env.INTERNAL_API_URL || "NOT_SET",
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "NOT_SET",
    },
    urlTests: urlResults,
    settingsResult: {
      name: settings.site.name,
      logo_url: settings.site.logo_url,
      favicon_url: settings.site.favicon_url,
    },
  });
}
