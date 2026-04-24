"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Video, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Webinar {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  instructor_name: string;
  scheduled_at: string;
  duration_minutes: number | null;
  views_count: number;
  status: string;
  is_free: boolean;
  price: string | number;
}

type Paginated<T> = { data: T[]; last_page: number; current_page: number };

export default function WebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("completed");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";
      const params = new URLSearchParams();
      if (tab) params.set("status", tab);
      if (search) params.set("search", search);
      params.set("page", String(page));

      try {
        const res = await fetch(`${apiUrl}/webinars?${params}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as Paginated<Webinar>;
        if (cancelled) return;
        setWebinars(json.data || []);
        setLastPage(json.last_page || 1);
      } catch {
        if (cancelled) return;
        setWebinars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tab, search, page]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-500 py-16">
        <div className="container text-center">
          <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
            <Video className="w-4 h-4 mr-2" />
            Zoom Webinar
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Zoom Webinar miễn phí & trả phí
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Tham gia học trực tiếp với chuyên gia hàng đầu trong lĩnh vực
            Marketing
          </p>
        </div>
      </div>

      <div className="container py-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            {[
              { key: "completed", label: "Đã hoàn thành" },
              { key: "upcoming", label: "Sắp tới" },
            ].map((t) => (
              <Button
                key={t.key}
                variant={tab === t.key ? "default" : "outline"}
                size="sm"
                className={`rounded-full ${
                  tab === t.key
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-gray-300 text-gray-600"
                }`}
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
              >
                {t.label}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm webinar..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Webinar Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-pulse"
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : webinars.length === 0 ? (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Chưa có webinar nào
            </h3>
            <p className="text-gray-500">
              Hãy quay lại sau để xem các webinar mới nhất.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {webinars.map((webinar) => (
              <motion.div
                key={webinar.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full"
                whileHover={{ y: -4 }}
              >
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
                  {webinar.is_free ? (
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white border-0 text-xs">
                      Miễn phí
                    </Badge>
                  ) : (
                    <Badge className="absolute top-3 left-3 bg-orange-600 text-white border-0 text-xs">
                      Trả phí
                    </Badge>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-3 line-clamp-2 min-h-[3rem]">
                    {webinar.title}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">
                    {webinar.description || ""}
                  </p>

                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{webinar.instructor_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(webinar.scheduled_at)}</span>
                      </div>
                      {webinar.views_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{webinar.views_count.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white mt-auto"
                    asChild
                  >
                    <Link href={`/webinars/${webinar.slug}`}>
                      Xem chi tiết
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "outline"}
                size="sm"
                className={`rounded-full w-10 h-10 ${
                  page === p ? "bg-red-600 text-white" : ""
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
