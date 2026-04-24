export type PageContent = {
  title: string;
  subtitle: string;
  content: string;
};

export type PagesSettings = {
  support: PageContent;
  faq: PageContent;
  feedback: PageContent;
  terms: PageContent;
  privacy: PageContent;
  refund: PageContent;
};

export type ContactPageSettings = {
  title: string;
  subtitle: string;
  banner_url: string;
  map_embed_url: string;
  working_hours: string;
  form_note: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  address: string;
};

export type FaqItem = {
  id: number;
  course_id: number | null;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
};

const isServer = typeof window === "undefined";
const API_BASE = isServer
  ? process.env.INTERNAL_API_URL?.replace(/\/$/, "") ||
    "https://admin.phamanhchien.vn/api"
  : process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://admin.phamanhchien.vn/api";

export async function fetchPagesSettings(): Promise<PagesSettings> {
  const fallback: PagesSettings = {
    support: { title: "Trung tâm hỗ trợ", subtitle: "", content: "" },
    faq: { title: "Câu hỏi thường gặp", subtitle: "", content: "" },
    feedback: { title: "Góp ý", subtitle: "", content: "" },
    terms: { title: "Điều khoản sử dụng", subtitle: "", content: "" },
    privacy: { title: "Chính sách bảo mật", subtitle: "", content: "" },
    refund: { title: "Chính sách hoàn tiền", subtitle: "", content: "" },
  };

  try {
    const res = await fetch(`${API_BASE}/settings/pages`, {
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { pages?: PagesSettings };
    return { ...fallback, ...(json.pages || {}) };
  } catch {
    return fallback;
  }
}

export async function fetchContactPageSettings(): Promise<{
  contact_page: ContactPageSettings;
  contact: ContactInfo;
}> {
  const fallback = {
    contact_page: {
      title: "Liên hệ",
      subtitle: "",
      banner_url: "",
      map_embed_url: "",
      working_hours: "",
      form_note: "",
    },
    contact: {
      email: "",
      phone: "",
      address: "",
    },
  };

  try {
    const res = await fetch(`${API_BASE}/settings/contact-page`, {
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as {
      contact_page?: ContactPageSettings;
      contact?: ContactInfo;
    };
    return {
      contact_page: { ...fallback.contact_page, ...(json.contact_page || {}) },
      contact: { ...fallback.contact, ...(json.contact || {}) },
    };
  } catch {
    return fallback;
  }
}

export async function fetchFaqs(courseId?: number | null): Promise<FaqItem[]> {
  const qs = new URLSearchParams();
  if (typeof courseId === "number") {
    qs.set("course_id", String(courseId));
  }

  try {
    const res = await fetch(
      `${API_BASE}/faqs${qs.toString() ? `?${qs}` : ""}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: FaqItem[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}
