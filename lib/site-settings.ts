import { siteConfig } from "@/config/site";

export type SiteSettings = {
  site: {
    name: string;
    description: string;
    url: string;
    logo_url: string;
    favicon_url: string;
    contact: {
      email: string;
      phone: string;
      address: string;
    };
    social: {
      facebook: string;
      youtube: string;
      instagram: string;
      tiktok: string;
      linkedin: string;
      twitter: string;
    };
  };
  footer: {
    description: string;
    copyright_text: string;
    tagline: string;
    show_social_links: boolean;
    links: {
      courses: Array<{ name: string; href: string }>;
      support: Array<{ name: string; href: string }>;
      legal: Array<{ name: string; href: string }>;
    };
  };
  seo: {
    title_template: string;
    default_title: string;
    default_description: string;
    keywords: string;
  };
  home: {
    hero: {
      badge: string;
      title_prefix: string;
      title_highlight: string;
      title_suffix: string;
      subtitle: string;
      primary_cta: string;
      secondary_cta: string;
    };
    stats: {
      courses: number;
      students: number;
      certificates: number;
      countries: number;
      rating: number;
      label_students: string;
      label_courses: string;
      label_certificates: string;
      label_countries: string;
    };
    cta: {
      title_prefix: string;
      title_highlight: string;
      title_suffix: string;
      subtitle: string;
      primary_cta: string;
      secondary_cta: string;
    };
    featured: {
      title: string;
      subtitle: string;
      button_text: string;
    };
    webinar: {
      badge: string;
      title: string;
      subtitle: string;
      tab_upcoming: string;
      tab_completed: string;
      button_detail: string;
      button_view_all: string;
    };
    affiliate: {
      title: string;
      description: string;
      button_text: string;
    };
  };
  custom_code?: {
    head_scripts?: string;
    body_start_scripts?: string;
    body_end_scripts?: string;
    custom_css?: string;
  };
  menus?: MenuItem[];
};

export type MenuItem = {
  id: number;
  title: string;
  url: string;
  target: string;
  icon: string | null;
  position: number;
  is_active: boolean;
  children?: MenuItem[];
};

export type SiteSettingsResponse = {
  settings: SiteSettings;
};

export function getDefaultSiteSettings(): SiteSettings {
  return {
    site: {
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      logo_url: siteConfig.logo.src,
      favicon_url: siteConfig.favicon,
      contact: {
        email: siteConfig.contact.email,
        phone: siteConfig.contact.phone,
        address: siteConfig.contact.address,
      },
      social: {
        facebook: siteConfig.social.facebook,
        youtube: siteConfig.social.youtube,
        instagram: siteConfig.social.instagram,
        tiktok: siteConfig.social.tiktok,
        linkedin: siteConfig.social.linkedin,
        twitter: siteConfig.social.twitter,
      },
    },
    footer: {
      description:
        "Cung cấp các khóa học chất lượng cao với công nghệ streaming video tiên tiến.",
      copyright_text: `© ${new Date().getFullYear()} ${siteConfig.name}. Tất cả quyền được bảo lưu.`,
      tagline: "Made with ❤ in Vietnam",
      show_social_links: true,
      links: {
        courses: siteConfig.navigation.footer.courses,
        support: siteConfig.navigation.footer.support,
        legal: siteConfig.navigation.footer.legal,
      },
    },
    seo: {
      title_template: siteConfig.seo.titleTemplate,
      default_title: siteConfig.seo.defaultTitle,
      default_description: siteConfig.seo.defaultDescription,
      keywords: siteConfig.seo.keywords.join(", "),
    },
    home: {
      hero: {
        badge: "Nền tảng học online #1 Việt Nam",
        title_prefix: "Học Marketing Thực Chiến",
        title_highlight: "",
        title_suffix: "Từ Chuyên Gia Hàng Đầu",
        subtitle:
          "Khóa học & Sách từ những người đã làm được, không chỉ lý thuyết suông",
        primary_cta: "Khám phá khóa học",
        secondary_cta: "Webinar miễn phí",
      },
      stats: {
        courses: siteConfig.stats.courses,
        students: siteConfig.stats.students,
        certificates: siteConfig.stats.certificates,
        countries: siteConfig.stats.countries,
        rating: siteConfig.stats.rating,
        label_students: "Học viên",
        label_courses: "Khóa học",
        label_certificates: "Ebooks",
        label_countries: "Sách xuất bản",
      },
      cta: {
        title_prefix: "Sẵn sàng bắt đầu",
        title_highlight: "hành trình",
        title_suffix: "học tập?",
        subtitle:
          "Tham gia cùng hàng nghìn học viên đã thành công trong lĩnh vực Marketing",
        primary_cta: "Khám phá khóa học ngay",
        secondary_cta: "Xem khóa học",
      },
      featured: {
        title: "Khóa học, Sách & Ebooks nổi bật",
        subtitle: "Được thiết kế bởi các chuyên gia hàng đầu, phù hợp cho mọi trình độ",
        button_text: "TÌM HIỂU NGAY",
      },
      webinar: {
        badge: "Zoom Webinar",
        title: "Zoom Webinar miễn phí & trả phí",
        subtitle: "Tham gia học trực tiếp với chuyên gia",
        tab_upcoming: "Sắp tới",
        tab_completed: "Đã hoàn thành",
        button_detail: "Xem chi tiết",
        button_view_all: "Xem tất cả webinar",
      },
      affiliate: {
        title: "Chương trình Affiliate - Xây dựng nguồn thu nhập thứ 2!",
        description: "Nhận hoa hồng lên đến 85% khi giới thiệu khách hàng mua khóa học",
        button_text: "Tìm hiểu thêm",
      },
    },
    custom_code: {
      head_scripts: "",
      body_start_scripts: "",
      body_end_scripts: "",
      custom_css: "",
    },
    menus: [],
  };
}

export function mergeSiteSettings(
  base: SiteSettings,
  overrides?: Partial<SiteSettings>,
): SiteSettings {
  if (!overrides) return base;
  return {
    site: {
      ...base.site,
      ...overrides.site,
      contact: {
        ...base.site.contact,
        ...(overrides.site?.contact || {}),
      },
      social: {
        ...base.site.social,
        ...(overrides.site?.social || {}),
      },
    },
    footer: {
      ...base.footer,
      ...overrides.footer,
      links: {
        courses: overrides.footer?.links?.courses || base.footer.links.courses,
        support: overrides.footer?.links?.support || base.footer.links.support,
        legal: overrides.footer?.links?.legal || base.footer.links.legal,
      },
    },
    seo: {
      ...base.seo,
      ...overrides.seo,
    },
    home: {
      hero: {
        ...base.home.hero,
        ...(overrides.home?.hero || {}),
      },
      stats: {
        ...base.home.stats,
        ...(overrides.home?.stats || {}),
      },
      cta: {
        ...base.home.cta,
        ...(overrides.home?.cta || {}),
      },
      featured: {
        ...base.home.featured,
        ...(overrides.home?.featured || {}),
      },
      webinar: {
        ...base.home.webinar,
        ...(overrides.home?.webinar || {}),
      },
      affiliate: {
        ...base.home.affiliate,
        ...(overrides.home?.affiliate || {}),
      },
    },
    custom_code: base.custom_code
      ? {
          head_scripts:
            overrides.custom_code?.head_scripts ??
            base.custom_code.head_scripts,
          body_start_scripts:
            overrides.custom_code?.body_start_scripts ??
            base.custom_code.body_start_scripts,
          body_end_scripts:
            overrides.custom_code?.body_end_scripts ??
            base.custom_code.body_end_scripts,
          custom_css:
            overrides.custom_code?.custom_css ?? base.custom_code.custom_css,
        }
      : undefined,
    menus: overrides.menus ?? base.menus,
  };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const base = getDefaultSiteSettings();

  // Use internal URL for server-side (SSR) to bypass Next.js rewrite
  // INTERNAL_API_URL connects directly to Laravel backend
  const isServer = typeof window === "undefined";

  // For server-side, try multiple URLs in order of priority
  const getApiUrls = (): string[] => {
    if (!isServer) {
      return [
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
          "https://admin.phamanhchien.vn/api",
      ];
    }

    const urls: string[] = [];

    // 1. Use INTERNAL_API_URL if set
    if (process.env.INTERNAL_API_URL) {
      urls.push(process.env.INTERNAL_API_URL.replace(/\/$/, ""));
    }

    // 2. Try localhost with common Laravel ports
    urls.push("http://127.0.0.1:8000/api");
    urls.push("http://localhost:8000/api");

    // 3. Fallback to public URL
    urls.push("https://admin.phamanhchien.vn/api");

    return urls;
  };

  const apiUrls = getApiUrls();

  for (const apiBase of apiUrls) {
    try {
      const [settingsRes, menusRes] = await Promise.all([
        fetch(`${apiBase}/settings`, {
          cache: "no-store",
          // @ts-expect-error - Node.js specific option to disable SSL verification for self-signed certs
          rejectUnauthorized: false,
        }),
        fetch(`${apiBase}/menus`, {
          cache: "no-store",
          // @ts-expect-error - Node.js specific option
          rejectUnauthorized: false,
        }).catch(() => null),
      ]);
      if (!settingsRes.ok) continue;
      const json = (await settingsRes.json()) as SiteSettingsResponse;
      const menusJson = menusRes?.ok ? await menusRes.json() : null;
      const merged = mergeSiteSettings(base, json.settings);
      if (menusJson?.menus?.length) {
        merged.menus = menusJson.menus;
      }
      return merged;
    } catch {
      // Try next URL
      continue;
    }
  }

  return base;
}

export function splitKeywords(value: string): string[] {
  return value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}
