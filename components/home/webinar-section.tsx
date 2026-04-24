"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Eye, User, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface Webinar {
  id: number;
  title: string;
  description?: string;
  thumbnail: string | null;
  instructor_name: string;
  scheduled_at: string;
  views_count?: number;
  status: "upcoming" | "completed";
  slug?: string;
}

export function WebinarSection() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "completed">("completed");
  const settings = useSiteSettings();
  const webinarSettings = settings.home.webinar;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";
      try {
        const res = await fetch(`${apiUrl}/webinars?status=${tab}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;
        setWebinars((json.data || []).slice(0, 3));
      } catch {
        if (cancelled) return;
        // Fallback demo data
        setWebinars([
          {
            id: 1,
            title:
              "NOTION - BỘ NÃO THỨ 2 CHO NGƯỜI XÂY THƯƠNG HIỆU & AFFILIATE",
            thumbnail: null,
            instructor_name: "Mrs. Hiền Úi",
            scheduled_at: "2026-03-06T14:00:00",
            views_count: 8100,
            status: "upcoming",
          },
          {
            id: 2,
            title: "HÀNH TRÌNH 10 NGÀY TỪ 0 ĐẾN 1 TRIỆU VIEW",
            thumbnail: null,
            instructor_name: "Nhà Đại Bàng K2001",
            scheduled_at: "2026-03-06T14:00:00",
            views_count: 0,
            status: "upcoming",
          },
          {
            id: 3,
            title: "KHƠI NGUỒN ĐỒNG THU NHẬP THỨ HAI CHỈ VỚI ...0 ĐỒNG",
            thumbnail: null,
            instructor_name: "Nhà Sự Từ 0001",
            scheduled_at: "2026-03-07T10:00:00",
            views_count: 2600,
            status: "upcoming",
          },
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <section className="py-16 bg-white dark:bg-slate-950">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-3 px-4 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 rounded-full">
            <Video className="w-3.5 h-3.5 mr-1.5" />
            {webinarSettings.badge || "Zoom Webinar"}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <span className="text-red-600">&#10022;</span>{" "}
            {webinarSettings.title || "Zoom Webinar miễn phí & trả phí"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {webinarSettings.subtitle ||
              "Tham gia học trực tiếp với chuyên gia"}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          <Button
            variant={tab === "completed" ? "default" : "outline"}
            size="sm"
            className={`rounded-full ${tab === "completed" ? "bg-red-600 hover:bg-red-700 text-white" : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"}`}
            onClick={() => setTab("completed")}
          >
            {webinarSettings.tab_completed || "Đã hoàn thành"}
          </Button>
          <Button
            variant={tab === "upcoming" ? "default" : "outline"}
            size="sm"
            className={`rounded-full ${tab === "upcoming" ? "bg-red-600 hover:bg-red-700 text-white" : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"}`}
            onClick={() => setTab("upcoming")}
          >
            {webinarSettings.tab_upcoming || "Sắp tới"}
          </Button>
        </div>

        {/* Webinar Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 animate-pulse"
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {webinars.map((webinar) => (
              <motion.div
                key={webinar.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                whileHover={{ y: -4 }}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  {webinar.thumbnail ? (
                    <img
                      src={webinar.thumbnail}
                      alt={webinar.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Video className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base mb-3 line-clamp-2 min-h-[2.5rem]">
                    {webinar.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <User className="w-3.5 h-3.5" />
                    <span>{webinar.instructor_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(webinar.scheduled_at)}</span>
                    </div>
                    {webinar.views_count !== undefined &&
                      webinar.views_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{webinar.views_count.toLocaleString()}</span>
                        </div>
                      )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20 mt-auto"
                    asChild
                  >
                    <Link href={`/webinars/${webinar.slug || webinar.id}`}>
                      {webinarSettings.button_detail || "Xem chi tiết"}
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="rounded-full border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
            asChild
          >
            <Link href="/webinars">
              {webinarSettings.button_view_all || "Xem tất cả webinar"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
