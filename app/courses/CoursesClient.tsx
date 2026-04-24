"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice, stripHtml } from "@/lib/utils";
import {
  Search,
  BookOpen,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Course = {
  id: number;
  slug?: string;
  title: string;
  description: string;
  price: string | number;
  level: string;
  status?: string;
  thumbnail: string | null;
  category: { id: number; name: string; slug: string };
  instructor: { id: number; name: string };
  lessons_count?: number;
  enrolled_count?: number;
  duration?: string;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const levelOptions = [
  { value: "", label: "Tất cả cấp độ" },
  { value: "beginner", label: "Người mới" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
];

const priceOptions = [
  { value: "", label: "Tất cả giá" },
  { value: "free", label: "Miễn phí" },
  { value: "paid", label: "Có phí" },
];

const sortOptions = [
  { value: "sort_order-asc", label: "Mặc định" },
  { value: "created_at-desc", label: "Mới nhất" },
  { value: "created_at-asc", label: "Cũ nhất" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
  { value: "title-asc", label: "A → Z" },
];

function getLevelBadgeColor(level: string) {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-700 border-green-200";
    case "intermediate":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "advanced":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getLevelLabel(level: string) {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "Người mới";
    case "intermediate":
      return "Trung cấp";
    case "advanced":
      return "Nâng cao";
    default:
      return level || "Tất cả";
  }
}

// Course Card Component
function CourseCard({ course, index }: { course: Course; index: number }) {
  const thumbnailUrl = course.thumbnail || "/images/course-placeholder.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col overflow-hidden border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
        {/* Thumbnail */}
        <Link
          href={`/courses/${course.slug || course.id}`}
          className="relative block overflow-hidden aspect-video bg-gray-100"
        >
          <Image
            src={thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            quality={90}
            unoptimized={
              !/^https?:\/\/(admin\.phamanhchien\.vn|phamanhchien\.vn|.*\.bunnycdn\.com|picsum\.photos|localhost)/i.test(
                thumbnailUrl,
              ) && /^https?:\/\//i.test(thumbnailUrl)
            }
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <Badge
              className={`${Number(course.price) === 0 ? "bg-green-500" : "bg-orange-500"} text-white border-0 shadow-lg`}
            >
              {Number(course.price) === 0
                ? "Miễn phí"
                : formatPrice(Number(course.price))}
            </Badge>
          </div>

          {/* Level badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <Badge
              className={`${getLevelBadgeColor(course.level)} border shadow-sm`}
            >
              {getLevelLabel(course.level)}
            </Badge>
            {course.status === "coming_soon" && (
              <Badge className="bg-blue-500 text-white border-0 shadow-sm">
                Sắp diễn ra
              </Badge>
            )}
          </div>
        </Link>

        {/* Content */}
        <CardContent className="flex-1 p-4">
          {/* Category */}
          <div className="mb-2">
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {course.category?.name || "Chưa phân loại"}
            </span>
          </div>

          {/* Title */}
          <Link href={`/courses/${course.slug || course.id}`}>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {stripHtml(course.description || "Chưa có mô tả")}
          </p>
        </CardContent>

        {/* Footer with stats */}
        <CardFooter className="p-4 pt-0 mt-auto">
          <div className="w-full space-y-3">
            {/* Stats row */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                {course.lessons_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.lessons_count} bài
                  </span>
                )}
                {course.enrolled_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.enrolled_count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-gray-600">4.9</span>
              </div>
            </div>

            {/* CTA Button */}
            {course.status === "coming_soon" ? (
              <Button
                disabled
                className="w-full border-2 border-blue-400 bg-blue-50 text-blue-600 cursor-not-allowed hover:bg-blue-50"
              >
                Sắp diễn ra
              </Button>
            ) : (
              <Button
                asChild
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Link href={`/courses/${course.slug || course.id}`}>
                  Xem chi tiết
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Skeleton Card for Loading
function SkeletonCard() {
  return (
    <Card className="h-full flex flex-col overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <CardContent className="flex-1 p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full h-10 bg-gray-200 rounded" />
      </CardFooter>
    </Card>
  );
}

export default function CoursesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const categorySlug = searchParams.get("category") || "";
  const levelParam = searchParams.get("level") || "";
  const priceParam = searchParams.get("price") || "";
  const searchParam = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "sort_order-asc";
  const pageParam = Number(searchParams.get("page") || 1) || 1;

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const page = pageParam;
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Build API URL
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";
  const coursesUrl = useMemo(() => {
    const qs = new URLSearchParams();
    const [sortField, sortOrder] = sortParam.split("-");
    qs.set("sort", sortField || "created_at");
    qs.set("order", sortOrder || "desc");
    qs.set("page", String(page));
    if (categorySlug) qs.set("category", categorySlug);
    if (levelParam) qs.set("level", levelParam);
    if (priceParam) qs.set("price", priceParam);
    if (searchParam) qs.set("search", searchParam);
    return `${apiUrl}/courses?${qs.toString()}`;
  }, [categorySlug, levelParam, priceParam, searchParam, sortParam, page]);

  // Update URL helper
  const updateUrl = (updates: Record<string, string>) => {
    const qs = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) qs.set(key, value);
      else qs.delete(key);
    });
    qs.delete("page"); // Reset page when filters change
    const url = qs.toString() ? `/courses?${qs.toString()}` : "/courses";
    router.replace(url);
  };

  // Search handler
  const handleSearch = () => {
    updateUrl({ q: searchQuery });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    router.replace("/courses");
  };

  // Check if any filter is active
  const hasActiveFilters =
    categorySlug || levelParam || priceParam || searchParam;

  // Fetch data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [catsRes, coursesRes] = await Promise.all([
          fetch(`${apiUrl}/categories?flat=1`, { cache: "no-store" }),
          fetch(coursesUrl, { cache: "no-store" }),
        ]);

        const catsJson = (await catsRes.json()) as Category[];
        const coursesJson = (await coursesRes.json()) as Paginated<Course>;

        if (cancelled) return;
        setCategories(catsJson || []);
        setCourses(coursesJson.data || []);
        // page comes from URL param
        setLastPage(coursesJson.last_page || 1);
        setTotal(coursesJson.total || 0);
      } catch {
        if (cancelled) return;
        setCategories([]);
        setCourses([]);
        setLastPage(1);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [coursesUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Khám phá Khóa học
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Hàng trăm khóa học chất lượng cao giúp bạn nâng cao kỹ năng và
              phát triển sự nghiệp
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-12 rounded-full bg-white text-gray-900 border-0 shadow-lg"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="h-12 px-6 rounded-full bg-white text-orange-600 hover:bg-gray-100 shadow-lg"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>

            {/* Desktop filters */}
            <div
              className={`${showFilters ? "flex" : "hidden"} md:flex flex-wrap items-center gap-3`}
            >
              {/* Category filter */}
              <select
                className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-orange-500 focus:ring-orange-500"
                value={categorySlug}
                onChange={(e) => updateUrl({ category: e.target.value })}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Level filter */}
              <select
                className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-orange-500 focus:ring-orange-500"
                value={levelParam}
                onChange={(e) => updateUrl({ level: e.target.value })}
              >
                {levelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Price filter */}
              <select
                className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-orange-500 focus:ring-orange-500"
                value={priceParam}
                onChange={(e) => updateUrl({ price: e.target.value })}
              >
                {priceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-orange-500 focus:ring-orange-500"
              value={sortParam}
              onChange={(e) => updateUrl({ sort: e.target.value })}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* View mode toggle */}
            <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-orange-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-orange-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchParam && (
              <Badge variant="secondary" className="gap-1">
                Tìm: &quot;{searchParam}&quot;
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateUrl({ q: "" })}
                />
              </Badge>
            )}
            {categorySlug && (
              <Badge variant="secondary" className="gap-1">
                {categories.find((c) => c.slug === categorySlug)?.name ||
                  categorySlug}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateUrl({ category: "" })}
                />
              </Badge>
            )}
            {levelParam && (
              <Badge variant="secondary" className="gap-1">
                {getLevelLabel(levelParam)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateUrl({ level: "" })}
                />
              </Badge>
            )}
            {priceParam && (
              <Badge variant="secondary" className="gap-1">
                {priceParam === "free" ? "Miễn phí" : "Có phí"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateUrl({ price: "" })}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? (
              "Đang tải..."
            ) : (
              <>
                Tìm thấy{" "}
                <span className="font-semibold text-gray-900">{total}</span>{" "}
                khóa học
              </>
            )}
          </p>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy khóa học
            </h3>
            <p className="text-gray-600 mb-6">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button onClick={clearFilters} variant="outline">
              Xóa bộ lọc
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${categorySlug}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
            >
              {courses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!loading && lastPage > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-12"
          >
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => {
                const qs = new URLSearchParams(searchParams.toString());
                qs.set("page", String(Math.max(1, page - 1)));
                router.replace(`/courses?${qs.toString()}`);
              }}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                let pageNum: number;
                if (lastPage <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= lastPage - 2) {
                  pageNum = lastPage - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className={
                      page === pageNum
                        ? "bg-orange-500 hover:bg-orange-600"
                        : ""
                    }
                    onClick={() => {
                      const qs = new URLSearchParams(searchParams.toString());
                      qs.set("page", String(pageNum));
                      router.replace(`/courses?${qs.toString()}`);
                    }}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              disabled={page >= lastPage}
              onClick={() => {
                const qs = new URLSearchParams(searchParams.toString());
                qs.set("page", String(Math.min(lastPage, page + 1)));
                router.replace(`/courses?${qs.toString()}`);
              }}
              className="gap-1"
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
