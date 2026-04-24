"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getApiUrl } from "@/lib/api-config";
import { resolveAssetUrl } from "@/lib/asset-url";
import { formatPrice, stripHtml } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";

type ProductType = "course" | "ebook";

type CourseMarketing = {
  what_you_learn?: string[];
  hero?: {
    bullets?: string[];
  };
};

interface CourseApiProduct {
  id: number;
  slug?: string;
  title: string;
  description: string;
  price: string | number;
  original_price?: string | number | null;
  thumbnail: string | null;
  category: {
    name: string;
    slug?: string;
  };
  marketing?: CourseMarketing | null;
  total_enrollments?: number | null;
  created_at?: string;
  badge_text?: string | null;
  badge_color?: string | null;
  status?: string;
}

interface EbookApiProduct {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: string | number;
  original_price?: string | number | null;
  thumbnail: string | null;
  category?: {
    name: string;
    slug?: string;
  } | null;
  type: "ebook" | "book" | "guide";
  features?: string[] | null;
  status?: string;
  download_count?: number | null;
  created_at?: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: string | number;
  original_price?: string | number | null;
  thumbnail: string | null;
  category: {
    name: string;
    slug?: string;
  };
  type: ProductType;
  href: string;
  features?: string[];
  status?: string;
  sale_label?: string | null;
  badge_text?: string | null;
  badge_color?: string | null;
  total_enrollments?: number | null;
  download_count?: number | null;
  created_at?: string;
}

type Paginated<T> = {
  data: T[];
};

const tabs: Array<{ key: ProductType; label: string; icon: string }> = [
  { key: "course", label: "Khóa học", icon: "🎓" },
  { key: "ebook", label: "Sách & Ebooks", icon: "📚" },
];

function extractCourseFeatures(marketing?: CourseMarketing | null): string[] {
  if (!marketing) return [];
  if (Array.isArray(marketing.what_you_learn)) {
    return marketing.what_you_learn.filter(Boolean);
  }
  if (Array.isArray(marketing.hero?.bullets)) {
    return marketing.hero.bullets.filter(Boolean);
  }
  return [];
}

function buildSaleLabel(
  originalPrice?: string | number | null,
  price?: string | number,
) {
  const oldValue = Number(originalPrice ?? 0);
  const newValue = Number(price ?? 0);
  if (!oldValue || oldValue <= newValue || newValue < 0) return null;
  const discountPercent = Math.round(((oldValue - newValue) / oldValue) * 100);
  return discountPercent > 0 ? `-${discountPercent}%` : null;
}

function mapCourseToProduct(course: CourseApiProduct): Product {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    original_price: course.original_price ?? null,
    thumbnail: resolveAssetUrl(course.thumbnail),
    category: course.category || { name: "Khóa học" },
    type: "course",
    href: `/courses/${course.slug || course.id}`,
    features: extractCourseFeatures(course.marketing).slice(0, 3),
    status: course.status || "published",
    sale_label: buildSaleLabel(course.original_price, course.price),
    badge_text: course.badge_text ?? null,
    badge_color: course.badge_color ?? null,
    total_enrollments: course.total_enrollments ?? null,
    created_at: course.created_at,
  };
}

function mapEbookToProduct(ebook: EbookApiProduct): Product {
  return {
    id: ebook.id,
    title: ebook.title,
    description: ebook.description,
    price: ebook.price,
    original_price: ebook.original_price ?? null,
    thumbnail: resolveAssetUrl(ebook.thumbnail),
    category: ebook.category || { name: "Sách & Ebooks" },
    type: "ebook",
    href: `/ebooks/${ebook.slug}`,
    features: Array.isArray(ebook.features) ? ebook.features.slice(0, 3) : [],
    status: ebook.status || "published",
    sale_label: buildSaleLabel(ebook.original_price, ebook.price),
    badge_text: null,
    badge_color: null,
    total_enrollments: null,
    download_count: ebook.download_count ?? null,
    created_at: ebook.created_at,
  };
}

export function FeaturedCourses() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProductType>("course");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const settings = useSiteSettings();
  const featured = settings.home.featured;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const apiUrl = getApiUrl();
      try {
        const [coursesResult, ebooksResult] = await Promise.allSettled([
          fetch(
            `${apiUrl}/courses?sort=sort_order&order=asc&per_page=100&page=1`,
            {
              cache: "no-store",
            },
          ),
          fetch(
            `${apiUrl}/ebooks?sort=created_at&order=desc&per_page=100&page=1`,
            {
              cache: "no-store",
            },
          ),
        ]);

        const normalized: Product[] = [];

        if (coursesResult.status === "fulfilled" && coursesResult.value.ok) {
          const json =
            (await coursesResult.value.json()) as Paginated<CourseApiProduct>;
          normalized.push(...(json.data || []).map(mapCourseToProduct));
        }

        if (ebooksResult.status === "fulfilled" && ebooksResult.value.ok) {
          const json =
            (await ebooksResult.value.json()) as Paginated<EbookApiProduct>;
          normalized.push(...(json.data || []).map(mapEbookToProduct));
        }

        if (cancelled) return;
        setProducts(normalized);
      } catch {
        if (cancelled) return;
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = products.filter((p) => p.type === activeTab);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-slate-900">
        <div className="container">
          <div className="text-center mb-10">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 animate-pulse shadow-sm"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {featured.title || "Khóa học, Sách & Ebooks nổi bật"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-2xl mx-auto">
            {featured.subtitle ||
              "Được thiết kế bởi các chuyên gia hàng đầu, phù hợp cho mọi trình độ"}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((t) => {
            const count = products.filter((p) => p.type === t.key).length;
            return (
              <Button
                key={t.key}
                variant={activeTab === t.key ? "default" : "outline"}
                size="sm"
                className={`rounded-full text-sm ${
                  activeTab === t.key
                    ? "bg-red-600 hover:bg-red-700 text-white border-0"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-slate-800"
                }`}
                onClick={() => {
                  setActiveTab(t.key);
                  setCurrentPage(1);
                }}
              >
                <span className="mr-1.5">{t.icon}</span>
                {t.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {visibleProducts.map((product) => (
            <motion.div
              key={`${product.type}-${product.id}`}
              className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col"
              whileHover={{ y: -4 }}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden relative flex-shrink-0">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <span className="text-white/50 text-sm">Ảnh sản phẩm</span>
                  </div>
                )}
                {/* Badge text (left) */}
                {product.badge_text && (
                  <Badge
                    className={`absolute top-3 left-3 text-white border-0 text-xs font-semibold ${
                      product.badge_color === "blue"
                        ? "bg-blue-600"
                        : product.badge_color === "green"
                          ? "bg-green-600"
                          : product.badge_color === "orange"
                            ? "bg-orange-500"
                            : product.badge_color === "purple"
                              ? "bg-purple-600"
                              : "bg-red-600"
                    }`}
                  >
                    {product.badge_text}
                  </Badge>
                )}
                {/* Discount badge (right) */}
                {product.sale_label && (
                  <Badge className="absolute top-3 right-3 bg-red-600 text-white border-0 text-xs font-semibold">
                    {product.sale_label}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Category + Rating */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                    {product.category?.name || "Khóa học"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      4.9
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2 min-h-[3rem]">
                  {product.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                  {stripHtml(product.description || "")}
                </p>

                {/* Pricing */}
                <div className="flex items-center gap-3 mb-3 min-h-[1.75rem]">
                  {product.original_price &&
                    Number(product.original_price) > Number(product.price) && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(Number(product.original_price))}
                      </span>
                    )}
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {Number(product.price) === 0
                      ? "MIỄN PHÍ"
                      : formatPrice(Number(product.price))}
                  </span>
                  {product.sale_label && (
                    <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-0 text-xs font-semibold">
                      {product.sale_label}
                    </Badge>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-1.5 mb-4 min-h-[5.25rem]">
                  {product.features && product.features.length > 0
                    ? product.features.slice(0, 3).map((feat, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))
                    : Array.from({ length: 3 }).map((_, i) => (
                        <li key={i} className="h-[1.25rem]" />
                      ))}
                </ul>

                {/* CTA Button - pushed to bottom */}
                <div className="mt-auto">
                  {product.status === "coming_soon" ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-orange-400 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-900/20 font-bold text-sm"
                      disabled
                    >
                      COMING SOON
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm"
                      asChild
                    >
                      <Link href={product.href}>
                        {featured.button_text || "TÌM HIỂU NGAY"}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {!loading && visibleProducts.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Chưa có dữ liệu cho mục này từ API.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-9 h-9 p-0"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === safePage ? "default" : "outline"}
                size="sm"
                className={`rounded-full w-9 h-9 p-0 text-sm ${
                  page === safePage
                    ? "bg-red-600 hover:bg-red-700 text-white border-0"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-9 h-9 p-0"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
