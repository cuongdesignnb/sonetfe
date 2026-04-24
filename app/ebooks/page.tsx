"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  ArrowRight,
  Download,
  FileText,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

interface Ebook {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  author_name: string;
  price: string | number;
  original_price: string | number | null;
  total_pages: number | null;
  download_count: number;
  type: string;
  status: string;
  features: string[] | null;
  tags: string[] | null;
  category: { id: number; name: string } | null;
}

type Paginated<T> = { data: T[]; last_page: number; current_page: number };

const tabs = [
  { key: "", label: "Tất cả" },
  { key: "ebook", label: "Ebook" },
  { key: "book", label: "Sách" },
  { key: "guide", label: "Hướng dẫn" },
];

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
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
      if (type) params.set("type", type);
      if (search) params.set("search", search);
      params.set("page", String(page));

      try {
        const res = await fetch(`${apiUrl}/ebooks?${params}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as Paginated<Ebook>;
        if (cancelled) return;
        setEbooks(json.data || []);
        setLastPage(json.last_page || 1);
      } catch {
        if (cancelled) return;
        setEbooks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [type, search, page]);

  function formatPrice(price: string | number) {
    const n = Number(price);
    if (!n) return "Miễn phí";
    return n.toLocaleString("vi-VN") + "₫";
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 py-16">
        <div className="container text-center">
          <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Thư viện số
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Sách & Ebook
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Tài liệu marketing, kinh doanh và phát triển bản thân từ chuyên gia
          </p>
        </div>
      </div>

      <div className="container py-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant={type === t.key ? "default" : "outline"}
                size="sm"
                className={`rounded-full ${
                  type === t.key
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "border-gray-300 text-gray-600"
                }`}
                onClick={() => {
                  setType(t.key);
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
              placeholder="Tìm kiếm ebook..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Ebook Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-pulse"
              >
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Chưa có ebook nào
            </h3>
            <p className="text-gray-500">
              Hãy quay lại sau để xem các ebook mới nhất.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {ebooks.map((ebook) => (
              <motion.div
                key={ebook.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                whileHover={{ y: -4 }}
              >
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  {ebook.thumbnail ? (
                    <img
                      src={ebook.thumbnail}
                      alt={ebook.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                  {ebook.status === "coming_soon" && (
                    <Badge className="absolute top-3 left-3 bg-yellow-500 text-white border-0 text-xs">
                      Sắp ra mắt
                    </Badge>
                  )}
                  {ebook.type && (
                    <Badge className="absolute top-3 right-3 bg-white/90 text-gray-700 border-0 text-xs capitalize">
                      {ebook.type}
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                    {ebook.title}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {ebook.author_name}
                  </p>

                  {/* Features */}
                  {ebook.features && ebook.features.length > 0 && (
                    <ul className="space-y-1 mb-3">
                      {ebook.features.slice(0, 3).map((f, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5"
                        >
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-bold text-red-600">
                      {formatPrice(ebook.price)}
                    </span>
                    {ebook.original_price &&
                      Number(ebook.original_price) > Number(ebook.price) && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(ebook.original_price)}
                        </span>
                      )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    {ebook.total_pages && (
                      <span>{ebook.total_pages} trang</span>
                    )}
                    {ebook.download_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {ebook.download_count.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  <Button
                    className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                    size="sm"
                    asChild
                  >
                    <Link href={`/ebooks/${ebook.slug}`}>
                      Xem chi tiết
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
                  page === p ? "bg-indigo-600 text-white" : ""
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
