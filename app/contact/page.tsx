"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { fetchContactPageSettings } from "@/lib/page-settings";
import { resolveAssetUrl } from "@/lib/asset-url";

export default function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    address: "",
  });
  const [page, setPage] = useState({
    title: "Liên hệ",
    subtitle: "",
    banner_url: "",
    map_embed_url: "",
    working_hours: "",
  });

  useEffect(() => {
    async function load() {
      const data = await fetchContactPageSettings();
      setPage(data.contact_page);
      setContact(data.contact);
      setLoading(false);
    }
    load();
  }, []);

  const bannerUrl = useMemo(
    () => resolveAssetUrl(page.banner_url),
    [page.banner_url],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-gray-50">
        <div className="text-slate-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              {page.title}
            </h1>
            {page.subtitle ? (
              <p className="mt-4 text-lg text-slate-600">{page.subtitle}</p>
            ) : null}
            <div className="mt-6 grid gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                <Mail className="mt-1 h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="text-base font-semibold text-slate-900">
                    {contact.email || "Chưa cập nhật"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                <Phone className="mt-1 h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-sm text-slate-500">Điện thoại</div>
                  <div className="text-base font-semibold text-slate-900">
                    {contact.phone || "Chưa cập nhật"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                <MapPin className="mt-1 h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-sm text-slate-500">Địa chỉ</div>
                  <div className="text-base font-semibold text-slate-900">
                    {contact.address || "Chưa cập nhật"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                <Clock className="mt-1 h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-sm text-slate-500">Giờ làm việc</div>
                  <div className="text-base font-semibold text-slate-900">
                    {page.working_hours || "Chưa cập nhật"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt="Contact banner"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-80 w-full bg-gradient-to-r from-orange-200 via-orange-100 to-white" />
            )}
          </div>
        </div>
      </div>

      {/* Google Map - Full width */}
      {page.map_embed_url ? (
        <div className="w-full">
          <iframe
            src={page.map_embed_url}
            className="h-96 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="container pb-12">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Chưa thiết lập bản đồ. Vui lòng cập nhật trong trang cài đặt liên
            hệ.
          </div>
        </div>
      )}
    </div>
  );
}
