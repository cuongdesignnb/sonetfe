"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, stripHtml } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/asset-url";
import { BookOpen, Users, Star } from "lucide-react";

type CategoryResponse = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image?: string | null;
  courses: Array<{
    id: number;
    slug?: string;
    title: string;
    description: string;
    price: string | number;
    level: string;
    thumbnail?: string | null;
    category: { id: number; name: string; slug: string };
    instructor: { id: number; name: string };
    lessons_count?: number;
    enrolled_count?: number;
  }>;
};

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

function CourseCard({
  course,
}: {
  course: CategoryResponse["courses"][number];
}) {
  const thumbnailUrl =
    resolveAssetUrl(course.thumbnail) || "/images/course-placeholder.svg";

  return (
    <Card className="group h-full flex flex-col overflow-hidden border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
      <Link
        href={`/courses/${course.slug || course.id}`}
        className="relative block overflow-hidden aspect-video bg-gray-100"
      >
        <Image
          src={thumbnailUrl}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3">
          <Badge
            className={`${Number(course.price) === 0 ? "bg-green-500" : "bg-orange-500"} text-white border-0 shadow-lg`}
          >
            {Number(course.price) === 0
              ? "Miễn phí"
              : formatPrice(Number(course.price))}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge
            className={`${getLevelBadgeColor(course.level)} border shadow-sm`}
          >
            {getLevelLabel(course.level)}
          </Badge>
        </div>
      </Link>

      <CardContent className="flex-1 p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            {course.category?.name || "Chưa phân loại"}
          </span>
        </div>
        <Link href={`/courses/${course.slug || course.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {stripHtml(course.description || "Chưa có mô tả")}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="w-full space-y-3">
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
              <span className="text-gray-600">4.8</span>
            </div>
          </div>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            <Link href={`/courses/${course.slug || course.id}`}>
              Xem chi tiết
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/categories/${params.id}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as CategoryResponse;
        if (cancelled) return;
        setCategory(json);
      } catch {
        if (!cancelled) setCategory(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-10 text-muted-foreground">Đang tải…</div>
    );
  }

  if (!category) {
    return (
      <div className="container py-10">
        <div className="text-muted-foreground">Không tải được danh mục.</div>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/categories">Quay lại</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description ? (
            <div
              className="rich-text mt-1"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          ) : null}
        </div>
        <Button asChild variant="outline">
          <Link href="/categories">Danh mục</Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-muted">
        <div className="relative aspect-[16/6]">
          <Image
            src={
              resolveAssetUrl(category.image) ||
              "/images/category-placeholder.svg"
            }
            alt={category.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(category.courses || []).map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}

        {category.courses.length === 0 ? (
          <div className="text-muted-foreground">
            Chưa có khóa học trong danh mục này.
          </div>
        ) : null}
      </div>
    </div>
  );
}
